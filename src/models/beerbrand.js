const Sequelize = require('sequelize')

module.exports = (dbClient) => {
  let BeerBrand = dbClient.define('BeerBrand', {
    name: {
      type: Sequelize.DataTypes.STRING,
      required: true,
      unique: true
    }
  })
  return BeerBrand
}