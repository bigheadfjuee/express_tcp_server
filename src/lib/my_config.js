const fs = require('fs')
const os = require('os')
let nconf = require('nconf')
const path = require('path')

// NOTE: 判斷是否在 pkg 中
let projectFolder
let f = ''
if (process.pkg) {
  //  It is run as an executable (pkg => binary)
  projectFolder = path.dirname(process.execPath)
  f = path.join(projectFolder, './config.json')
} else {
  //  It is run with nodejs dev enviroment
  projectFolder = __dirname
  f = path.join(projectFolder, '../config.json')
}

// NOTE: 用來存常數
const READ_ONLY = {
  storage: ''
}

function Config () {
  // console.log(f)
  // NOTE: 可能遇到設定檔不存在或爛掉，用預設值避免程式無法正常運作
  try {
    JSON.parse(fs.readFileSync(f))
  } catch (e) {
    // 把改壞的也另存一個檔案
    fs.access(f, fs.constants.F_OK, (err) => {
      if (!err) {
        fs.copyFile(f, `${f}-ng.json`, (err) => {
          console.error('parse config.json error: ', e)
          if (err) { console.log(err) }
        })
      }
    })

    console.log('Use Default Config')
    let configDefault = { }
    try {
      configDefault = require('../config.default.js')
    } catch (e) {
      throw new Error('config.default doesn\'t exist')
    }

    fs.writeFileSync(f, JSON.stringify(configDefault), 'utf8')
  }

  nconf.file(f)
  nconf.save()

  READ_ONLY.storage = (os.platform() === 'darwin') ? './root/storage' : './'
}

Config.prototype.get = function (key) {
  if (READ_ONLY[key] !== undefined) {
    return READ_ONLY[key]
  }
  return nconf.get(key)
}

Config.prototype.set = function (key, val) {
  nconf.set(key, val)
  nconf.save()
}

// NOTE: 不同 process 存取同一 config 時要先 reload
Config.prototype.reload = function () {
  nconf = null
  nconf = require('nconf')
  nconf.file(f)
}

module.exports = new Config()
