const process = require('node:process')
const createServer = require('./server')
const { getLogger } = require('./lib/logger')

const init = async () => {
  try {
    const server = await createServer()
    await server.start()

    server.logger.info('Server started successfully')
    server.logger.info(`Server running on ${server.info.uri}`)

    return server
  } catch (error) {
    const logger = getLogger()
    logger.info('Server failed to start :(')
    logger.error(error)
  }
}

init().catch((err) => {
  const logger = getLogger()
  logger.info('Server failed to start :(')
  logger.error(err)
  process.exitCode = 1
})

process.on('unhandledRejection', (error) => {
  const logger = getLogger()
  logger.info('Unhandled rejection')
  logger.error(error)
  process.exitCode = 1
})
