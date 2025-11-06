const express = require('express');
const admin = require('../firebase');
const axios = require('axios');

const router = express.Router();
const db = admin.firestore();

// Send contact form message
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // Validate input
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Store contact form submission in database
    const contactSubmission = {
      name,
      email,
      subject,
      message,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'pending'
    };
    
    const docRef = await db.collection('contact_submissions').add(contactSubmission);
    
    // Send email notification (if email service is configured)
    try {
      const emailServiceUrl = process.env.EMAIL_SERVICE_URL;
      const emailApiKey = process.env.EMAIL_API_KEY;
      
      if (emailServiceUrl && emailApiKey) {
        // Send email using external email service (SendGrid, Mailgun, etc.)
        await axios.post(emailServiceUrl, {
          to: process.env.CONTACT_EMAIL || 'support@omnipost.ai',
          from: email,
          subject: `Contact Form: ${subject}`,
          text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
          `
        }, {
          headers: {
            'Authorization': `Bearer ${emailApiKey}`,
            'Content-Type': 'application/json'
          }
        });
      } else {
        // Log email instead of sending if service not configured
        console.log('Contact form submission:', contactSubmission);
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError.message);
      // Don't fail the request if email fails
    }
    
    res.json({
      success: true,
      message: 'Thank you for contacting us! We will get back to you soon.',
      submissionId: docRef.id
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: 'Failed to submit contact form' });
  }
});

// Get contact submissions (admin only - would need admin auth middleware)
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('contact_submissions')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();
    
    const submissions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json({ submissions });
  } catch (error) {
    console.error('Get contact submissions error:', error);
    res.status(500).json({ error: 'Failed to fetch contact submissions' });
  }
});

module.exports = router;


