const { OAuth2Client } = require("google-auth-library");

// Initialize Google OAuth2 client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Verify Google ID token and extract user information
 * @param {string} idToken - Google ID token from frontend
 * @returns {Promise<Object>} Google user info
 */
const verifyGoogleToken = async (idToken) => {
  try {
    if (!idToken || typeof idToken !== "string") {
      throw new Error("Invalid Google token format");
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      throw new Error("Invalid Google token payload");
    }

    return {
      googleId: payload.sub,
      email: payload.email,
      emailVerified: payload.email_verified || false,
      name: payload.name || payload.email.split("@")[0],
      firstName: payload.given_name || "",
      lastName: payload.family_name || "",
      picture: payload.picture || null,
      locale: payload.locale || "en",
    };
  } catch (error) {
    throw new Error("Invalid Google token: " + error.message);
  }
};

module.exports = { verifyGoogleToken };
