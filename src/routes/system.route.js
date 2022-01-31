const express = require('express')
const ctrl = require('../controllers/system.controller')

const router = express.Router()

router.route('/sysStatus')
  .get(ctrl.getSysStatus)

module.exports = router
