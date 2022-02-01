// DESC: 放在 ai server 端收檔案檢測用
const cors = require('cors')
const express = require('express')
const fileUpload = require('express-fileupload')
const path = require('path')

const routes = require('./routes/index.route')
const tcpServer = require('./lib/tcp_server')
const sysStatus = require('./lib/sys_status')
const Config = require('./lib/my_config')
const DB = require('./db')
const DBScript = require('./initDB')

const app = express()
const server = require('http').Server(app)
const ws = require('socket.io')(server, {
  transports: ['websocket', 'polling'],
  pingInterval: 40000,
  pingTimeout: 25000
})

const SERVER_PORT = 5566

app.set('view engine', 'ejs')
// bootstrap v5.1
app.use('/css', express.static(path.join(__dirname, '../node_modules/bootstrap/dist/css')))
app.use('/bootstrap', express.static(path.join(__dirname, '../node_modules/bootstrap/dist/js')))
app.use('/jquery', express.static(path.join(__dirname, '../node_modules/jquery/dist')))
app.use('/socket.io', express.static(path.join(__dirname, '../node_modules/socket.io/client-dist')))
app.use(express.static(path.join(__dirname, '../public')))

app.use(cors())
app.use(fileUpload())
app.use(express.json({ limit: 1024 * 1024 * 1024 })) // 1G
app.use(express.urlencoded({ extended: true }))

app.use((req, res, next) => {
  req.ws = ws
  next()
})

DB.init()
DBScript.insert()

app.use('/', routes)

// NOTE: 這裡要改用 server，不能用 app，不然 websocket 會失效
// app.listen(SERVER_PORT, async () => {
server.listen(SERVER_PORT, () => {
  tcpServer.init()
  initWS(ws)
  console.log(`listening on *:${SERVER_PORT}`)

  tcpServer.on('checkderStatus', (data) => {
    sysStatus.init = data.init ?? sysStatus.init
    sysStatus.sn = data.sn ?? sysStatus.sn
    ws.emit('init', sysStatus.init)
    ws.emit('sn', sysStatus.sn)
  })
})

function initWS (ws) {
  ws.on('connection', client => {
    console.log('ws.on:connection')

    client.on('resetSN', data => {
      console.log('resetSN')
      sysStatus.sn = 1
      tcpServer.broadcast('resetSN')
      ws.emit('sn', '1')
    })

    client.on('disconnect', () => {
      console.log('ws - disconnect')
    })
  })

  setInterval(() => {
    ws.emit('online', { online: tcpServer.getOnline() })
  }, 5 * 1000)
}

module.exports = app
