const createServer = require('../../../../app/server')

describe('Healthy test', () => {
  let server

  beforeEach(async () => {
    server = await createServer()
    await server.start()
  })

  test('GET /health route returns 200', async () => {
    const options = {
      method: 'GET',
      url: '/health'
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
  })

  afterEach(async () => {
    await server.stop()
  })
})
