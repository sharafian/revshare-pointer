const levelup = require('levelup')
const leveldown = require('leveldown')
const db = levelup(leveldown(process.env.DB || './revshare-pointer-db'))

const { Payer } = require('web-monetization-receiver')
const payer = new Payer()
const IlpStream = require('ilp-protocol-stream')
const plugin = require('ilp-plugin')()
const crypto = require('crypto')
const stream = new IlpStream.Server({
  plugin,
  serverSecret: crypto.randomBytes(32)
})

const debug = require('debug')('revshare-pointer')
const Koa = require('koa')
const router = require('koa-router')()
const parser = require('koa-bodyparser')()
const app = new Koa()

// Create revshare pointer
router.post('/pointers/:name', async ctx => {
  const { payout } = ctx.request.body

  if (/[^A-Za-z0-9\-_]/.test(ctx.params.name)) {
    ctx.throw(400, 'invalid :name. must only use base64url characters.')
    return
  }

  try {
    const pointer = await db.get('pointer:' + ctx.params.name)
    if (pointer) {
      ctx.throw(400, 'entry already exists')
      return
    }
  } catch (e) {
    if (e.type !== 'NotFoundError') {
      throw e
    }
  }

  let sum = 0
  for (const entity of payout) {
    if (typeof entity.percent !== 'number' || isNaN(entity.percent)) {
      ctx.throw(400, 'invalid percent. must be positive number')
    }

    sum += entity.percent

    if (!entity.pointer || typeof entity.pointer !== 'string') {
      ctx.throw(400, 'invalid pointer. must be string.')
    }
  }

  if (sum !== 100) {
    ctx.throw(400, 'invalid payout. must percents must sum to 100')
    return
  }

  const pointer = {
    name: ctx.params.name,
    payout: ctx.request.body.payout
  }

  await db.put('pointer:' + ctx.params.name, JSON.stringify(pointer))

  debug('created pointer. name=' + ctx.params.name)
  ctx.body = pointer
})

// Get details of revshare pointer
router.get('/pointers/:name', async ctx => {
  try {
    const pointerJSON = await db.get('pointer:' + ctx.params.name)
    ctx.body = JSON.parse(pointerJSON)
  } catch (e) {
    debug('failed to lookup pointer. error=' + e.message)
  }
})

// SPSP query of revshare pointer
router.get('/:name', async ctx => {
  if (ctx.get('accept').includes('application/spsp4+json')) {
    try {
      const pointer = await db.get('pointer:' + ctx.params.name)
      if (pointer) {
        const details = stream.generateAddressAndSecret(ctx.params.name)
        ctx.body = {
          destination_account: details.destinationAccount,
          shared_secret: details.sharedSecret
        }
        ctx.set('Content-Type', 'application/spsp4+json')
        ctx.set('Access-Control-Allow-Origin', '*')
        ctx.set('Access-Control-Allow-Headers', 'Content-Type')
      }
    } catch (e) {
      debug('failed to lookup pointer. error=' + e.message)
    }
  }
})

async function run () {
  await stream.listen()

  app
    .use(parser)
    .use(router.routes())
    .use(router.allowedMethods())
    .listen(process.env.PORT || 8080)

  stream.on('connection', async conn => {
    const tag = conn.connectionTag
    let pointer

    try {
      const pointerJSON = await db.get('pointer:' + tag)
      pointer = JSON.parse(pointerJSON)
    } catch (e) {
      console.error('error loading pointer.', tag, e)
      conn.destroy()
      return
    }

    conn.on('stream', stream => {
      stream.setReceiveMax('999999999999')
      stream.on('money', amount => {
        Promise.all(pointer.payout.map(entity => {
          const payout = Math.floor(Number(amount) * (entity.percent / 100))

          if (!payout) {
            return Promise.resolve()
          }

          return payer.pay(entity.pointer, payout)
        })).then(() => {
          debug(`paid out. amount=${amount} name=${tag}`)
        }).catch(e => {
          debug('failed to pay. error=', e) 
        })
      })
    })
  })
}

run()
  .catch(e => {
    console.error('fatal', e)
    process.exit(1)
  })
