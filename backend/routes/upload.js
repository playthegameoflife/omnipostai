const express = require('express');
const admin = require('../firebase');
const authenticateToken = require('../middleware/auth');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const storage = admin.storage();
const bucket = storage.bucket();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images and videos
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov|avi/;
    const extname = allowedTypes.test(file.originalname.toLowerCase().split('.').pop());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and videos are allowed.'));
    }
  }
});

// Upload media file
router.post('/', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const userId = req.user.uid;
    const file = req.file;
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${userId}/${uuidv4()}.${fileExtension}`;
    
    // Create file reference in Firebase Storage
    const fileRef = bucket.file(fileName);
    
    // Upload file to Firebase Storage
    const stream = fileRef.createWriteStream({
      metadata: {
        contentType: file.mimetype,
        metadata: {
          originalName: file.originalname,
          uploadedBy: userId,
          uploadedAt: new Date().toISOString()
        }
      },
      public: true, // Make file publicly accessible
    });

    stream.on('error', (error) => {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Failed to upload file' });
    });

    stream.on('finish', async () => {
      try {
        // Make file publicly accessible
        await fileRef.makePublic();
        
        // Get public URL
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        
        res.json({
          success: true,
          url: publicUrl,
          fileName: fileName,
          contentType: file.mimetype,
          size: file.size
        });
      } catch (error) {
        console.error('Error making file public:', error);
        res.status(500).json({ error: 'Failed to make file public' });
      }
    });

    stream.end(file.buffer);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload from URL (for external images/videos)
router.post('/url', authenticateToken, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'No URL provided' });
    }

    const axios = require('axios');
    const userId = req.user.uid;
    
    // Download file from URL
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    const contentType = response.headers['content-type'] || 'application/octet-stream';
    
    // Determine file extension from content type or URL
    let fileExtension = 'jpg';
    if (contentType.includes('png')) fileExtension = 'png';
    else if (contentType.includes('gif')) fileExtension = 'gif';
    else if (contentType.includes('webp')) fileExtension = 'webp';
    else if (contentType.includes('mp4')) fileExtension = 'mp4';
    else if (contentType.includes('mov')) fileExtension = 'mov';
    
    const fileName = `${userId}/${uuidv4()}.${fileExtension}`;
    const fileRef = bucket.file(fileName);
    
    // Upload to Firebase Storage
    const stream = fileRef.createWriteStream({
      metadata: {
        contentType: contentType,
        metadata: {
          sourceUrl: url,
          uploadedBy: userId,
          uploadedAt: new Date().toISOString()
        }
      },
      public: true,
    });

    stream.on('error', (error) => {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Failed to upload file' });
    });

    stream.on('finish', async () => {
      try {
        await fileRef.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        
        res.json({
          success: true,
          url: publicUrl,
          fileName: fileName,
          contentType: contentType,
          size: buffer.length
        });
      } catch (error) {
        console.error('Error making file public:', error);
        res.status(500).json({ error: 'Failed to make file public' });
      }
    });

    stream.end(buffer);
  } catch (error) {
    console.error('Upload from URL error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete media file
router.delete('/:fileName', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const fileName = req.params.fileName;
    
    // Verify file belongs to user
    if (!fileName.startsWith(`${userId}/`)) {
      return res.status(403).json({ error: 'Unauthorized to delete this file' });
    }
    
    const fileRef = bucket.file(fileName);
    await fileRef.delete();
    
    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    if (error.code === 404) {
      res.status(404).json({ error: 'File not found' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

module.exports = router;


