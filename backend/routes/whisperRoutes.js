const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { transcribeAudio } = require('../utils/whisper');
const { authMiddleware } = require('../middleware/auth');

// Configure multer for audio file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `audio-${uniqueSuffix}.webm`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    const allowedTypes = ['audio/webm', 'audio/wav', 'audio/mpeg', 'audio/ogg', 'audio/mp4'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'), false);
    }
  }
});

/**
 * POST /api/transcribe
 * Upload audio file and transcribe using Whisper API
 */
router.post('/transcribe', authMiddleware, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No audio file provided',
        message: 'Please upload an audio file'
      });
    }

    // Transcribe the audio
    const transcription = await transcribeAudio(req.file.path);

    // Clean up the uploaded file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Error deleting uploaded file:', err);
    });

    res.json({
      success: true,
      transcription: transcription,
      message: 'Audio transcribed successfully'
    });

  } catch (error) {
    console.error('Transcription error:', error);

    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file after error:', err);
      });
    }

    res.status(500).json({
      error: 'Transcription failed',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * GET /api/transcribe/status
 * Check if transcription service is available
 */
router.get('/status', (req, res) => {
  res.json({
    status: 'available',
    message: 'Whisper transcription service is ready'
  });
});

module.exports = router;
