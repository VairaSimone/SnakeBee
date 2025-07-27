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
    // Cerchiamo o creiamo l'utente in DB
    // Prima cerchi l'utente con googleId o (in mancanza) con email:
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
      if (googleRefreshToken) {
        user.googleStoredRefreshToken = googleRefreshToken;
      }
    } else {
      user = new User({
        googleId,
        name: name || "Unknown Name",
        email,
        avatar: picture || defaultAvatarURL,
        googleStoredRefreshToken
      });
    }
    await user.save();
    // Generiamo i nostri token JWT
    const appAccessToken = jwt.sign(
      { userid: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h", algorithm: "HS256" }
    );
    const appRefreshToken = jwt.sign(
      { userid: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // Hashiamo e salviamo il refresh token JWT nel DB
    const hashed = await bcrypt.hash(appRefreshToken, 12);
    user.refreshTokens = user.refreshTokens || [];
    if (user.refreshTokens.length >= 10) {
      user.refreshTokens = user.refreshTokens.slice(-9);
    }
    user.refreshTokens.push({ token: hashed });
    await user.save();

    // Rimandiamo tutto a Passport
    return passportNext(null, {
      accessToken: appAccessToken,
      refreshToken: appRefreshToken,
      googleId: user.googleId,
      name: user.name,
      email: user.email
    });
  } catch (err) {
    console.error("Google Authentication Error: ", err);
    return passportNext(err, null);
  }
});

export default googleStrategy;
