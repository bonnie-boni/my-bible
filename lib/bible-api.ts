import { BibleBook, BibleChapter, BibleContent, Bible, BibleVerse, BibleAudio } from './types';

// Prefer NEXT_PUBLIC vars; remove legacy BIBLE_API_* fallbacks
const API_KEY = process.env.NEXT_PUBLIC_BIBLE_API || '';
const API_URL = process.env.NEXT_PUBLIC_BIBLE_API_URL || 'https://api.scripture.api.bible/v1/';

const LOCAL_BIBLES: Bible[] = [
  { id: 'local-goodnews', name: 'Good News Bible', abbreviation: 'GNB', language: { id: 'en', name: 'English' } },
  { id: 'local-kingjames', name: 'King James Version', abbreviation: 'KJV', language: { id: 'en', name: 'English' } },
  { id: 'local-swahili', name: 'Swahili (SPB)', abbreviation: 'SWA', language: { id: 'sw', name: 'Swahili' } },
];

const LOCAL_FILE_MAP: Record<string, string> = {
  'local-goodnews': '/goodnews.xml',
  'local-kingjames': '/kingjames.xml',
  'local-swahili': '/swahili.spb',
};

type LocalParsedChapter = {
  number: string;
  verses: Array<{ number: string; text: string }>;
};

type LocalParsedBook = {
  number: string;
  name: string;
  chapters: LocalParsedChapter[];
};

type LocalParsedBible = {
  books: LocalParsedBook[];
};

const localBibleCache = new Map<string, LocalParsedBible>();

const headers = {
  'api-key': API_KEY,
};

// Cache for API responses
const cache = new Map<string, { data: unknown; timestamp: number }>();
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

async function getLocalParsedBible(bibleId: string): Promise<LocalParsedBible> {
  const cached = localBibleCache.get(bibleId);
  if (cached) return cached;

  const path = LOCAL_FILE_MAP[bibleId];
  if (!path) throw new Error(`Local bible file not configured for ${bibleId}`);

  const res = await fetch(path);
  const text = await res.text();

  // .spb files are tab-delimited text, not XML
  if (path.toLowerCase().endsWith('.spb')) {
    const lines = text.split(/\r?\n/);
    const separatorIndex = lines.findIndex((line) => line.trim() === '-----');

    if (separatorIndex === -1) {
      throw new Error('Invalid SPB format: missing separator');
    }

    const booksByNumber = new Map<string, LocalParsedBook>();

    // Parse book metadata block
    for (let i = 0; i < separatorIndex; i += 1) {
      const line = lines[i].trim();
      if (!line || line.startsWith('##')) continue;

      const parts = line.split('\t');
      if (parts.length < 3) continue;
      const [bookNumber, bookName, chapterCountRaw] = parts;
      if (!/^\d+$/.test(bookNumber)) continue;

      const chapterCount = Number(chapterCountRaw);
      const chapters: LocalParsedChapter[] = [];
      for (let c = 1; c <= chapterCount; c += 1) {
        chapters.push({ number: String(c), verses: [] });
      }

      booksByNumber.set(bookNumber, {
        number: bookNumber,
        name: bookName,
        chapters,
      });
    }

    // Parse verse rows
    for (let i = separatorIndex + 1; i < lines.length; i += 1) {
      const raw = lines[i];
      if (!raw || !raw.trim()) continue;

      const parts = raw.split('\t');
      if (parts.length < 5) continue;

      const bookNumber = parts[1]?.trim();
      const chapterNumber = parts[2]?.trim();
      const verseNumber = parts[3]?.trim();
      const verseText = parts.slice(4).join('\t').trim();

      if (!bookNumber || !chapterNumber || !verseNumber) continue;

      let book = booksByNumber.get(bookNumber);
      if (!book) {
        book = {
          number: bookNumber,
          name: `Book ${bookNumber}`,
          chapters: [],
        };
        booksByNumber.set(bookNumber, book);
      }

      let chapter = book.chapters.find((c) => c.number === chapterNumber);
      if (!chapter) {
        chapter = { number: chapterNumber, verses: [] };
        book.chapters.push(chapter);
      }

      chapter.verses.push({ number: verseNumber, text: verseText });
    }

    const parsedSpb: LocalParsedBible = {
      books: Array.from(booksByNumber.values())
        .sort((a, b) => Number(a.number) - Number(b.number))
        .map((book) => ({
          ...book,
          chapters: [...book.chapters]
            .sort((a, b) => Number(a.number) - Number(b.number))
            .map((chapter) => ({
              ...chapter,
              verses: [...chapter.verses].sort((a, b) => Number(a.number) - Number(b.number)),
            })),
        })),
    };

    localBibleCache.set(bibleId, parsedSpb);
    return parsedSpb;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'application/xml');

  const books: LocalParsedBook[] = Array.from(doc.getElementsByTagName('BIBLEBOOK')).map((bookEl) => {
    const number = bookEl.getAttribute('bnumber') || '';
    const name = bookEl.getAttribute('bname') || bookEl.getAttribute('btitle') || `Book ${number}`;
    const chapterNodes = Array.from(bookEl.getElementsByTagName('CHAPTER'));

    const chapters: LocalParsedChapter[] = chapterNodes.map((chapterEl) => {
      const chapterNumber = chapterEl.getAttribute('cnumber') || '';
      const verseNodes = Array.from(chapterEl.getElementsByTagName('VERS'));
      const verses = verseNodes.map((verseEl) => ({
        number: verseEl.getAttribute('vnumber') || '',
        text: verseEl.textContent || '',
      }));
      return { number: chapterNumber, verses };
    });

    return { number, name, chapters };
  });

  const parsed = { books };
  localBibleCache.set(bibleId, parsed);
  return parsed;
}

function getAbbreviation(bookName: string): string {
  const words = bookName.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].slice(0, 3).toUpperCase();
  }

  // Preserve numeric prefixes like "1 Samuel" -> "1SA"
  if (/^\d+$/.test(words[0])) {
    const next = words[1] || '';
    return `${words[0]}${next.slice(0, 2)}`.toUpperCase();
  }

  return words.map((w) => w[0] || '').join('').slice(0, 3).toUpperCase();
}

export async function getBibles(): Promise<Bible[]> {
  // For now the app uses local versions from /public
  return LOCAL_BIBLES;

  // return fetchWithCache<Bible[]>(`${API_URL}bibles`, 'bibles');
}

export async function getBooks(bibleId: string = 'de4e12af7f28f599-02'): Promise<BibleBook[]> {
  // Local XML parsing for public files when using a local bible id
  if (bibleId.startsWith('local-')) {
    const parsed = await getLocalParsedBible(bibleId);
    return parsed.books.map((b) => {
      return {
        id: `${bibleId}-b${b.number}`,
        name: b.name,
        abbreviation: getAbbreviation(b.name),
        nameLong: b.name,
      } as BibleBook;
    });
  }

  return fetchWithCache<BibleBook[]>(`${API_URL}bibles/${bibleId}/books`, `books-${bibleId}`);
}

export async function getChapters(bibleId: string, bookId: string): Promise<BibleChapter[]> {
  if (bibleId.startsWith('local-')) {
    // bookId is expected to be like `${bibleId}-b{number}`
    const parts = bookId.split('-b');
    const bnum = parts[1] || bookId;
    const parsed = await getLocalParsedBible(bibleId);
    const book = parsed.books.find((b) => b.number === bnum);
    if (!book) return [];
    const chapters = book.chapters.map((c) => {
      const cnum = c.number;
      return {
        id: `${bookId}-c${cnum}`,
        bookId: bookId,
        number: cnum,
        reference: `${book.name} ${cnum}`,
      } as BibleChapter;
    });
    return chapters;
  }

  return fetchWithCache<BibleChapter[]>(
    `${API_URL}bibles/${bibleId}/books/${bookId}/chapters`,
    `chapters-${bibleId}-${bookId}`
  );
}

export async function getChapter(bibleId: string, chapterId: string): Promise<BibleContent> {
  if (bibleId.startsWith('local-')) {
    // chapterId is expected like `${bookId}-c{number}` where bookId is `${bibleId}-b{number}`
    const parts = chapterId.split('-c');
    const cnum = parts[1] || '';
    const bookId = parts[0];
    const bparts = bookId.split('-b');
    const bnum = bparts[1] || '';

    const parsed = await getLocalParsedBible(bibleId);
    const book = parsed.books.find((b) => b.number === bnum);
    if (!book) throw new Error('Book not found');
    const chapter = book.chapters.find((ch) => ch.number === cnum);
    if (!chapter) throw new Error('Chapter not found');

    // Build HTML content
    const verses = chapter.verses;
    const verseCount = verses.length;
    const contentHtml = verses.map((v) => {
      const vnum = v.number;
      const txt = v.text;
      return `<p class="verse-line" data-verse="${vnum}"><span class="v">${vnum}</span> ${txt}</p>`;
    }).join('\n');

    const bookName = book.name;
    const content: BibleContent = {
      id: chapterId,
      bookId: bookId,
      chapterId: chapterId,
      reference: `${bookName} ${cnum}`,
      content: contentHtml,
      verseCount,
    };
    return content;
  }

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
  if (bibleId.startsWith('local-')) {
    return null;
  }

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
