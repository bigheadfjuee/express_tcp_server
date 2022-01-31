const net = require('net')
const deviceStatus = require('./device-status')

const retryTime = 10
const heartBeat = 30

const TCP_PORT = 12345
const TCP_HOST = '127.0.0.1'
let self = null

function TcpClient () {
  this.socket = null
  this.connected = false
}

TcpClient.prototype.init = async function () {
  self = this
  const tcpClient = new net.Socket()
  tcpClient.setEncoding('utf8')
  this.socket = tcpClient

  const sendJson = function (obj) {
    try {
      tcpClient.write(JSON.stringify(obj), TCP_PORT, TCP_HOST)
    } catch (err) {
      console.error(err)
    }
  }

  tcpClient.connect(TCP_PORT, TCP_HOST, () => {
    console.log(`tcp connect to ${TCP_HOST}:${TCP_PORT}`)
    sendJson(deviceStatus)
  })

  tcpClient.on('error', () => {
    // console.error(err)
    self.resetConnect()
  })

  tcpClient.on('close', function () {
    console.log('TCP Connection closed')
  })

  tcpClient.on('data', (buf) => {
    const cmd = buf.toString()
    console.log(cmd)

    if (cmd.includes('getStatus')) { sendJson(deviceStatus) }

    if (cmd.includes('resetSN')) { deviceStatus.sn = 1 }
  })

  // heart beat
  setInterval(() => {
    if (self.connected) {
      tcpClient.write('heart-beat')
    }
  }, heartBeat * 1000)
}

TcpClient.prototype.send = async function (obj) {
  try {
    this.socket.write(JSON.stringify(obj), TCP_PORT, TCP_HOST)
  } catch (err) {
    console.error(err)
  }
}

TcpClient.prototype.resetConnect = async function () {
  if (this.socket !== null) {
    this.socket.end()
    this.socket.unref()
    this.socket.destroy()
    this.socket = null

    this.connected = false
  }

  setTimeout(() => {
    self.init()
  }, retryTime * 1000)
}

module.exports = new TcpClient()
