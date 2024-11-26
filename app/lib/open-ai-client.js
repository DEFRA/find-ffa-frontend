const { ChatOpenAI, OpenAIEmbeddings } = require('@langchain/openai')
const { FakeChatModel } = require('@langchain/core/utils/testing')
const { HttpsProxyAgent } = require('https-proxy-agent')
const { logger } = require('./logger')
const config = require('../config')

const getHttpAgent = () => {
  const proxyUrlConfig = config.httpsProxy ?? config.httpProxy
  let httpAgent
  if (proxyUrlConfig) {
    const proxyUrl = new URL(proxyUrlConfig)
    httpAgent = new HttpsProxyAgent(proxyUrl)
  }

  logger.debug(`proxy - ${proxyUrlConfig}`)

  return httpAgent
}

const onFailedAttempt = async (error) => {
  if (error.retriesLeft === 0) {
    logger.error(error, 'Failed to get embeddings')
    throw error
  }
}

/**
 * Get OpenAI Client
 * @returns {FakeChatModel | ChatOpenAI}
 */
const getOpenAIClient = () => {
  const httpAgent = getHttpAgent()

  logger.debug(`getOpenAIClient - ${config.azureOpenAI.openAiInstanceName} - ${config.azureOpenAI.openAiKey.substring(0, 2)} - ${config.azureOpenAI.openAiModelName}`)

  const model = config.useFakeLlm
    ? new FakeChatModel({ onFailedAttempt })
    : new ChatOpenAI({
      azureOpenAIApiInstanceName: config.azureOpenAI.openAiInstanceName,
      azureOpenAIApiKey: config.azureOpenAI.openAiKey,
      azureOpenAIApiDeploymentName: config.azureOpenAI.openAiModelName,
      azureOpenAIApiVersion: '2024-02-01',
      configuration: {
        httpAgent
      },
      verbose: true,
      onFailedAttempt
    })

  return model
}

/**
 * Get OpenAI Embeddings Client
 * @returns {OpenAIEmbeddings}
 */
const getEmbeddingClient = () => {
  const httpAgent = getHttpAgent()

  logger.debug(`getEmbeddingClient - ${config.azureOpenAI.openAiInstanceName} - ${config.azureOpenAI.openAiKey.substring(0, 2)}`)

  const embeddings = new OpenAIEmbeddings({
    azureOpenAIApiInstanceName: config.azureOpenAI.openAiInstanceName,
    azureOpenAIApiKey: config.azureOpenAI.openAiKey,
    azureOpenAIApiDeploymentName: 'text-embedding-ada-002',
    azureOpenAIApiVersion: '2024-02-01',
    configuration: {
      httpAgent
    },
    verbose: true,
    onFailedAttempt
  })

  return embeddings
}

module.exports = {
  getOpenAIClient,
  getEmbeddingClient
}
