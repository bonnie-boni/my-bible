'use client';

import { useState, useEffect } from 'react';
import { BibleBook } from '@/lib/types';
import { ChevronDown, ChevronRight, X } from 'lucide-react';

interface NavigationProps {
  books: BibleBook[];
  selectedBook: BibleBook | null;
  selectedChapter: string | null;
  onBookSelect: (book: BibleBook) => void;
  onChapterSelect: (chapterId: string, chapterNumber: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Navigation({
  books,
  selectedBook,
  selectedChapter,
  onBookSelect,
  onChapterSelect,
  isOpen = true,
  onClose,
}: NavigationProps) {
  const [expandedBook, setExpandedBook] = useState<string | null>(selectedBook?.id || null);
  const [testamentExpanded, setTestamentExpanded] = useState({ old: true, new: true });

  useEffect(() => {
    if (selectedBook?.id) {
      setExpandedBook(selectedBook.id);
    }
  }, [selectedBook]);

  const oldTestamentBooks = books.filter(book => {
    const abbr = book.abbreviation?.toUpperCase();
    return [
      'GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA', '1KI', '2KI',
      '1CH', '2CH', 'EZR', 'NEH', 'EST', 'JOB', 'PSA', 'PRO', 'ECC', 'SNG', 'ISA', 'JER',
      'LAM', 'EZK', 'DAN', 'HOS', 'JOL', 'AMO', 'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP',
      'HAG', 'ZEC', 'MAL'
    ].includes(abbr);
  });

  const newTestamentBooks = books.filter(book => {
    const abbr = book.abbreviation?.toUpperCase();
    return [
      'MAT', 'MRK', 'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO', 'GAL', 'EPH', 'PHP', 'COL',
      '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB', 'JAS', '1PE', '2PE', '1JN', '2JN',
      '3JN', 'JUD', 'REV'
    ].includes(abbr);
  });

  const handleBookClick = (book: BibleBook) => {
    if (expandedBook === book.id) {
      setExpandedBook(null);
    } else {
      setExpandedBook(book.id);
      onBookSelect(book);
    }
  };

  const handleChapterClick = (chapterId: string, chapterNumber: string) => {
    onChapterSelect(chapterId, chapterNumber);
    // Close mobile menu after selection
    if (window.innerWidth < 1024 && onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Navigation Panel */}
      <div className={`
        fixed lg:relative
        inset-y-0 left-0
        w-72 sm:w-80 lg:w-64
        bg-gray-900 border-r border-gray-800
        overflow-y-auto
        flex flex-col
        z-50
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-gray-900 z-10">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-gray-400">Navigation</h2>
          <button
            onClick={onClose}
            className="lg:hidden p-1 hover:bg-gray-800 rounded transition-colors"
            aria-label="Close navigation"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Old Testament */}
        <div>
          <button
            onClick={() => setTestamentExpanded({ ...testamentExpanded, old: !testamentExpanded.old })}
            className="w-full px-4 py-3 flex items-center justify-between text-blue-400 hover:bg-gray-800 transition-colors sticky top-[57px] bg-gray-900 z-10"
          >
            <span className="font-semibold text-xs sm:text-sm uppercase tracking-wider">Old Testament</span>
            {testamentExpanded.old ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          {testamentExpanded.old && (
            <div className="py-2">
              {oldTestamentBooks.map(book => (
                <div key={book.id}>
                  <button
                    onClick={() => handleBookClick(book)}
                    className={`w-full px-6 py-2.5 text-left text-sm hover:bg-gray-800 transition-colors flex items-center justify-between ${
                      selectedBook?.id === book.id ? 'bg-gray-800 text-white' : 'text-gray-300'
                    }`}
                  >
                    <span className="truncate">{book.name}</span>
                    {expandedBook === book.id && <ChevronDown size={14} className="flex-shrink-0 ml-2" />}
                  </button>
                  {expandedBook === book.id && book.chapters && (
                    <div className="grid grid-cols-5 sm:grid-cols-6 gap-1 px-4 sm:px-6 py-2 bg-gray-950">
                      {book.chapters.map((chapter) => (
                        <button
                          key={chapter.id}
                          onClick={() => handleChapterClick(chapter.id, chapter.number)}
                          className={`p-2 text-xs rounded hover:bg-blue-600 transition-colors ${
                            selectedChapter === chapter.id
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-800 text-gray-300'
                          }`}
                        >
                          {chapter.number}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* New Testament */}
        <div>
          <button
            onClick={() => setTestamentExpanded({ ...testamentExpanded, new: !testamentExpanded.new })}
            className="w-full px-4 py-3 flex items-center justify-between text-blue-400 hover:bg-gray-800 transition-colors sticky top-[57px] bg-gray-900 z-10"
          >
            <span className="font-semibold text-xs sm:text-sm uppercase tracking-wider">New Testament</span>
            {testamentExpanded.new ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          {testamentExpanded.new && (
            <div className="py-2">
              {newTestamentBooks.map(book => (
                <div key={book.id}>
                  <button
                    onClick={() => handleBookClick(book)}
                    className={`w-full px-6 py-2.5 text-left text-sm hover:bg-gray-800 transition-colors flex items-center justify-between ${
                      selectedBook?.id === book.id ? 'bg-gray-800 text-white' : 'text-gray-300'
                    }`}
                  >
                    <span className="truncate">{book.name}</span>
                    {expandedBook === book.id && <ChevronDown size={14} className="flex-shrink-0 ml-2" />}
                  </button>
                  {expandedBook === book.id && book.chapters && (
                    <div className="grid grid-cols-5 sm:grid-cols-6 gap-1 px-4 sm:px-6 py-2 bg-gray-950">
                      {book.chapters.map((chapter) => (
                        <button
                          key={chapter.id}
                          onClick={() => handleChapterClick(chapter.id, chapter.number)}
                          className={`p-2 text-xs rounded hover:bg-blue-600 transition-colors ${
                            selectedChapter === chapter.id
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-800 text-gray-300'
                          }`}
                        >
                          {chapter.number}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
