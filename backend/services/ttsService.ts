import axios from 'axios';
import { UpstreamError } from './errors';

/**
 * Convert text into natural speech using a free TTS service.
 * Returns an MP3 audio buffer.
 * 
 * Note: For a production app, consider using a paid TTS service for better quality.
 * This free implementation uses Google Translate TTS which may have rate limits.
 */
export async function textToSpeech(text: string): Promise<Buffer> {
  try {
    // Use Google Translate TTS (free, public endpoint)
    const lang = process.env.TTS_LANG || 'en-US';
    const encodedText = encodeURIComponent(text.substring(0, 200)); // Limit length to avoid issues
    
    // Try multiple endpoints for reliability
    const endpoints = [
      `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${lang}&client=tw-ob`,
      `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=en&client=gtx`
    ];

    for (const url of endpoints) {
      try {
        const response = await axios.get<ArrayBuffer>(url, {
          responseType: 'arraybuffer',
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Referer': 'https://translate.google.com/',
            'Accept': 'audio/mpeg, audio/*'
          },
          maxRedirects: 5
        });

        if (response.data && response.data.byteLength > 0) {
          return Buffer.from(response.data);
        }
      } catch (endpointErr) {
        // Try next endpoint if this one fails
        console.warn('[ttsService] Endpoint failed, trying next...', endpointErr instanceof Error ? endpointErr.message : '');
        continue;
      }
    }

    throw new Error('All TTS endpoints failed');
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      const detail = err.response?.data ? String(err.response.data).substring(0, 100) : err.message;
      console.error('[ttsService] TTS error:', status, detail);
      throw new UpstreamError('tts', `Text-to-speech failed: ${detail}`, status);
    }

    const message = err instanceof Error ? err.message : 'Unknown TTS error';
    console.error('[ttsService] TTS unknown error:', message);
    throw new UpstreamError('tts', `Text-to-speech failed: ${message}`, undefined);
  }
}

