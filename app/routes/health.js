module.exports = {
  method: 'GET',
  path: '/health',
  handler: (request, h) => {
    return h.response('ok').code(200)
  }
}
