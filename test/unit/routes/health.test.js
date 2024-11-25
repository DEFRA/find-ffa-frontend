const health = require('../../../app/routes/health')

describe('/health', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('should return success', async () => {
    const mockRequest = {}
    const mockH = {
      response: jest.fn(() => {
        return {
          code: jest.fn()
        }
      })
    }

    await health.handler(mockRequest, mockH)

    expect(mockH.response).toHaveBeenCalled()
  })
})
