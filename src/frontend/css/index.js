// @ts-nocheck
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/prefer-optional-chain */

import { initAll } from 'govuk-frontend'
import './application.scss'
initAll()

// NOTE: the function trackConversationEvent is loaded in js elsewhere, and the 'trackConversationEvent &&' check ensures nothing breaks if it's not available
// eslint ignores the 'no-undef' rule for trackConversationEvent so the tests don't fail

document.addEventListener('DOMContentLoaded', (event) => {
  const sendButton = document.getElementById('sendButton')
  const sendForm = document.getElementById('sendForm')
  const loadingSpinner = document.getElementById('loadingSpinner')
  let searching = false

  const copyButton = document.getElementById('copyButton')
  const printButton = document.getElementById('printButton')

  if (sendButton) {
    sendButton.onclick = (event) => {
      event.preventDefault()

      if (!searching) {
        sendButton.disabled = true
        sendButton.style.display = 'none'

        if (loadingSpinner) {
          loadingSpinner.style.display = 'block'
        }

        searching = true
        trackConversationEvent && trackConversationEvent('user message sent')
        sendForm.submit()
      }
    }
  }

  if (copyButton) {
    copyButton.onclick = (event) => {
      event.preventDefault()

      const bodyContent = document.getElementById('bodyContent')

      if (bodyContent) {
        const text = bodyContent.innerText

        navigator.clipboard.writeText(text).then(
          () => {},
          () => {
            console.error('Failed to copy')
          }
        )
      }
      trackConversationEvent && trackConversationEvent('copy')
    }
  }

  if (printButton) {
    printButton.onclick = (event) => {
      event.preventDefault()
      trackConversationEvent?.('print')

      window.print()
    }
  }

  // find form with the action including /reset string
  const resetForm = document.querySelector('form[action*="/reset"]')

  // if it exists, track the onsubmit event with the trackConversationEvent function
  if (resetForm) {
    resetForm.onsubmit = () => {
      trackConversationEvent?.('new conversation')
    }
  }
})
