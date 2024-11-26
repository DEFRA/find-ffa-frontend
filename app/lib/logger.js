const pino = require('pino')
const { loggerOptions } = require('./logger-options')

const getLogger = () => {
  return pino(loggerOptions)
}

const logger = getLogger()

module.exports = {
  getLogger,
  logger
}
