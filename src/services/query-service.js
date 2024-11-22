/* eslint-disable @typescript-eslint/await-thenable */
import {
  ChatPromptTemplate,
  MessagesPlaceholder
} from '@langchain/core/prompts'
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents'
import { createRetrievalChain } from 'langchain/chains/retrieval'
import { createHistoryAwareRetriever } from 'langchain/chains/history_aware_retriever'
// import { BaseMessage } from '@langchain/core/messages'
// import { AzureAISearchVectorStore } from '~/src/lib/azure-vector-store.js'
import { AzureAISearchVectorStore } from '@langchain/community/vectorstores/azure_aisearch'
import { config } from '~/src/config/index.js'
import { trackFetchResponseFailed } from '~/src/lib/events.js'
import { getPrompt } from '~/src/domain/prompt.js'
import { searchCache, uploadToCache } from './ai-search-service.js'
import { validateResponseLinks } from '~/src/utils/validators.js'
import {
  getOpenAIClient,
  getEmbeddingClient
} from '~/src/lib/open-ai-client.js'

const runFetchAnswerQuery = async ({
  query,
  chatHistory,
  summariesMode,
  embeddings,
  model,
  retryCount
}) => {
  try {
    const vectorStoreKey = summariesMode ? 'summaryIndexName' : 'indexName'
    const itemsToCheck = summariesMode ? 40 : 20
    const promptText = getPrompt(summariesMode)

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', promptText],
      new MessagesPlaceholder('chat_history'),
      ['user', '{input}']
    ])

    const documentChain = await createStuffDocumentsChain({
      llm: model,
      prompt
    })

    const vectorStore = new AzureAISearchVectorStore(embeddings, {
      endpoint: config.get('azureOpenAI.searchUrl'),
      indexName: config.get(`azureOpenAI.${vectorStoreKey}`),
      key: config.get('azureOpenAI.searchApiKey'),
      search: {
        type: 'similarity'
      }
    })

    const retriever = vectorStore.asRetriever(itemsToCheck, {
      includeEmbeddings: true
    })

    const historyRetrieverPrompt = ChatPromptTemplate.fromMessages([
      new MessagesPlaceholder('chat_history'),
      ['user', '{input}'],
      [
        'user',
        'Given the above conversation, generate a search query to look up in order to get information relevant to the conversation'
      ]
    ])

    const historyAwareRetriever = await createHistoryAwareRetriever({
      llm: model,
      retriever,
      rephrasePrompt: historyRetrieverPrompt
    })

    const retrievalChain = await createRetrievalChain({
      combineDocsChain: documentChain,
      retriever: historyAwareRetriever
    })

    const response = await retrievalChain.invoke({
      chat_history: chatHistory,
      input: query
    })

    const hallucinated = !validateResponseLinks(response, query)

    return { response, hallucinated }
  } catch (error) {
    trackFetchResponseFailed({
      errorMessage: error.message,
      requestQuery: query,
      retryCount
    })
    return {
      response: {
        answer:
          'This tool cannot answer that kind of question, ask something about Defra funding instead',
        hallucinated: true
      }
    }
  }
}

const runFetchAnswer = async ({
  query,
  chatHistory,
  cacheEnabled,
  summariesEnabled,
  embeddings,
  model,
  retryCount
}) => {
  try {
    if (summariesEnabled) {
      const { response: summariesResponse, hallucinated } =
        await runFetchAnswerQuery({
          query,
          chatHistory,
          summariesMode: summariesEnabled,
          model,
          embeddings,
          retryCount
        })

      if (!hallucinated) {
        // TODO cache summaries response after enabled
        return {
          response: summariesResponse?.answer,
          summariesMode: true,
          hallucinated
        }
      }
    }

    summariesEnabled = false

    const { response, hallucinated } = await runFetchAnswerQuery({
      query,
      chatHistory,
      summariesMode: summariesEnabled,
      embeddings,
      model,
      retryCount
    })

    if (cacheEnabled && !hallucinated && !config.get('useFakeLlm')) {
      await uploadToCache(query, response.answer)
    }

    return {
      response: response?.answer,
      summariesMode: false,
      hallucinated
    }
  } catch (error) {
    return {
      response: JSON.stringify({
        answer:
          'This tool cannot answer that kind of question, ask something about Defra funding instead',
        items: []
      }),
      hallucinated: true,
      summariesMode: summariesEnabled
    }
  }
}

const fetchAnswer = async (
  req,
  query,
  chatHistory,
  cacheEnabled,
  summariesEnabled = false
) => {
  if (cacheEnabled) {
    const cacheResponse = await searchCache(query)

    if (cacheResponse) {
      return {
        response: cacheResponse,
        summariesMode: summariesEnabled,
        hallucinated: false
      }
    }
  }

  const embeddings = getEmbeddingClient()
  const model = getOpenAIClient()

  const initialResponse = await runFetchAnswer({
    query,
    chatHistory,
    cacheEnabled,
    summariesEnabled,
    embeddings,
    model,
    retryCount: 0
  })

  if (!initialResponse.hallucinated) {
    return initialResponse
  }

  const finalResponse = await runFetchAnswer({
    query,
    chatHistory,
    cacheEnabled,
    summariesEnabled,
    embeddings,
    model,
    retryCount: 1
  })

  if (!finalResponse.hallucinated) {
    return finalResponse
  }

  return {
    response: JSON.stringify({
      answer:
        'This tool cannot answer that kind of question, ask something about Defra funding instead',
      items: []
    }),
    hallucinated: true,
    summariesMode: finalResponse.summariesMode
  }
}

export { fetchAnswer }
