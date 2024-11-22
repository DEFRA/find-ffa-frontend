import { createLogger } from '~/src/server/common/helpers/logging/logger.js'

const Event = {
  USER_MESSAGE: 'EVENT_USER_MESSAGE',
  SYSTEM_MESSAGE: 'EVENT_SYSTEM_MESSAGE',
  LANDING_PAGE_VIEW: 'EVENT_LANDING_PAGE_VIEW',
  CONVERSATION_PAGE_VIEW: 'EVENT_CONVERSATION_PAGE_VIEW',
  HALLUCINATED_LINK: 'EVENT_HALLUCINATED_LINK',
  FETCH_RESPONSE_FAILED: 'EVENT_FETCH_RESPONSE_FAILED',
  CACHE_UPLOAD: 'EVENT_CACHE_UPLOAD',
  CACHE_HIT: 'EVENT_CACHE_HIT',
  CACHE_MISS: 'EVENT_CACHE_MISS'
}

const logger = createLogger()

/**
 * Track message
 * @param {{message: string, conversationId: string}} eventProps
 */
const trackMessage = (eventProps) => {
  logger.debug(Event.USER_MESSAGE, eventProps)
}

/**
 * Track system message
 * @param {{message: string, conversationId: string}} eventProps
 */
const trackSystemMessage = (eventProps) => {
  logger.debug(Event.SYSTEM_MESSAGE, eventProps)
}

const trackLandingPageView = (conversationId) => {
  logger.debug(Event.LANDING_PAGE_VIEW, { time: new Date(), conversationId })
}

const trackConversationPageView = (conversationId) => {
  logger.debug(Event.CONVERSATION_PAGE_VIEW, {
    time: new Date(),
    conversationId
  })
}

const trackHallucinatedLinkInResponse = ({
  requestQuery,
  errorMessage,
  failedObject
}) => {
  logger.debug(Event.HALLUCINATED_LINK, {
    time: new Date(),
    requestQuery,
    errorMessage,
    failedObject
  })
}

const trackFetchResponseFailed = ({
  requestQuery,
  errorMessage,
  retryCount
}) => {
  logger.debug(Event.FETCH_RESPONSE_FAILED, {
    time: new Date(),
    requestQuery,
    errorMessage,
    retryCount
  })
}

const trackCacheUpload = ({ requestQuery }) => {
  logger.debug(Event.CACHE_UPLOAD, { time: new Date(), requestQuery })
}

export {
  Event,
  trackMessage,
  trackSystemMessage,
  trackLandingPageView,
  trackConversationPageView,
  trackHallucinatedLinkInResponse,
  trackFetchResponseFailed,
  trackCacheUpload
}
