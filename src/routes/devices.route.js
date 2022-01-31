const express = require('express')
const ctrl = require('../controllers/devices.controller')

const router = express.Router()

router.route('/resetSN')
  .get(ctrl.resetSN)

module.exports = router
