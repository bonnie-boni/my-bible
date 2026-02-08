'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import BibleReader from '@/components/BibleReader';
import NotesPanel from '@/components/NotesPanel';
import Header from '@/components/Header';
import AudioPlayer from '@/components/AudioPlayer';
import { getBooks, getChapters, getChapter, getChapterAudio } from '@/lib/bible-api';
import { BibleBook, BibleContent } from '@/lib/types';

export default function Home() {
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [selectedChapterNumber, setSelectedChapterNumber] = useState<string | null>(null);
  const [content, setContent] = useState<BibleContent | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioNarrator, setAudioNarrator] = useState<string | undefined>(undefined);
  const [audioDuration, setAudioDuration] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [bibleId, setBibleId] = useState('de4e12af7f28f599-02'); // ESV Bible
  const [currentVerse, setCurrentVerse] = useState<number>(1);
  
  // Mobile menu states
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);

  const getChapterReference = () => {
    if (content?.reference && content.verseCount) {
      return `${content.reference}:1-${content.verseCount}`;
    }
    if (content?.reference) {
      return content.reference;
    }
    if (selectedBook?.name && selectedChapterNumber) {
      return `${selectedBook.name} ${selectedChapterNumber}`;
    }
    return 'John 1:1-18';
  };

  const getVerseReference = () => {
    if (!content?.reference) return null;
    if (content.reference.includes(':')) {
      return content.reference;
    }
    return `${content.reference}:${currentVerse}`;
  };

  // Load books on mount
  useEffect(() => {
    async function loadBooks() {
      try {
        setLoading(true);
        const booksData = await getBooks(bibleId);
        
        // Get chapters for each book
        const booksWithChapters = await Promise.all(
          booksData.map(async (book) => {
            try {
              const chapters = await getChapters(bibleId, book.id);
              return {
                ...book,
                chapters: chapters,
                chaptersCount: chapters.length,
              };
            } catch (error) {
              console.error(`Error loading chapters for ${book.name}:`, error);
              return {
                ...book,
                chapters: [],
                chaptersCount: 0,
              };
            }
          })
        );
        
        setBooks(booksWithChapters);

        // Auto-select John Chapter 1 (match abbreviation normalized)
        const john = booksWithChapters.find(b => (b.abbreviation || '').toUpperCase() === 'JHN');
        if (john && john.chapters && john.chapters.length > 0) {
          setSelectedBook(john);
          const firstChapter = john.chapters[0];
          setSelectedChapterId(firstChapter.id);
          setSelectedChapterNumber(firstChapter.number);
          loadChapter(firstChapter.id);
        }
      } catch (error) {
        console.error('Error loading books:', error);
      } finally {
        setLoading(false);
      }
    }
    loadBooks();
  }, [bibleId]);

  const loadChapter = async (chapterId: string) => {
    setLoading(true);
    try {
      const chapterData = await getChapter(bibleId, chapterId);
      setContent(chapterData);
      setCurrentVerse(1);
      // try to load audio metadata for this chapter
      try {
        const audio = await getChapterAudio(bibleId, chapterId);
        if (audio) {
          setAudioUrl(audio.url || null);
          setAudioNarrator(audio.narrator);
          setAudioDuration(audio.duration || undefined);
        } else {
          setAudioUrl(null);
          setAudioNarrator(undefined);
          setAudioDuration(undefined);
        }
      } catch (err) {
        console.warn('No audio available for chapter', chapterId, err);
        setAudioUrl(null);
        setAudioNarrator(undefined);
        setAudioDuration(undefined);
      }
    } catch (error) {
      console.error('Error loading chapter:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSelect = async (book: BibleBook) => {
    setSelectedBook(book);
    // Auto-select first chapter when a book is picked
    if (book.chapters && book.chapters.length > 0) {
      const first = book.chapters[0];
      setSelectedChapterId(first.id);
      setSelectedChapterNumber(first.number);
      loadChapter(first.id);
    } else {
      // Try to fetch chapters if not present
      try {
        setLoading(true);
        const chapters = await getChapters(bibleId, book.id);
        const updated = { ...book, chapters, chaptersCount: chapters.length };
        setSelectedBook(updated);
        if (chapters.length > 0) {
          const first = chapters[0];
          setSelectedChapterId(first.id);
          setSelectedChapterNumber(first.number);
          loadChapter(first.id);
        }
      } catch (err) {
        console.error('Error loading chapters for selected book:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleVersionChange = async (version: string) => {
    // Try to find a matching bible by querying the API list
    try {
      setLoading(true);
      const bibles = await (await import('@/lib/bible-api')).getBibles();
      const match = bibles.find(b => {
        const name = (b.name || '').toLowerCase();
        const abbr = (b.abbreviation || '').toLowerCase();
        return name.includes(version.toLowerCase()) || abbr === version.toLowerCase();
      });
      if (match) {
        setBibleId(match.id);
        // clear current selections while new bible loads
        setSelectedBook(null);
        setSelectedChapterId(null);
        setSelectedChapterNumber(null);
        setContent(null);
      } else {
        console.warn('No matching bible found for version', version);
      }
    } catch (err) {
      console.error('Error fetching bibles list:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChapterSelect = (chapterId: string, chapterNumber: string) => {
    setSelectedChapterId(chapterId);
    setSelectedChapterNumber(chapterNumber);
    loadChapter(chapterId);
    
    // Close mobile nav after chapter selection
    if (window.innerWidth < 1024) {
      setIsNavOpen(false);
    }
  };

  const handlePreviousChapter = () => {
    if (!selectedBook || !selectedChapterId || !selectedBook.chapters) return;

    const currentIndex = selectedBook.chapters.findIndex(c => c.id === selectedChapterId);
    if (currentIndex > 0) {
      const newChapter = selectedBook.chapters[currentIndex - 1];
      if (newChapter) {
        handleChapterSelect(newChapter.id, newChapter.number);
      }
      return;
    }

    // at first chapter of this book -> go to previous book's last chapter
    const currentBookIndex = books.findIndex(b => b.id === selectedBook.id);
    if (currentBookIndex > 0) {
      const previousBook = books[currentBookIndex - 1];
      if (previousBook.chapters && previousBook.chapters.length > 0) {
        const lastChapter = previousBook.chapters[previousBook.chapters.length - 1];
        setSelectedBook(previousBook);
        handleChapterSelect(lastChapter.id, lastChapter.number);
      }
    }
  };

  const handleNextChapter = () => {
    if (!selectedBook || !selectedChapterId || !selectedBook.chapters) return;

    const currentIndex = selectedBook.chapters.findIndex(c => c.id === selectedChapterId);
    if (currentIndex >= 0 && currentIndex < selectedBook.chapters.length - 1) {
      const newChapter = selectedBook.chapters[currentIndex + 1];
      if (newChapter) {
        handleChapterSelect(newChapter.id, newChapter.number);
      }
      return;
    }

    // at last chapter of this book -> go to next book's first chapter
    const currentBookIndex = books.findIndex(b => b.id === selectedBook.id);
    if (currentBookIndex >= 0 && currentBookIndex < books.length - 1) {
      const nextBook = books[currentBookIndex + 1];
      if (nextBook.chapters && nextBook.chapters.length > 0) {
        const firstChapter = nextBook.chapters[0];
        setSelectedBook(nextBook);
        handleChapterSelect(firstChapter.id, firstChapter.number);
      }
    }
  };

  const handleVerseChange = (verseNumber: number) => {
    const maxVerse = content?.verseCount || verseNumber;
    const clampedVerse = Math.min(Math.max(1, verseNumber), maxVerse);
    setCurrentVerse(clampedVerse);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white overflow-hidden">
      <Header 
        onMenuClick={() => setIsNavOpen(!isNavOpen)}
        onNotesClick={() => setIsNotesOpen(!isNotesOpen)}
        onVersionChange={handleVersionChange}
      />
      
      <div className="flex-1 flex overflow-hidden relative">
        <Navigation
          books={books}
          selectedBook={selectedBook}
          selectedChapter={selectedChapterId}
          onBookSelect={handleBookSelect}
          onChapterSelect={handleChapterSelect}
          isOpen={isNavOpen}
          onClose={() => setIsNavOpen(false)}
        />
        
        <BibleReader
          content={content}
          book={selectedBook}
          chapterNumber={selectedChapterNumber}
          selectedChapterId={selectedChapterId}
          onPreviousChapter={handlePreviousChapter}
          onNextChapter={handleNextChapter}
          loading={loading}
          currentVerse={currentVerse}
        />
        
        <NotesPanel 
          verseReference={getVerseReference()}
          isOpen={isNotesOpen}
          onClose={() => setIsNotesOpen(false)}
        />
      </div>

      <AudioPlayer 
        
        currentVerse={getChapterReference()}
        narrator={audioNarrator || 'David Heath'}
        audioUrl={audioUrl}
        audioDuration={audioDuration}
        onVerseChange={handleVerseChange}
        verseCount={content?.verseCount}
      />
    </div>
  );
}
