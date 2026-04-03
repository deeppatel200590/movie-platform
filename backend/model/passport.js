import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "./Signup.js"; // ✅ correct path

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
},
async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ email: profile.emails[0].value });

    if (!user) {
      user = new User({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value
      });
    } else {
      user.googleId = profile.id; // link account
    }

    await user.save();
    return done(null, user);

  } catch (err) {
    return done(err, null);
  }
}));

export default passport;