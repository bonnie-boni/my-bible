'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import BibleReader from '@/components/BibleReader';
import NotesPanel from '@/components/NotesPanel';
import Header from '@/components/Header';
import AudioPlayer from '@/components/AudioPlayer';
import { getBooks, getChapters, getChapter } from '@/lib/bible-api';
import { BibleBook, BibleContent } from '@/lib/types';

export default function Home() {
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [selectedChapterNumber, setSelectedChapterNumber] = useState<string | null>(null);
  const [content, setContent] = useState<BibleContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [bibleId] = useState('de4e12af7f28f599-02'); // ESV Bible

  // Load books on mount
  useEffect(() => {
    async function loadBooks() {
      try {
        const booksData = await getBooks(bibleId);
        
        // Get chapters for each book
        const booksWithChapters = await Promise.all(
          booksData.map(async (book) => {
            const chapters = await getChapters(bibleId, book.id);
            return {
              ...book,
              chapters: chapters.map(() => 1), // Create array of chapter numbers
            };
          })
        );
        
        setBooks(booksWithChapters);

        // Auto-select John Chapter 1
        const john = booksWithChapters.find(b => b.abbreviation === 'JHN');
        if (john) {
          setSelectedBook(john);
          setSelectedChapterId('JHN.1');
          setSelectedChapterNumber('1');
          loadChapter('JHN.1');
        }
      } catch (error) {
        console.error('Error loading books:', error);
      }
    }
    loadBooks();
  }, [bibleId]);

  const loadChapter = async (chapterId: string) => {
    setLoading(true);
    try {
      const chapterData = await getChapter(bibleId, chapterId);
      setContent(chapterData);
    } catch (error) {
      console.error('Error loading chapter:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSelect = async (book: BibleBook) => {
    setSelectedBook(book);
    // Load chapters if not already loaded
    if (!book.chapters || book.chapters.length === 0) {
      const chapters = await getChapters(bibleId, book.id);
      const updatedBook = {
        ...book,
        chapters: chapters.map(() => 1),
      };
      setBooks(books.map(b => b.id === book.id ? updatedBook : b));
    }
  };

  const handleChapterSelect = (chapterId: string, chapterNumber: string) => {
    setSelectedChapterId(chapterId);
    setSelectedChapterNumber(chapterNumber);
    loadChapter(chapterId);
  };

  const handlePreviousChapter = () => {
    if (!selectedBook || !selectedChapterId) return;
    
    const currentChapter = parseInt(selectedChapterNumber || '1');
    if (currentChapter > 1) {
      const newChapter = currentChapter - 1;
      const newChapterId = `${selectedBook.id}.${newChapter}`;
      handleChapterSelect(newChapterId, newChapter.toString());
    }
  };

  const handleNextChapter = () => {
    if (!selectedBook || !selectedChapterId || !selectedBook.chapters) return;
    
    const currentChapter = parseInt(selectedChapterNumber || '1');
    if (currentChapter < selectedBook.chapters.length) {
      const newChapter = currentChapter + 1;
      const newChapterId = `${selectedBook.id}.${newChapter}`;
      handleChapterSelect(newChapterId, newChapter.toString());
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        <Navigation
          books={books}
          selectedBook={selectedBook}
          selectedChapter={selectedChapterId}
          onBookSelect={handleBookSelect}
          onChapterSelect={handleChapterSelect}
        />
        
        <BibleReader
          content={content}
          book={selectedBook}
          chapterNumber={selectedChapterNumber}
          onPreviousChapter={handlePreviousChapter}
          onNextChapter={handleNextChapter}
          loading={loading}
        />
        
        <NotesPanel 
          verseReference={content?.reference || null}
        />
      </div>

      <AudioPlayer 
        currentVerse={content?.reference || 'John 1:1-18'}
        narrator="David Heath"
      />
    </div>
  );
}
