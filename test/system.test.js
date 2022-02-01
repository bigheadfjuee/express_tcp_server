const chai = require('chai')
const expect = chai.expect
const chaiHttp = require('chai-http')
const Config = require('./config.test')

chai.use(chaiHttp)
chai.should()

const agent = chai.request.agent(`${Config.HOST}`)

before(async () => {
})

after(async () => {
})

describe('# GET /system/sysStatus', () => {
  it('should success to get system sysStatus', async () => {
    const res = await agent.get('/system/sysStatus')
    expect(res).has.status(200)
    const network = res.body
    expect(network).has.keys(['init', 'type', 'sn', 'mode'])
    expect(network.init).is.a('string')
    expect(network.type).is.a('string')
    expect(network.sn).is.a('number')
    expect(network.mode).is.a('string')
  })
})



