/* eslint-disable @typescript-eslint/require-await */
import { setMessages } from '~/src/session/messages.js'

/**
 * @satisfies {ServerRegisterPluginObject<void>}
 */
export const reset = {
  plugin: {
    name: 'reset',
    register(server) {
      server.route({
        method: ['POST'],
        path: '/reset/{conversationId}',
        handler: async (request, h) => {
          const conversationId = request.params.conversationId
          setMessages(request, conversationId, [])

          return h.redirect('/')
        }
      })
    }
  }
}

/**
 * @import { ServerRegisterPluginObject } from '@hapi/hapi'
 */
