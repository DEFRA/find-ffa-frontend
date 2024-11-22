/* eslint-disable @typescript-eslint/require-await */
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai'
import { FakeChatModel } from '@langchain/core/utils/testing'
import { createLogger } from '~/src/server/common/helpers/logging/logger.js'
import { config } from '~/src/config/index.js'

const logger = createLogger()

const onFailedAttempt = async (error) => {
  logger.error(error)

  if (error.retriesLeft === 0) {
    throw new Error(`Failed to get embeddings: ${error}`)
  }
}

/**
 * Get OpenAI Client
 * @returns {FakeChatModel | ChatOpenAI}
 */
const getOpenAIClient = () => {
  const model = config.get('useFakeLlm')
    ? new FakeChatModel({ onFailedAttempt })
    : new ChatOpenAI({
        azureOpenAIApiInstanceName: config.get(
          'azureOpenAI.openAiInstanceName'
        ),
        azureOpenAIApiKey: config.get('azureOpenAI.openAiKey'),
        azureOpenAIApiDeploymentName: config.get('azureOpenAI.openAiModelName'),
        azureOpenAIApiVersion: '2024-02-01',
        onFailedAttempt
      })

  return model
}

/**
 * Get OpenAI Embeddings Client
 * @returns {OpenAIEmbeddings}
 */
const getEmbeddingClient = () => {
  const embeddings = new OpenAIEmbeddings({
    azureOpenAIApiInstanceName: config.get('azureOpenAI.openAiInstanceName'),
    azureOpenAIApiKey: config.get('azureOpenAI.openAiKey'),
    azureOpenAIApiDeploymentName: 'text-embedding-ada-002',
    azureOpenAIApiVersion: '2024-02-01',
    onFailedAttempt
  })

  return embeddings
}

export { getOpenAIClient, getEmbeddingClient }
