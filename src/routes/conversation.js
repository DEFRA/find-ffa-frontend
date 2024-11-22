// @ts-nocheck
import boom from '@hapi/boom'

import { isAuthenticated } from '~/src/cookie-manager.js'
import { getMessages, setMessages } from '~/src/session/messages.js'
import { fetchAnswer } from '~/src/services/query-service.js'
import { getChatHistory, parseMessage } from '~/src/utils/langchain-utils.js'
import {
  trackMessage,
  trackSystemMessage,
  trackConversationPageView
} from '~/src/lib/events.js'
import { redact } from '~/src/utils/redact-utils.js'
import { config } from '~/src/config/index.js'

/**
 * @satisfies {ServerRegisterPluginObject<void>}
 */
export const getConversation = {
  plugin: {
    name: 'getConversation',
    register(server) {
      server.route({
        method: 'GET',
        path: '/conversation/{conversationId}',
        handler: (request, h) => {
          if (!isAuthenticated(request, h)) {
            request.logger.debug('Redirecting user to auth page')

            return h.redirect('/login')
          }

          const conversationId = request.params.conversationId

          trackConversationPageView(conversationId)

          const messages = getMessages(request, conversationId)

          if (!messages) {
            return boom.notFound()
          }

          return h.view('answer', {
            validationError: false,
            messages,
            commandText: 'Ask follow-on question...',
            conversationId,
            showHintText: true
          })
        }
      })
    }
  }
}

export const postConversation = {
  plugin: {
    name: 'postConversation',
    register(server) {
      server.route({
        method: 'POST',
        path: '/conversation/{conversationId}',
        handler: async (request, h) => {
          if (!isAuthenticated(request, h)) {
            request.logger.debug('Redirecting user to auth page')

            return h.redirect('/login')
          }

          const conversationId = request.params.conversationId

          trackConversationPageView(conversationId)

          const input = request.payload?.input
          const validationError = !input

          const messages = getMessages(request, conversationId) || []
          const chatHistory = getChatHistory(messages)

          if (!input) {
            return h.view('answer', {
              validationError: true,
              messages,
              commandText: 'Ask follow-on question...',
              conversationId,
              showHintText: true
            })
          }

          const redactedQuery = await redact(input)

          const startTime = new Date()
          trackMessage({
            message: redactedQuery,
            conversationId,
            characterCount: redactedQuery.length,
            time: startTime,
            conversationPosition: chatHistory.length + 1
          })

          messages.push({
            role: 'user',
            answer: redactedQuery
          })

          const { response, summariesMode, hallucinated } = await fetchAnswer(
            request,
            redactedQuery,
            chatHistory,
            config.get('azureOpenAI.cacheEnabled'),
            config.get('featureSummaryEnabled')
          )

          const endTime = new Date()

          request.logger.debug(`Generated response: ${response}`, {
            conversationId
          })

          try {
            const langchainData = parseMessage(request, response)

            messages.push({
              role: 'assistant',
              ...langchainData
            })
          } catch (error) {
            messages.push({
              role: 'assistant',
              answer: response
            })
          } finally {
            const responseDuration = (
              (endTime.getTime() - startTime.getTime()) /
              1000
            ).toFixed(2)
            trackSystemMessage({
              message: response,
              conversationId,
              time: endTime,
              characterCount: response.length,
              responseDuration,
              conversationPosition: chatHistory.length + 2,
              hallucinated,
              summariesMode
            })
          }

          setMessages(request, conversationId, messages)

          const formattedMessages = [...messages]
          formattedMessages[formattedMessages.length - 2] = {
            ...formattedMessages[formattedMessages.length - 2],
            scrollToMessage: formattedMessages.length > 2
          }

          return h.view('answer', {
            validationError,
            messages: formattedMessages,
            commandText: 'Ask follow-on question...',
            conversationId,
            showHintText: true
          })
        }
      })
    }
  }
}

/**
 * @import { ServerRegisterPluginObject } from '@hapi/hapi'
 */
