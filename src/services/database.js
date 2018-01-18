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
  await client.sync()
  return client
}
async function registerModels (client) {
    require('../models/user')(client)
    require('../models/group')(client)
}
function applyRelations(client){
  let {User, Group} = client.models
  User.belongsToMany(Group, {
    as: 'groups',
    through: 'DrinkingBuddies',
    foreignKey: 'id'
  })
  Group.belongsToMany(User, {
    as: 'members',
    through: 'DrinkingBuddies',
    foreignKey: 'id'
  })
}