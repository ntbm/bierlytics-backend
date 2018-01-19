const Sequelize = require('sequelize')

module.exports = (dbClient) => {
  let Group = dbClient.define('Group', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: Sequelize.DataTypes.STRING,
      required: true
    },
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
  return Group
}