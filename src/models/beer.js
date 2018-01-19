const Sequelize = require('sequelize')

module.exports = (dbClient) => {
  let Beer = dbClient.define('Beer', {
    date: {
      type: Sequelize.DataTypes.DATE,
      required: true
    }
  })
  return Beer
}