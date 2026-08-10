const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user");

module.exports = function (passport) {
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email: email.toLowerCase().trim() });
          if (!user) {
            return done(null, false, { message: "Invalid email or password." });
          }
          if (!user.password) {
            return done(null, false, {
              message: "Account created via social sign-in. Please log in with Google or Apple.",
            });
          }
          const isMatch = await user.comparePassword(password);
          if (!isMatch) {
            return done(null, false, { message: "Invalid email or password." });
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  if (process.env.CLIENT_ID && process.env.CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.CLIENT_ID,
          clientSecret: process.env.CLIENT_SECRET,
          callbackURL: "http://localhost:3000/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email =
              profile.emails && profile.emails[0]
                ? profile.emails[0].value.toLowerCase().trim()
                : "";
            const googleId = profile.id;
            const name = profile.displayName || "Google User";

            let user = await User.findOne({ googleId });
            if (!user && email) {
              user = await User.findOne({ email });
              if (user) {
                user.googleId = googleId;
                await user.save();
              }
            }
            if (!user) {
              user = await User.create({
                name,
                email: email || `${googleId}@google.com`,
                googleId,
              });
            }
            return done(null, user);
          } catch (err) {
            return done(err);
          }
        }
      )
    );
  }

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};
