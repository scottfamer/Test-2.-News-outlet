import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// In-memory cache for TTS audio URLs
const ttsCache = new Map<number, string>();

// Directory for caching TTS audio files
const TTS_CACHE_DIR = path.join(process.cwd(), 'data', 'tts-cache');

// Ensure cache directory exists
if (!fs.existsSync(TTS_CACHE_DIR)) {
  fs.mkdirSync(TTS_CACHE_DIR, { recursive: true });
}

/**
 * Generate text-to-speech audio for an article
 * Uses OpenAI TTS API with 'alloy' voice for consistency
 */
export async function generateTTS(
  articleId: number,
  headline: string,
  summary: string,
  fullText: string
): Promise<Buffer> {
  try {
    // Check if we have a cached file
    const cacheFilePath = getCacheFilePath(articleId);
    if (fs.existsSync(cacheFilePath)) {
      console.log(`📢 Using cached TTS for article ${articleId}`);
      return fs.readFileSync(cacheFilePath);
    }

    // Construct the text to read
    // Format: "Headline. [pause] Summary. [pause] Full article text."
    const textToRead = `${headline}. ${summary}. ${fullText || ''}`;
    
    // Limit text length to avoid excessive costs (OpenAI TTS has limits)
    const maxLength = 4096; // OpenAI TTS max is 4096 characters
    const truncatedText = textToRead.length > maxLength 
      ? textToRead.substring(0, maxLength - 3) + '...'
      : textToRead;

    console.log(`🎙️  Generating TTS for article ${articleId} (${truncatedText.length} chars)`);

    // Generate TTS using OpenAI
    const mp3Response = await openai.audio.speech.create({
      model: 'tts-1', // Use tts-1 for faster, cheaper generation (tts-1-hd for higher quality)
      voice: 'alloy', // Consistent voice: alloy, echo, fable, onyx, nova, shimmer
      input: truncatedText,
      speed: 1.0, // Normal speed
    });

    // Convert response to buffer
    const arrayBuffer = await mp3Response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Cache the audio file
    fs.writeFileSync(cacheFilePath, buffer);
    ttsCache.set(articleId, `/api/news/${articleId}/tts`);

    console.log(`✅ TTS generated and cached for article ${articleId}`);

    return buffer;
  } catch (error) {
    console.error('Error generating TTS:', error);
    throw error;
  }
}

/**
 * Get cached TTS URL for an article
 */
export function getTTSCache(articleId: number): string | null {
  const cacheFilePath = getCacheFilePath(articleId);
  if (fs.existsSync(cacheFilePath)) {
    return `/api/news/${articleId}/tts`;
  }
  return ttsCache.get(articleId) || null;
}

/**
 * Clear TTS cache for an article
 */
export function clearTTSCache(articleId: number): void {
  const cacheFilePath = getCacheFilePath(articleId);
  if (fs.existsSync(cacheFilePath)) {
    fs.unlinkSync(cacheFilePath);
  }
  ttsCache.delete(articleId);
}

/**
 * Clear all TTS cache
 */
export function clearAllTTSCache(): void {
  if (fs.existsSync(TTS_CACHE_DIR)) {
    const files = fs.readdirSync(TTS_CACHE_DIR);
    for (const file of files) {
      fs.unlinkSync(path.join(TTS_CACHE_DIR, file));
    }
  }
  ttsCache.clear();
  console.log('🗑️  All TTS cache cleared');
}

/**
 * Get cache file path for an article
 */
function getCacheFilePath(articleId: number): string {
  return path.join(TTS_CACHE_DIR, `article-${articleId}.mp3`);
}

/**
 * Get cache statistics
 */
export function getTTSCacheStats() {
  const files = fs.existsSync(TTS_CACHE_DIR) 
    ? fs.readdirSync(TTS_CACHE_DIR) 
    : [];
  
  let totalSize = 0;
  for (const file of files) {
    const filePath = path.join(TTS_CACHE_DIR, file);
    totalSize += fs.statSync(filePath).size;
  }

  return {
    cachedCount: files.length,
    totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
  };
}
