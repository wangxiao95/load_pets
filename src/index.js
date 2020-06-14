// const Koa = require('koa2')
const { getDogs } = require('./dogs')


// const app = new Koa()
let dogs = []

// response
// app.use(ctx => {
//   ctx.body = dogs[0]
// })

// app.listen(3000)

async function init() {
  dogs = await getDogs()
}

init()