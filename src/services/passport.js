const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const LocalStrategy = require('passport-local');
const User = require('../models/User');

// Local strategy - authenticate the user with email/password
// and return the token representing them.
const localLogin = new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user) return done(null, false);

    user.comparePassword(password, (err, isMatch) => {
      if (err) return done(err, false);
      if (!isMatch) return done(null, false);

      done(null, user);
    });
  } catch (err) {
    done(err, false);
  }
});

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET_KEY
};

const jwtLogin = new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const user = await User.findById(payload.sub);

    return user ? done(null, user) : done(null, false);
  } catch (err) {
    return done(err, false);
  }
});

passport.use(localLogin);
passport.use(jwtLogin);
