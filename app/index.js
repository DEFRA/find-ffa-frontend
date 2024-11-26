const createServer = require('./server')
const { getLogger } = require('./lib/logger')

const init = async () => {
  const server = await createServer()
  await server.start()
  server.logger.info('Server started successfully')
  server.logger.info(`Server running on ${server.info.uri}`)
}

init().catch((err) => {
  const logger = getLogger()
  logger.info('Server failed to start :(')
  logger.error(err)
  process.exit(1)
})

process.on('unhandledRejection', (error) => {
  const logger = getLogger()
  logger.info('Unhandled rejection')
  logger.error(error)
  process.exitCode = 1
})
