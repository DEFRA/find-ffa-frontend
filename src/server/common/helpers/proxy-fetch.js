import { config } from '~/src/config/index.js'
import { ProxyAgent, fetch as undiciFetch } from 'undici'

/**
 * @param {string} url
 * @param {Partial<RequestInit>} opts
 */
function nonProxyFetch(url, opts) {
  return undiciFetch(url, {
    ...opts
  })
}

/**
 * @param {string} url
 * @param {Partial<RequestInit>} opts
 */
export function proxyFetch(url, opts) {
  const proxy = config.get('httpsProxy') ?? config.get('httpProxy')
  if (!proxy) {
    return nonProxyFetch(url, opts)
  } else {
    return undiciFetch(url, {
      ...opts,
      dispatcher: new ProxyAgent({
        uri: proxy,
        keepAliveTimeout: 10,
        keepAliveMaxTimeout: 10
      })
    })
  }
}

/**
 * @import { RequestInit } from 'undici'
 */
