module.exports = {
  method: 'GET',
  path: '/health',
  handler: (request, h) => {
    return h.response({ message: 'success' }).code(200)
  }
}
