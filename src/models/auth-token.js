const Sequelize = require('sequelize')
const crypto = require('crypto')

module.exports = (dbClient) => {
  let AuthToken = dbClient.define('AuthToken', {
    token: {
      type: Sequelize.DataTypes.STRING,
      primaryKey: true,
      defaultValue: () => crypto.createHash('sha512').update(Date.now().toString() + Math.random()).digest('hex')
    }
  })
  return AuthToken
}