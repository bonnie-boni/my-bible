export interface BibleBook {
  id: string;
  name: string;
  abbreviation: string;
  nameLong: string;
  chapters?: number[];
}

export interface BibleChapter {
  id: string;
  bookId: string;
  number: string;
  reference: string;
}

export interface BibleVerse {
  id: string;
  orgId: string;
  bookId: string;
  chapterId: string;
  reference: string;
  text: string;
}

export interface BibleContent {
  id: string;
  orgId: string;
  bookId: string;
  chapterId: string;
  reference: string;
  content: string;
  verseCount: number;
}

export interface Note {
  id: string;
  verseReference: string;
  content: string;
  createdAt: string;
}
