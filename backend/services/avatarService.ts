/**
 * Generate a "talking avatar" media URL from an MP3 audio buffer.
 * For the free setup we skip external avatar APIs and simply return
 * an audio data URL. The frontend renders a local animated avatar
 * synced to this audio.
 */
export async function generateAvatarVideo(audioBuffer: Buffer): Promise<string> {
  const base64 = audioBuffer.toString('base64');
  return `data:audio/mpeg;base64,${base64}`;
}

