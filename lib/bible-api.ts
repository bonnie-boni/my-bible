import { BibleBook, BibleChapter, BibleContent } from './types';

const API_KEY = process.env.NEXT_PUBLIC_BIBLE_API || process.env.BIBLE_API || '';
const API_URL = process.env.NEXT_PUBLIC_BIBLE_API_URL || process.env.BIBLE_API_URL || 'https://api.scripture.api.bible/v1/';

const headers = {
  'api-key': API_KEY,
};

export async function getBibles() {
  const response = await fetch(`${API_URL}bibles`, { headers });
  const data = await response.json();
  return data.data;
}

export async function getBooks(bibleId: string = 'de4e12af7f28f599-02'): Promise<BibleBook[]> {
  const response = await fetch(`${API_URL}bibles/${bibleId}/books`, { headers });
  const data = await response.json();
  return data.data;
}

export async function getChapters(bibleId: string, bookId: string): Promise<BibleChapter[]> {
  const response = await fetch(`${API_URL}bibles/${bibleId}/books/${bookId}/chapters`, { headers });
  const data = await response.json();
  return data.data;
}

export async function getChapter(bibleId: string, chapterId: string): Promise<BibleContent> {
  const response = await fetch(`${API_URL}bibles/${bibleId}/chapters/${chapterId}?content-type=html&include-notes=false&include-titles=true&include-chapter-numbers=false&include-verse-numbers=true&include-verse-spans=false`, { headers });
  const data = await response.json();
  return data.data;
}

export async function searchBible(bibleId: string, query: string) {
  const response = await fetch(`${API_URL}bibles/${bibleId}/search?query=${encodeURIComponent(query)}`, { headers });
  const data = await response.json();
  return data.data;
}
