const Sequelize = require('sequelize')

module.exports = (dbClient) => {
  let User = dbClient.define('User', {
    googleId: {
      type: Sequelize.DataTypes.INTEGER,
      required: true,
      unique: true,
    },
    displayName: Sequelize.DataTypes.STRING
  }, {
    instanceMethods: {},
    scopes: {
      auth: (googleId) => {
        return {
          where: {googleId}
        }
      },
      defaultScope: {
        attributes: {
          include: ['displayName', 'id'],
          exclude: ['googleId', 'created_at', 'updated_at']
        }
      }
    },
    underscored: true,
  })
  return User
}