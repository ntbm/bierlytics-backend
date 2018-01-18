async function main () {
  const express = require('express')
  const loggedIn = require('connect-ensure-login').ensureLoggedIn
  let dbClient
  try {
    dbClient = await require('./services/database')
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
  let passport = require('./services/passport')(dbClient)
  let app = express()
  app.use((req, res, next) => {
    req.models = req.models || dbClient.models
    next()
  })
  app.use(require('cookie-parser')())
  app.use(require('body-parser').urlencoded({extended: true}))
  app.use(require('body-parser').json())
  app.use(require('express-session')({secret: 'keyboard cat', resave: true, saveUninitialized: true}))

  app.use(passport.initialize())
  app.use(passport.session())

  app.get('/', (req, res) => res.send('Website'))
  app.get('/login', (req, res) => res.send('login'))
  app.get('/auth/google', passport.authenticate('google', {scope: ['profile']}))
  app.get(
    '/auth/google/return',
    passport.authenticate('google', {failureRedirect: '/login'}),
    function (req, res) {
      res.redirect('/')
    }
  )
  // app.use('/api', loggedIn())
  app.get('/api/users', (req, res) => {
    req.models.User.findAll()
      .then(users => res.json(users))
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
    console.log(req.body)
    req.user = await req.models.User.findAll().then(_ => _[0]) //todo remove
    let group = await req.models.Group.create({
      name: req.body.name || Math.random()
    })
    console.log(group)
    await group.addMembers(req.user)
    // await req.user.addGroups(group)
    console.log(`success`)
    res.redirect(`/api/groups/${group.id}`)
  })
  app.listen(process.env.PORT || 8000,
    () => console.log(`Server started at ${process.env.PORT || 8000}`)
  )

}

main()