const config = {
  port: process.env.REVSHARE_PORT || 8080,
  dbPath: process.env.REVSHARE_DB_PATH || './revshare-pointer-db',
  token: process.env.REVSHARE_REQUEST_TOKEN || 'test',
  jwtSecret: process.env.REVSHARE_JWT_SECRET || 'test',
  jwtIssuer: process.env.REVSHARE_JWT_ISS || 'test',
  jwtAudience: process.env.REVSHARE_JWT_AUD || 'test',
  jwtExpiration: process.env.REVSHARE_JWT_EXP || '10m'
}

module.exports = config
