import { AzureKeyCredential, SearchClient } from '@azure/search-documents'
import { config } from '~/src/config/index.js'

/**
 * Returns instance of azure ai search client
 * @returns {SearchClient}
 */
const getSearchClient = () => {
  const searchClient = new SearchClient(
    config.get('azureOpenAI.searchUrl'),
    config.get('azureOpenAI.cacheIndexName'),
    new AzureKeyCredential(config.get('azureOpenAI.searchApiKey'))
  )

  return searchClient
}

export { getSearchClient }
