const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const { users, findUserByUsername, findUserById } = require('../models/user');

module.exports = function(passport) {
  // Local Strategy
  passport.use(new LocalStrategy(
    { usernameField: 'username' },
    async (username, password, done) => {
      try {
        const user = findUserByUsername(username);
        
        if (!user) {
          return done(null, false, { message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
          return done(null, false, { message: 'Invalid credentials' });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  ));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    try {
      const user = findUserById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};
