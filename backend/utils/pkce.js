const crypto = require('crypto');

/**
 * Generate a random code verifier for PKCE
 * @returns {string} A random code verifier (43-128 characters)
 */
function generateCodeVerifier() {
  // Generate a random string of 43-128 characters (RFC 7636)
  const length = Math.floor(Math.random() * (128 - 43 + 1)) + 43;
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('base64url')
    .slice(0, length);
}

/**
 * Generate a code challenge from a code verifier using SHA256
 * @param {string} verifier - The code verifier
 * @returns {string} The base64url encoded SHA256 hash of the verifier
 */
function generateCodeChallenge(verifier) {
  return crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64url');
}

module.exports = {
  generateCodeVerifier,
  generateCodeChallenge,
};

