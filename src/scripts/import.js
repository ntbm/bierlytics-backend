require('dotenv').config({path: '../../.env'})
process.env.create_db = true

main()

async function main () {
  let dbClient = await require('../services/database')
  let beerBrands = [].concat(require('../../data/beerbrands/beers.json'))
  let beerBrandsObjects = beerBrands.map((name)=> {return {name}})
  await dbClient.models.BeerBrand.bulkCreate(beerBrandsObjects)
}
