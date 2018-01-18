const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth2').Strategy

module.exports = function (dbClient) {
  passport.serializeUser((user, done) => {
    done(null, user)
  })

  passport.deserializeUser((obj, done) => {
    done(null, obj)
  })

  passport.use(new GoogleStrategy(
    {
      clientID: process.env.clientID,
      clientSecret: process.env.clientSecret,
      callbackURL: `${process.env.APPURL}/auth/google/return`
    }, (accessToken, refreshToken, profile, done) => {
      console.log(accessToken, refreshToken, profile)
      dbClient.models.User.findOrCreate({
        where: {
          googleId: profile.id
        },
        defaults: {
          displayName: profile.displayName
        }
      })
        .then( user => {
          delete user.googleId
          return done(null, user)
        })
        .catch(_ => done(_, null))
    }))
  return passport
}

