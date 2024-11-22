import { getEmbeddingClient } from '~/src/lib/open-ai-client.js'

/**
 * Generates vector embeddings for content
 * @param {string} content
 * @returns {Promise<number[]>}
 */
const generateEmbedding = async (content) => {
  if (!content) {
    throw new Error('Cannot generate embedding - content is empty')
  }

  const embeddings = getEmbeddingClient()
  const embedding = await embeddings.embedDocuments([content])

  return embedding[0]
}

export { generateEmbedding }
