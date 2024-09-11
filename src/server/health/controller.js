/**
 * A generic health-check endpoint. Used by the platform to check if the service is up and handling requests.
 * @satisfies {Partial<ServerRoute>}
 */
export const healthController = {
  handler(request, h) {
    return h.response({ message: 'success' }).code(200)
  }
}

/**
 * @import { ServerRoute } from '@hapi/hapi'
 */
