const Sqlite = require('../db').database

function set (obj) {
  obj = JSON.parse(JSON.stringify(obj))
  const sql = 'UPDATE system SET value = $value WHERE key = $key'
  obj.value = JSON.stringify(obj.value)

  const result = Sqlite.prepare(sql).run(obj)

  return result
}

function get (value) {
  const sql = `SELECT * FROM system WHERE key = '${value}'`
  const result = Sqlite.prepare(sql).get()
  if (result) {
    result.value = JSON.parse(result.value)
  }
  return result
}

function add (obj) {
  obj = JSON.parse(JSON.stringify(obj))
  const sql = 'INSERT INTO system (key, value) VALUES ($key, $value)'
  obj.value = JSON.stringify(obj.value)

  const result = Sqlite.prepare(sql).run(obj)

  return result
}

module.exports = { set, get, add }
