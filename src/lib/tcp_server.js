const net = require('net')
const TCP_PORT = 12345
const EventEmitter = require('events').EventEmitter
const util = require('util')

let self = null
function TcpServer () {
  this.tcp = {}
  this.clinets = []
}

TcpServer.prototype.init = async function () {
  self = this
  this.tcp = net.createServer().listen(TCP_PORT, '0.0.0.0', () => {
    console.log(`TcpServer listen: ${TCP_PORT}`)
  })

  const clients = []
  this.tcp.on('connection', (socket) => {
    console.log(`connection: ${socket.remoteAddress}`)
    clients.push(socket)
    this.socket = socket
    socket.on('data', (buf) => {
      const msg = buf.toString()

      if (msg.includes('heart-beat')) { return }

      console.log(msg)
      const json = JSON.parse(msg)
      self.emit('checkderStatus', json)
    })

    socket.on('end', () => {
      console.log(`socket.end: ${socket.remoteAddress}`)
      clients.splice(clients.indexOf(socket), 1)
    })

    socket.on('error', (err) => {
      console.error(`socket.error: ${socket.remoteAddress} - ${err}`)

      if (err.code === 'ECONNRESET') { clients.splice(clients.indexOf(socket), 1) } // Tony: 把錯誤的連線刪掉
    })

    this.clinets = clients
  })
}

TcpServer.prototype.broadcast = async function (data) {
  try {
    for (const sock of this.clinets) {
      console.log(`broadcast - sock.readyState:${sock.readyState}`)
      if (sock.readyState === 'open') { sock.write(data) }
    }
  } catch (err) {
    console.error('broadcast-error : {err}')
  }
}

TcpServer.prototype.getOnline = function () {
  return (this.clinets.length > 0)
}

util.inherits(TcpServer, EventEmitter)
module.exports = new TcpServer()
