async function main () {
  const express = require('express')
  // const loggedIn = require('connect-ensure-login').ensureLoggedIn
  let dbClient
  try {
    dbClient = await require('./services/database')
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
  let passport = require('./services/passport')(dbClient)
  let app = express()
  app.use(require('morgan')('tiny'))
  app.use((req, res, next) => {
    req.models = req.models || dbClient.models
    next()
  })
  app.use(require('cookie-parser')())
  app.use(require('body-parser').urlencoded({extended: true}))
  app.use(require('body-parser').json())

  app.use(passport.initialize())

  app.get('/', (req, res) => res.send('Website'))
  app.get('/login', (req, res) => res.send('login'))
  app.get('/auth/google', passport.authenticate('google', {scope: ['profile']}))
  app.get(
    '/auth/google/return',
    passport.authenticate('google', {failureRedirect: '/login'}),
    async function (req, res) {
      let token = (await req.models.AuthToken.create({userId: req.user[0].id})).token
      res.redirect('OAuthLogin://login?user=' + JSON.stringify({user: req.user[0], token}))
      // res.json({'auth': token.token})
    }
  )
  app.get('/api/ping', (req, res) => {
    console.log('ping')
    res.json({})
  })
  app.use('/api', (req, res, next) => {
    req.models.AuthToken.findOne({
      where: {token: req.headers['auth']}
    })
      .then(authtoken => {
        if (!authtoken) return Promise.reject('NO_AUTH')
        return req.models.User.findById(authtoken.userId)
      })
      .then(user => {
        if (!user) return Promise.reject('NO_USER')
        req.user = user
        return next()
      })
      .catch(error => {
        console.error(error)
        req.user = null
        next()
      })
  })

  function isLoggedIn (req, res, next) {
    if (req.user) {
      console.log('logged in')
      return next()
    } else {
      console.log('not logged in')
      return res.status(401).send()
    }
  }

  app.get('/api/beerbrands', (req, res) => {
    req.models.BeerBrand.findAll()
      .then(brands => res.json(brands))
  })
  app.use('/api', isLoggedIn)
  app.get('/api/users', (req, res) => {
    req.models.User.findAll()
      .then(users => res.json(users))
  })
  app.get('/api/users/self/groups', async (req, res) => {
    let groups = await req.user.getGroups()
    res.json(groups)
  })
  app.get('/api/users/self/beers', async (req, res) => {
    let my_beers = await req.user.getBeers()
    res.json(my_beers)
  })

  function emptyPromise () {
    return new Promise((res) => res(null))
  }

  app.post('/api/beer', async (req, res) => {
    let {groupId, brandId} = req.body
    let groupPromise = groupId ? req.models.Group.findById(groupId) : emptyPromise()
    let brandPromise = brandId ? req.models.BeerBrand.findById(brandId) : emptyPromise()
    let [group, brand] = await Promise.all([groupPromise, brandPromise])
    req.models.Beer.create({})
      .then(beer => beer.setUser(req.user))
      .then(beer => group ? beer.setGroup(group) : beer)
      .then(beer => brand ? beer.setBeerBrand(brand) : beer)
      .then(beer => res.json(beer))
  })

  app.param('groupId', (req, res, next, param) => {
    req.models.Group.findOne({
      where: {
        id: param
      },
      include: [
        {model: req.models.User, as: 'members'}
      ]
    }).then(group => {
      req.group = group
      next()
    })
  })
  app.get('/api/groups', (req, res) => {
    req.models.Group.findAll()
      .then(groups => res.json(groups))
  })
  app.get('/api/groups/:groupId', (req, res) => {
    res.json(req.group)
  })
  app.post('/api/groups', async (req, res) => {
    let group = await req.models.Group.create({
      name: req.body.name || Math.random()
    })
    await group.addMember(req.user)
    res.json(group)
  })
  app.post('/api/groups/:groupId/join', async (req, res) => {
    let group = await req.group.addMembers(req.user)
    res.json(group)
  })
  return app
}

main().then(app => {
  app.listen(
    process.env.PORT || 8000,
    () => console.log(`Server started at ${process.env.PORT || 8000}`)
  )
})
