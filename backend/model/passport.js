import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "./Signup.js";
import dotenv from "dotenv";
dotenv.config();



passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({
          email: profile.emails[0].value
        });

        if (!user) {
          user = new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            isVerified: true,
            role: "user"
          });
        } else {
          user.googleId = profile.id;
          user.isVerified = true;
        }

        await user.save();
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

export default passport;