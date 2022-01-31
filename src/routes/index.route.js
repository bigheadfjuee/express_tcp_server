const express = require('express')
const httpStatus = require('http-status')

const systemRoutes = require('./system.route')
const devicesRoutes = require('./devices.route')
const sysStatus = require('../lib/sys_status')

const router = express.Router()

router.get('/', (req, res) => {
  res.render('index.ejs', sysStatus)
})

router.get('/setting', (req, res) => {
  res.render('setting.ejs', sysStatus)
})

router.use('/api/system', systemRoutes)
router.use('/api/devices', devicesRoutes)

router.get('/*', (req, res, next) => {
  return res.status(httpStatus.NOT_FOUND).json({ data: 'NG', message: `API not found : ${req.url}` })
})

module.exports = router
