import { BibleBook, BibleChapter, BibleContent, Bible, BibleVerse, BibleAudio } from './types';

const API_KEY = process.env.NEXT_PUBLIC_BIBLE_API || process.env.BIBLE_API || '';
const API_URL = process.env.NEXT_PUBLIC_BIBLE_API_URL || process.env.BIBLE_API_URL || 'https://api.scripture.api.bible/v1/';

const headers = {
  'api-key': API_KEY,
};

// Cache for API responses
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function fetchWithCache<T>(url: string, cacheKey: string): Promise<T> {
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}. Please check your Bible API key in .env.local`);
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    cache.set(cacheKey, { data: data.data, timestamp: Date.now() });
    return data.data;
  } catch (error) {
    console.error('API fetch error:', error);
    console.error('To fix: Get a free API key from https://api.scripture.api.bible and update .env.local');
    throw error;
  }
}

export async function getBibles(): Promise<Bible[]> {
  return fetchWithCache<Bible[]>(`${API_URL}bibles`, 'bibles');
}

export async function getBooks(bibleId: string = 'de4e12af7f28f599-02'): Promise<BibleBook[]> {
  return fetchWithCache<BibleBook[]>(`${API_URL}bibles/${bibleId}/books`, `books-${bibleId}`);
}

export async function getChapters(bibleId: string, bookId: string): Promise<BibleChapter[]> {
  return fetchWithCache<BibleChapter[]>(
    `${API_URL}bibles/${bibleId}/books/${bookId}/chapters`,
    `chapters-${bibleId}-${bookId}`
  );
}

export async function getChapter(bibleId: string, chapterId: string): Promise<BibleContent> {
  return fetchWithCache<BibleContent>(
    `${API_URL}bibles/${bibleId}/chapters/${chapterId}?content-type=html&include-notes=false&include-titles=true&include-chapter-numbers=false&include-verse-numbers=true&include-verse-spans=true`,
    `chapter-${bibleId}-${chapterId}`
  );
}

export async function getVerses(bibleId: string, chapterId: string): Promise<BibleVerse[]> {
  return fetchWithCache<BibleVerse[]>(
    `${API_URL}bibles/${bibleId}/chapters/${chapterId}/verses`,
    `verses-${bibleId}-${chapterId}`
  );
}

export async function searchBible(bibleId: string, query: string) {
  const response = await fetch(
    `${API_URL}bibles/${bibleId}/search?query=${encodeURIComponent(query)}&limit=20`,
    { headers }
  );
  const data = await response.json();
  return data.data;
}

// Mock audio data - In production, this would come from an audio Bible API
export async function getChapterAudio(bibleId: string, chapterId: string): Promise<BibleAudio | null> {
  // Try several possible audio endpoints. The official scripture.api.bible may not
  // expose audio on the same path, so we attempt a few common variants and return
  // the first successful result. If none succeed, return null.
  const endpoints = [
    `${API_URL}bibles/${bibleId}/chapters/${chapterId}/audio`,
    `${API_URL}bibles/${bibleId}/audio/chapters/${chapterId}`,
    `${API_URL}audio/bibles/${bibleId}/chapters/${chapterId}`,
  ];

  for (const url of endpoints) {
    const cacheKey = `audio-${bibleId}-${chapterId}-${url}`;
    try {
      // Use fetch directly so we can accept different response shapes
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data as BibleAudio;
      }

      const res = await fetch(url, { headers });
      if (!res.ok) {
        // try next endpoint
        continue;
      }

      const json = await res.json();
      // JSON shape may be { data: { ... } } or direct
      const data = json.data || json;

      // Normalize to our `BibleAudio` shape if possible
      const audio: BibleAudio = {
        id: data.id || `audio-${chapterId}`,
        chapterId,
        reference: data.reference || data.title || `Chapter ${chapterId}`,
        url: data.url || data.audioUrl || data.streamUrl || '',
        duration: data.duration || data.length || 0,
        narrator: data.narrator || data.reader || undefined,
        sections: data.sections || []
      };

      // Cache and return only if we have a usable URL
      if (audio.url) {
        cache.set(cacheKey, { data: audio, timestamp: Date.now() });
        return audio;
      }
    } catch (err) {
      // ignore and try next
      console.warn('Audio endpoint failed:', url, err);
      continue;
    }
  }

  // No audio available
  return null;
}
