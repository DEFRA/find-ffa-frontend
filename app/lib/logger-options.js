const { ecsFormat } = require('@elastic/ecs-pino-format')
const config = require('../config')

const formatters = {
  ecs: ecsFormat(),
  'pino-pretty': { transport: { target: 'pino-pretty' } }
}

const loggerOptions = {
  enabled: true,
  ignorePaths: ['/health'],
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', 'res.headers'],
    remove: true
  },
  level: config.logLevel,
  ...formatters.ecs
}

module.exports = { loggerOptions }
