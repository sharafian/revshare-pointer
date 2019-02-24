const config = {
  token: process.env.REVSHARE_LOGIN_TOKEN || 'test',
  jwtSecret: process.env.REVSHARE_JWT_SECRET || 'test',
  jwtIssuer: process.env.REVSHARE_JWT_ISS || 'test',
  jwtAudience: process.env.REVSHARE_JWT_AUD || 'test',
  jwtExpiration: process.env.REVSHARE_JWT_EXP || '10m'
}

module.exports = config
