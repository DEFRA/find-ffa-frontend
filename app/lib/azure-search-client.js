const { AzureKeyCredential, SearchClient } = require('@azure/search-documents')
const config = require('../config')
const { logger } = require('./logger')

/**
 * Returns instance of azure ai search client
 * @returns {SearchClient}
 */
const getSearchClient = () => {
  const proxyUrlConfig = config.httpsProxy ?? config.httpProxy
  let proxyOptions
  if (proxyUrlConfig) {
    const proxyUrl = new URL(proxyUrlConfig)
    const port = proxyUrl.protocol.toLowerCase() === 'http:' ? 80 : 443
    proxyOptions = {
      host: proxyUrl.href,
      port
    }
  }

  logger.debug(`SearchClient - ${config.azureOpenAI.searchUrl} - ${config.azureOpenAI.searchApiKey.substring(0, 2)} - ${config.azureOpenAI.indexName}`)

  const searchClient = new SearchClient(
    config.azureOpenAI.searchUrl,
    config.azureOpenAI.indexName,
    new AzureKeyCredential(config.azureOpenAI.searchApiKey),
    {
      proxyOptions
    }
  )

  return searchClient
}

module.exports = {
  getSearchClient
}
