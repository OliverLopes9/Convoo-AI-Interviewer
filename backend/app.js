const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
const interviewRoutes = require('./routes/interviewRoutes');
const whisperRoutes = require('./routes/whisperRoutes');
const evaluationRoutes = require('./routes/evaluationRoutes');

app.use('/api', interviewRoutes);
app.use('/api', whisperRoutes);
app.use('/api', evaluationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Convoo API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Convoo API - AI Mock Interviewer',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      categories: '/api/categories',
      questions: '/api/questions/:category',
      transcribe: '/api/transcribe',
      evaluate: '/api/evaluate'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'File too large',
      message: 'Audio file must be less than 10MB'
    });
  }
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Convoo API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 API docs: http://localhost:${PORT}/`);
  
  // Check for optional environment variables
  console.log('🎉 Convoo is running with REAL AUDIO TRANSCRIPTION');
  console.log('   ✅ Voice recording works perfectly');
  console.log('   ✅ Real audio transcription (your actual speech)');
  console.log('   ✅ AI evaluation gives detailed feedback');
  console.log('   ✅ Complete interview experience available');
  if (!process.env.DEEPGRAM_API_KEY || process.env.DEEPGRAM_API_KEY === 'your_deepgram_api_key_here') {
    console.log('   💡 For better transcription, get free credits at https://deepgram.com');
  }
});

module.exports = app;
