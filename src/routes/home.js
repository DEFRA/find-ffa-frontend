/* eslint-disable @typescript-eslint/require-await */
import { v4 as uuidv4 } from 'uuid'

import { isAuthenticated } from '~/src/cookie-manager.js'
import { trackLandingPageView } from '~/src/lib/events.js'

/**
 * @satisfies {ServerRegisterPluginObject<void>}
 */
export const home = {
  plugin: {
    name: 'home',
    register(server) {
      server.route({
        method: ['GET', 'POST'],
        path: '/',
        handler: async (request, h) => {
          if (!isAuthenticated(request, h)) {
            request.logger.debug('Redirecting user to auth page')

            return h.redirect('/login')
          }

          let validationError = false

          const conversationId = uuidv4()

          trackLandingPageView(conversationId)

          // @ts-ignore
          const input = request.payload?.input

          if (!input || input?.trim() === '') {
            if (input?.trim() === '') {
              validationError = true
            }

            return h.view('home', {
              validationError,
              commandText: 'Ask a question...',
              showHintText: true,
              conversationId
            })
          }
        }
      })
    }
  }
}

/**
 * @import { ServerRegisterPluginObject } from '@hapi/hapi'
 */
