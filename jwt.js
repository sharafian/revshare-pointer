const config = require('./config')
const debug = require('debug')('revshare-pointer:jwt')
const jsonwebtoken = require('jsonwebtoken')

const jwt = {
  createToken: function(payload, options) {
    options = addAlgorithm(options)
    return jsonwebtoken.sign(payload, config.jwtSecret, options)
  },

  verifyToken: async function(token) {
    let options = {
      iss: config.jwtIssuer,
      aud: config.jwtAudience,
    }
    options = addAlgorithm(options)

    try {
      return jsonwebtoken.verify(token, config.jwtSecret, options)
    } catch (e) {
      debug('verification failed. error=' + e.message)
      return false
    }
  },

  decodeToken: function(token) {
    return jsonwebtoken.decode(token, {complete: true})
  }
}

function addAlgorithm (options) {
  if(options) {
    options['algorithm'] = 'HS256'
  } else {
    options = {algorithm: 'HS256'}
  }
  return options
}

module.exports = jwt
