const config = require('./config')
const debug = require('debug')('revshare-pointer:auth')
const jwt = require('./jwt')
const crypto = require('crypto')

const auth = {
  authenticate: async function (ctx, next) {
    if (!ctx.get('authorization')) {
      ctx.throw(401, 'authentication failed. must provide authorization header')
      return
    }

    const authHeader = ctx.get('authorization').split(' ')
    const type = authHeader[0]
    const token = authHeader[1]

    if (type !== 'Bearer') {
      ctx.throw(401, 'authentication failed. must provide authorization header with type, Bearer')
      return
    }

    if (!token) {
      ctx.throw(401, 'authentication failed. must provide authorization header with credentials')
      return
    }

    const gotToken = Buffer.from(token, 'utf8')
    const wantToken = Buffer.from(config.token, 'utf8')

    if (gotToken.length !== wantToken.length || !crypto.timingSafeEqual(gotToken, wantToken)) {
      debug('received token "%s", but expected "%s"', gotToken.toString(), wantToken.toString())
      ctx.throw(401, 'authentication failed. invalid token')
      return
    }

    const payload = {
      iss: config.jwtIssuer,
      aud: config.jwtAudience,
    }

    const options = {
      expiresIn: config.jwtExpiration,
      algorithm: 'HS256'
    }

    const accessToken = jwt.createToken(payload, options)
    debug(`created access token=${accessToken}`)
    ctx.body = { token: accessToken }

    return next()
  },

  authorize: async function (ctx, next) {
    if (!ctx.get('authorization')) {
      ctx.throw(403, 'authorization failed. must provide authorization header')
      return
    }

    const authHeader = ctx.get('authorization').split(' ')
    const type = authHeader[0]
    const token = authHeader[1]

    if (type !== 'Bearer') {
      ctx.throw(403, 'authorization failed. must provide authorization header with type, Bearer')
      return
    }

    if (!token) {
      ctx.throw(403, 'authorization failed. must provide authorization header with credentials')
      return
    }

    const verifiedToken = await jwt.verifyToken(token)

    if (!verifiedToken) {
      ctx.throw(403, 'authorization failed')
      return
    }

    return next()
  }
}

module.exports = auth
