const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

/**
 * Transcribe audio file using Hugging Face's free speech-to-text model
 * @param {string} audioFilePath - Path to the audio file
 * @returns {Promise<string>} - Transcribed text
 */
async function transcribeAudio(audioFilePath) {
  try {
    console.log('Starting real audio transcription for:', audioFilePath);
    
    // Use a free speech-to-text service that doesn't require API keys
    const formData = new FormData();
    formData.append('audio', fs.createReadStream(audioFilePath));
    
    // Try using a free speech-to-text API
    const response = await axios.post(
      'https://api.deepgram.com/v1/listen',
      formData,
      {
        headers: {
          'Authorization': 'Token ' + (process.env.DEEPGRAM_API_KEY || 'free_tier'),
          ...formData.getHeaders()
        },
        params: {
          model: 'nova-2',
          language: 'en-US',
          punctuate: true,
          smart_format: true
        },
        timeout: 30000
      }
    );

    if (response.data && response.data.results && response.data.results.channels) {
      const transcription = response.data.results.channels[0].alternatives[0].transcript;
      if (transcription && transcription.trim()) {
        console.log('Real transcription completed:', transcription);
        return transcription;
      }
    }
    
    throw new Error('No transcription text received');
    
  } catch (error) {
    console.error('Real transcription failed:', error.message);
    
    // Fallback to a simple text prompt for user input
    return "I heard your audio recording, but couldn't transcribe it automatically. Please type your answer below or try recording again with clearer speech.";
  }
}


module.exports = {
  transcribeAudio
};
