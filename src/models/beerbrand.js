const Sequelize = require('sequelize')

module.exports = (dbClient) => {
  let BeerBrand = dbClient.define('BeerBrand', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: Sequelize.DataTypes.STRING,
      required: true,
      unique: true
    }
  })
  return BeerBrand
}