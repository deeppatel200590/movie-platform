const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

// import your User model
const User = require("./User");

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
},
async (accessToken, refreshToken, profile, done) => {
  try {
    // check if user exists
    let user = await User.findOne({ googleId: profile.id });

    if (!user) {
      // create new user
      user = new User({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value
      });
      await user.save();
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

export default passport;