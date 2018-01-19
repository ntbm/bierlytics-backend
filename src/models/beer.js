const Sequelize = require('sequelize')

module.exports = (dbClient) => {
  let Beer = dbClient.define('Beer', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    date: {
      type: Sequelize.DataTypes.DATE,
      required: true
    }
  })
  return Beer
}