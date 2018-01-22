const Sequelize = require('sequelize')

module.exports = database_client_factory()

async function database_client_factory () {
  let client = new Sequelize('database', 'username', 'password', {
    dialect: 'sqlite',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    storage: 'database.sqlite'
  })
  registerModels(client)
  applyRelations(client)
  await client.sync({
    force: process.env.create_db
  })
  return client
}
async function registerModels (client) {
    require('../models/user')(client)
    require('../models/group')(client)
    require('../models/beerbrand')(client)
    require('../models/beer')(client)
    require('../models/auth-token')(client)
}
function applyRelations(client){
  let {User, Group, Beer, BeerBrand, AuthToken} = client.models
  User.belongsToMany(Group, {
    as: 'groups',
    through: 'DrinkingBuddies',
    foreignKey: 'group_id'
  })
  Group.belongsToMany(User, {
    as: 'members',
    through: 'DrinkingBuddies',
    foreignKey: 'user_id'
  })
  AuthToken.belongsTo(User, {foreignKey: 'userId', targetKey: 'id'})
  User.hasMany(AuthToken, {foreignKey: 'userId', sourceKey: 'id'})
  Beer.belongsTo(User, {foreignKey: 'userId', targetKey: 'id'})
  User.hasMany(Beer, {foreignKey: 'userId', sourceKey: 'id'})
  Beer.belongsTo(BeerBrand, {foreignKey: 'beerBrandId', targetKey: 'id'})
  BeerBrand.hasMany(Beer, {foreignKey: 'beerBrandId', sourceKey: 'id'})
  Beer.belongsTo(Group, {foreignKey: 'groupId', targetKey: 'id'})
  Group.hasMany(Beer, {foreignKey: 'groupId', sourceKey: 'id'})
}