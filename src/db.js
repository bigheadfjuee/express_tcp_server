const Sqlite3 = require('better-sqlite3')
const os = require('os')

const db = 'mydb.db'
const productName = 'my123'
let instance
const Database = function () {
  // db path在量轉前後的路徑不同，開發機時的DB path為 `/root/build/xx-backend` ；量轉後在`/usr/local/bin/`裡
  this.env = (process.env.NODE_ENV === 'production') ? 'prod' : 'dev'
  this.path = _getDBPath()

  this.dbOpt = (process.env.NODE_ENV === 'production') ? { verbose: null } : { verbose: console.log }
  this.database = new Sqlite3(db, this.dbOpt)

  function _getDBPath () {
    if (process.env.NODE_ENV === 'production') return `/usr/local/bin/${db}`
    if (os.platform() === 'darwin') return `./${db}`
    return `${process.env.HOME}/build/${productName}/${db}`
  }
}

Database.prototype.init = function () {
  _initTable(this.database)
}

function _initTable (database) {
  const sqls = [ system() ]
  sqls.forEach(sql => {
    database.exec(sql)
  })
  database.pragma('recursive_triggers = ON')
}

function system () {
  return `CREATE TABLE IF NOT EXISTS system (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    key TEXT UNIQUE NOT NULL,
    value TEXT
  );`
}

Database.prototype.reset = function () {
  const database = this.database
  _deleteTable()

  function _deleteTable () {
    const tables = database.prepare(`
      SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT IN ('log', 'sqlite_sequence')
    `).all()

    if (tables.length === 0) return

    // NOTE: DROP TABLE 會有外鍵連結的順序問題，所以用 try..catch，加上遞迴
    for (const table of tables) {
      try {
        database.prepare(`DROP TABLE IF EXISTS '${table.name}'`).run()
      } catch (e) {}
    }
    _deleteTable()
  }
}

// return [ 'key1 = $key1', 'key2 = $key2', ... ]
Database.prototype.getKeyPair = function (obj, skip = []) {
  const keyPair = []
  for (const key of Object.keys(obj)) {
    if (skip.includes(key)) continue
    keyPair.push(`${key} = $${key}`)
  }
  return keyPair
}

// NOTE: sqlite3 不吃物件、布林等等，利用該函數將指定欄位 stringify
Database.prototype.toString = function (obj, columns = []) {
  if (!obj) return obj

  for (const key of columns) {
    if (obj[key] === undefined) continue
    obj[key] = (obj[key] === null) ? obj[key] : JSON.stringify(obj[key])
  }
  return obj
}

// NOTE: sqlite3 只存字串，利用該函數將指定欄位 parse
Database.prototype.parse = function (obj, columns = []) {
  if (!obj) return obj

  for (const key of columns) {
    obj[key] = JSON.parse(obj[key])
  }
  return obj
}

Database.prototype.begin = function () {
  return new Promise((resolve, reject) => {
    try {
      this.database.prepare('BEGIN').run()
      resolve()
    } catch (error) {
      this.database.prepare('ROLLBACK').run()
      reject(error)
    }
  })
}

Database.prototype.rollback = function () {
  return new Promise((resolve, reject) => {
    try {
      this.database.prepare('ROLLBACK').run()
      resolve()
    } catch (error) {
      this.database.prepare('ROLLBACK').run()
      reject(error)
    }
  })
}

Database.prototype.commit = function () {
  return new Promise((resolve, reject) => {
    try {
      this.database.prepare('COMMIT').run()
      resolve()
    } catch (error) {
      this.database.prepare('ROLLBACK').run()
      reject(error)
    }
  })
}

module.exports = exports = (() => {
  if (instance) {
    return instance
  }

  instance = new Database()
  return instance
})()
