export interface BibleBook {
  id: string;
  name: string;
  abbreviation: string;
  nameLong: string;
  chapters?: BibleChapter[];
  chaptersCount?: number;
}

export interface BibleChapter {
  id: string;
  bookId: string;
  number: string;
  reference: string;
  position?: number;
}

export interface BibleVerse {
  id: string;
  orgId: string;
  bookId: string;
  chapterId: string;
  reference: string;
  text: string;
  verseNumber?: number;
}

export interface BibleContent {
  id: string;
  orgId?: string;
  bookId: string;
  chapterId?: string;
  reference: string;
  content: string;
  verseCount: number;
  copyright?: string;
}

export interface BibleAudioSection {
  id: string;
  start: number;
  end: number;
  verseStart: number;
  verseEnd: number;
  text: string;
}

export interface BibleAudio {
  id: string;
  chapterId: string;
  reference: string;
  url: string;
  duration: number;
  narrator?: string;
  sections: BibleAudioSection[];
}

export interface Note {
  id: string;
  verseReference: string;
  content: string;
  createdAt: string;
}

export interface Bible {
  id: string;
  name: string;
  abbreviation: string;
  language: {
    id: string;
    name: string;
  };
  description?: string;
}
