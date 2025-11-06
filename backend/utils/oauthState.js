const crypto = require('crypto');

// In-memory store for OAuth state tokens (expires after 10 minutes)
const stateStore = new Map();
const STATE_EXPIRY = 10 * 60 * 1000; // 10 minutes

/**
 * Generate a secure state token for OAuth flow
 * Combines idToken with a random nonce for CSRF protection
 * @param {string} idToken - Firebase ID token
 * @returns {string} Encrypted state token
 */
function generateState(idToken) {
  const nonce = crypto.randomBytes(32).toString('hex');
  const timestamp = Date.now();
  
  // Create a state token that includes idToken, nonce, and timestamp
  const stateData = {
    idToken,
    nonce,
    timestamp,
  };
  
  // Encode the state data (simple base64 encoding for now)
  // In production, consider encrypting this for additional security
  const stateToken = Buffer.from(JSON.stringify(stateData)).toString('base64url');
  
  // Store the state token with expiration
  stateStore.set(stateToken, {
    idToken,
    nonce,
    timestamp,
    expiresAt: timestamp + STATE_EXPIRY,
  });
  
  // Clean up expired states periodically
  cleanupExpiredStates();
  
  return stateToken;
}

/**
 * Validate and extract idToken from state token
 * @param {string} stateToken - The state token from OAuth callback
 * @returns {string|null} The idToken if valid, null otherwise
 */
function validateState(stateToken) {
  if (!stateToken) {
    return null;
  }
  
  // Check if state exists in store
  const storedState = stateStore.get(stateToken);
  
  if (!storedState) {
    // Try to decode from token (fallback for backwards compatibility)
    try {
      const decoded = JSON.parse(Buffer.from(stateToken, 'base64url').toString());
      if (decoded.idToken && decoded.timestamp) {
        // Check if expired (more than 10 minutes old)
        if (Date.now() - decoded.timestamp > STATE_EXPIRY) {
          return null;
        }
        return decoded.idToken;
      }
    } catch (e) {
      // Invalid state token
      return null;
    }
    return null;
  }
  
  // Check if expired
  if (Date.now() > storedState.expiresAt) {
    stateStore.delete(stateToken);
    return null;
  }
  
  // Remove used state (one-time use)
  stateStore.delete(stateToken);
  
  return storedState.idToken;
}

/**
 * Clean up expired states from the store
 */
function cleanupExpiredStates() {
  const now = Date.now();
  for (const [token, data] of stateStore.entries()) {
    if (now > data.expiresAt) {
      stateStore.delete(token);
    }
  }
}

/**
 * Clear all states (useful for testing)
 */
function clearAllStates() {
  stateStore.clear();
}

module.exports = {
  generateState,
  validateState,
  clearAllStates,
};

