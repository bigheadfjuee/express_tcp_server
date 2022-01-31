const httpStatus = require('http-status')
const tcpServer = require('../lib/tcp_server')

function resetSN (req, res, next) {
  tcpServer.broadcast('resetSN')
  req.ws.emit('sn', { sn: 1 })
  return res.status(httpStatus.OK).json({ data: 'ok', sn: 1 })
}

module.exports = { resetSN }
