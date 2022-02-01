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

// JTW toekn
async function getJWT () {
  const host = Config.get('host2')
  const uri = `http://${host.ip}/api/auth/login`

  // 先登入，並萃取 token
  let result = await fetch(uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: host.id,
      password: host.pw
    }),
    agent: new http.Agent({ keepAlive: true })
  })
  result = await result.json()
  return result.token
}

async function callApi (api, method, data, next) {
  const host = Config.get('host2')
  const uri = `http://${host.ip}${api}`

  try {
    const token = await getJWT()
    let param = {
      headers: {
        token: token
      },
      method: 'get'
    }

    if (method === 'post') {
      param = {
        headers: {
          token: token,
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
