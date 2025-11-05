const express = require('express');
const admin = require('../firebase');

const router = express.Router();

// Register endpoint
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });
    res.status(201).json({ uid: userRecord.uid, email: userRecord.email });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login endpoint (returns a custom token)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Firebase Admin SDK does not support password verification directly.
    // In production, use Firebase Client SDK on frontend for login.
    // Here, we simulate login by finding the user and issuing a custom token.
    const user = await admin.auth().getUserByEmail(email);
    // Instruct frontend to use Firebase Client SDK for password login.
    res.status(200).json({
      message: 'Use Firebase Client SDK for password login. Backend can issue custom tokens for session management if needed.',
      uid: user.uid,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router; 