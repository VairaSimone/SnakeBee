import GoogleStrategy from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcrypt";

// Google strategy for access
const googleStrategy = new GoogleStrategy({
  clientID: process.env.GOOGLE_ID,
  clientSecret: process.env.GOOGLE_SECRET,
  callbackURL: `${process.env.BACKEND_URL}${process.env.GOOGLE_CALLBACK}`
}, async function (googleAccessToken, googleRefreshToken, profile, passportNext) {
  const { name, sub: googleId, email, picture } = profile._json;
  const googleStoredRefreshToken = googleRefreshToken;

  try {
    // Search or create the user in the DB
    // First, search for the user by Google ID or (if not available) by email:
    let user = await User.findOne({
      $or: [
        { googleId: googleId },
        { email: profile._json.email }
      ]
    });
    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
      }
if (googleRefreshToken && googleRefreshToken !== user.googleStoredRefreshToken) {
  user.googleStoredRefreshToken = googleRefreshToken;
}
    } else {
      user = new User({
        googleId,
        name: name || "SnakeBee",
        email,
        avatar: picture,
        googleStoredRefreshToken
      });
    }
    await user.save();
    // Let's generate our JWT tokens
    const appAccessToken = jwt.sign(
      { userid: user._id, role: user.role },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "30min", algorithm: "HS256" }
    );
    const appRefreshToken = jwt.sign(
      { userid: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // Hash and save the JWT refresh token to the DB
    const hashed = await bcrypt.hash(appRefreshToken, 12);
    user.refreshTokens = user.refreshTokens || [];
    if (user.refreshTokens.length >= 10) {
      user.refreshTokens = user.refreshTokens.slice(-9);
    }
    user.refreshTokens.push({ token: hashed });
    await user.save();

    // Let's send everything back to Passport
    return passportNext(null, {
      accessToken: appAccessToken,
      refreshToken: appRefreshToken,
      googleId: user.googleId,
      name: user.name,
      email: user.email,
      avatar: user.avatar
    });
  } catch (err) {
    console.error("Google Authentication Error: ", err);
    return passportNext(err, null);
  }
});

export default googleStrategy;
