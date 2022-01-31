const exec = require('child_process').exec

const deployHost = '192.168.1.10' // WiFi 192.168.10.56
const deployUser = 'root' // 密碼 fa
const deployLocation = `${deployUser}@${deployHost}:/root/build/app`

exec(`scp -r dist/* ${deployLocation} `, (err, stdout, stderr) => {
  if (err) console.log(err)
  console.log('\x1b[32m%s\x1b[0m', `Copied to ${deployHost} successfully`)
  exec(`ssh ${deployUser}@${deployHost} pm2 restart app`, (err, stdout, stderr) => {
    if (err) console.log(err)
    console.log(stdout)
    console.log(stderr)
    console.log('\x1b[32m%s\x1b[0m', `Deployed to ${deployHost} and restart successfully`)
  })
})
