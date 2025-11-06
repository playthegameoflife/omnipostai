// In-memory store for PKCE code verifiers (expires after 10 minutes)
const verifierStore = new Map();
const VERIFIER_EXPIRY = 10 * 60 * 1000; // 10 minutes

/**
 * Store a code verifier with a state token as key
 * @param {string} stateToken - The OAuth state token
 * @param {string} codeVerifier - The PKCE code verifier
 */
function storeVerifier(stateToken, codeVerifier) {
  verifierStore.set(stateToken, {
    codeVerifier,
    timestamp: Date.now(),
    expiresAt: Date.now() + VERIFIER_EXPIRY,
  });
  
  // Clean up expired verifiers periodically
  cleanupExpiredVerifiers();
}

/**
 * Get and remove a code verifier by state token
 * @param {string} stateToken - The OAuth state token
 * @returns {string|null} The code verifier if found, null otherwise
 */
function getVerifier(stateToken) {
  const stored = verifierStore.get(stateToken);
  
  if (!stored) {
    return null;
  }
  
  // Check if expired
  if (Date.now() > stored.expiresAt) {
    verifierStore.delete(stateToken);
    return null;
  }
  
  // Remove used verifier (one-time use)
  verifierStore.delete(stateToken);
  
  return stored.codeVerifier;
}

/**
 * Clean up expired verifiers from the store
 */
function cleanupExpiredVerifiers() {
  const now = Date.now();
  for (const [token, data] of verifierStore.entries()) {
    if (now > data.expiresAt) {
      verifierStore.delete(token);
    }
  }
}

/**
 * Clear all verifiers (useful for testing)
 */
function clearAllVerifiers() {
  verifierStore.clear();
}

module.exports = {
  storeVerifier,
  getVerifier,
  clearAllVerifiers,
};

