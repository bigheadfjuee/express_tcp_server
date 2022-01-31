const httpStatus = require('http-status')
const sysStatus = require('../lib/sys_status')

function getSysStatus (req, res, next) {
  return res.status(httpStatus.OK).json(sysStatus)
}

module.exports = { getSysStatus }
