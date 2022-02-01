const httpStatus = require('http-status')
const fetch = require('node-fetch')
const http = require('http')
const Config = require('../lib/my_config')

async function exec (req, res, next) {
  const uri = req.body?.uri
  const method = req.body?.method
  const data = req.body?.data

  const jo = await callApi(uri, method, data, next)
  return res.status(httpStatus.OK).json(jo)
}

async function getCookie () {
  const host = Config.get('host1')
  const uri = `http://${host.ip}/api/login`

  // 先登入，並萃取 cookie
  const res = await fetch(uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user: host.user,
      password: host.password
    }),
    agent: new http.Agent({ keepAlive: true })
  })
  const cookie = res.headers.raw()['set-cookie']
  return cookie
}

async function callApi (api, method, data, next) {
  const host = Config.get('host1')
  const uri = `http://${host.lanIp}${api}`

  try {
    const cookie = await getCookie()
    let param = {
      headers: {
        cookie: cookie
      },
      method: 'get'
    }

    if (method === 'post') {
      param = {
        headers: {
          cookie: cookie,
          'Content-Type': 'application/json'
        },
        method: 'post',
        body: JSON.stringify(data)
      }
    }

    const result = await fetch(uri, param)
    return await result.json()
  } catch (e) {
    console.error(e)
    if (next !== undefined) next(e)
  }
}

export default { exec, callApi }
