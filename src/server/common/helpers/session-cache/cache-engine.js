import { buildRedisClient } from '~/src/server/common/helpers/redis-client.js'
import { Engine as CatboxRedis } from '@hapi/catbox-redis'
import { Engine as CatboxMemory } from '@hapi/catbox-memory'

import { config } from '~/src/config/index.js'
import { createLogger } from '~/src/server/common/helpers/logging/logger.js'

export function getCacheEngine(engine) {
  const logger = createLogger()

  switch (engine) {
    case 'redis': {
      logger.info('Using Redis session cache')
      const redisClient = buildRedisClient(config.get('redis'))
      return new CatboxRedis({
        client: redisClient
      })
    }
    default: {
      logger.info('Using Catbox Memory session cache')
      if (config.get('isProduction')) {
        logger.error(
          'Catbox Memory is for local development only, it should not be used in production!'
        )
      }
      return new CatboxMemory()
    }
  }
}
