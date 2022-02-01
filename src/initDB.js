const DB = require('./db')
const SystemDB = require('./models/system.model')

const debug = require('debug')('initDB')
const PASSWORD = '1234'

function insert () {
  system()
}

function system () {
  debug(' => insert system')
  const initObj = {
    key: 'init',
    value: 'ok'
  }

  const isExist = SystemDB.get('init')
  if (!isExist) {
    SystemDB.add(initObj)
  }
}

module.exports = { insert }
