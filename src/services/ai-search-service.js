import { v4 as uuidv4 } from 'uuid'
import { generateEmbedding } from './open-ai-service.js'
import { createLogger } from '~/src/server/common/helpers/logging/logger.js'
import { getSearchClient } from '~/src/lib/azure-search-client.js'
import { Event, trackCacheUpload } from '~/src/lib/events.js'
import { config } from '~/src/config/index.js'

const logger = createLogger()

/**
 * Uploads query and answer to cache
 * @param {string} query
 * @param {string} answer
 */
const uploadToCache = async (query, answer) => {
  try {
    const embedding = await generateEmbedding(query)

    const document = {
      id: uuidv4(),
      answer,
      content: query,
      content_vector: embedding
    }

    const searchClient = getSearchClient()
    await searchClient.uploadDocuments([document])

    trackCacheUpload({ requestQuery: query })
  } catch (error) {
    logger.error(error, 'Failed to upload query to cache')
  }
}

/**
 * Searches cache
 * @param {string} query
 * @returns {Promise<string | undefined>}
 */
const searchCache = async (query) => {
  const scoreTarget = config.get('azureOpenAI.cacheTarget')

  try {
    const searchClient = getSearchClient()
    let highestScore = 0

    const results = await searchClient.search(query)

    for await (const result of results.results) {
      if (result.score > highestScore) {
        highestScore = result.score
      }

      // @ts-ignore
      if (result.score >= scoreTarget) {
        logger.debug(Event.CACHE_HIT, {
          score: result.score,
          target: scoreTarget
        })

        return result.document.answer
      }
    }

    logger.debug(Event.CACHE_MISS, { score: highestScore, target: scoreTarget })

    return undefined
  } catch (error) {
    logger.debug(Event.CACHE_MISS, {
      score: 0,
      target: scoreTarget,
      failed: true
    })
    logger.error(error)

    return undefined
  }
}

export { uploadToCache, searchCache }
