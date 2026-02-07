'use client';

import { useState } from 'react';
import { BibleBook } from '@/lib/types';
import { ChevronDown, ChevronRight, Menu } from 'lucide-react';

interface NavigationProps {
  books: BibleBook[];
  selectedBook: BibleBook | null;
  selectedChapter: string | null;
  onBookSelect: (book: BibleBook) => void;
  onChapterSelect: (chapterId: string, chapterNumber: string) => void;
}

export default function Navigation({
  books,
  selectedBook,
  selectedChapter,
  onBookSelect,
  onChapterSelect,
}: NavigationProps) {
  const [expandedBook, setExpandedBook] = useState<string | null>(selectedBook?.id || null);
  const [testamentExpanded, setTestamentExpanded] = useState({ old: true, new: true });
  const [isOpen, setIsOpen] = useState(true);

  const oldTestamentBooks = books.filter(book => 
    ['GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA', '1KI', '2KI', 
     '1CH', '2CH', 'EZR', 'NEH', 'EST', 'JOB', 'PSA', 'PRO', 'ECC', 'SNG', 'ISA', 'JER', 
     'LAM', 'EZK', 'DAN', 'HOS', 'JOL', 'AMO', 'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 
     'HAG', 'ZEC', 'MAL'].includes(book.abbreviation)
  );

  const newTestamentBooks = books.filter(book => 
    ['MAT', 'MRK', 'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO', 'GAL', 'EPH', 'PHP', 'COL', 
     '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB', 'JAS', '1PE', '2PE', '1JN', '2JN', 
     '3JN', 'JUD', 'REV'].includes(book.abbreviation)
  );

  const handleBookClick = (book: BibleBook) => {
    if (expandedBook === book.id) {
      setExpandedBook(null);
    } else {
      setExpandedBook(book.id);
      onBookSelect(book);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-lg hover:bg-gray-700"
      >
        <Menu size={20} />
      </button>
    );
  }

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 h-screen overflow-y-auto flex flex-col">
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h2 className="font-semibold text-sm uppercase tracking-wider text-gray-400">Navigation</h2>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-gray-800 rounded"
        >
          <Menu size={16} />
        </button>
      </div>

      {/* Old Testament */}
      <div>
        <button
          onClick={() => setTestamentExpanded({ ...testamentExpanded, old: !testamentExpanded.old })}
          className="w-full px-4 py-2 flex items-center justify-between text-blue-400 hover:bg-gray-800 transition-colors"
        >
          <span className="font-semibold text-sm uppercase tracking-wider">Old Testament</span>
          {testamentExpanded.old ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        {testamentExpanded.old && (
          <div className="py-2">
            {oldTestamentBooks.map(book => (
              <div key={book.id}>
                <button
                  onClick={() => handleBookClick(book)}
                  className={`w-full px-6 py-2 text-left text-sm hover:bg-gray-800 transition-colors flex items-center justify-between ${
                    selectedBook?.id === book.id ? 'bg-gray-800 text-white' : 'text-gray-300'
                  }`}
                >
                  <span>{book.name}</span>
                  {expandedBook === book.id && <ChevronDown size={14} />}
                </button>
                {expandedBook === book.id && book.chapters && (
                  <div className="grid grid-cols-6 gap-1 px-6 py-2 bg-gray-950">
                    {book.chapters.map((chapter, index) => (
                      <button
                        key={`${book.id}.${index + 1}`}
                        onClick={() => onChapterSelect(`${book.id}.${index + 1}`, `${index + 1}`)}
                        className={`p-1.5 text-xs rounded hover:bg-blue-600 transition-colors ${
                          selectedChapter === `${book.id}.${index + 1}` 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-800 text-gray-300'
                        }`}
                      >
                        {index + 1}
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
          className="w-full px-4 py-2 flex items-center justify-between text-blue-400 hover:bg-gray-800 transition-colors"
        >
          <span className="font-semibold text-sm uppercase tracking-wider">New Testament</span>
          {testamentExpanded.new ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        {testamentExpanded.new && (
          <div className="py-2">
            {newTestamentBooks.map(book => (
              <div key={book.id}>
                <button
                  onClick={() => handleBookClick(book)}
                  className={`w-full px-6 py-2 text-left text-sm hover:bg-gray-800 transition-colors flex items-center justify-between ${
                    selectedBook?.id === book.id ? 'bg-gray-800 text-white' : 'text-gray-300'
                  }`}
                >
                  <span>{book.name}</span>
                  {expandedBook === book.id && <ChevronDown size={14} />}
                </button>
                {expandedBook === book.id && book.chapters && (
                  <div className="grid grid-cols-6 gap-1 px-6 py-2 bg-gray-950">
                    {book.chapters.map((chapter, index) => (
                      <button
                        key={`${book.id}.${index + 1}`}
                        onClick={() => onChapterSelect(`${book.id}.${index + 1}`, `${index + 1}`)}
                        className={`p-1.5 text-xs rounded hover:bg-blue-600 transition-colors ${
                          selectedChapter === `${book.id}.${index + 1}` 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-800 text-gray-300'
                        }`}
                      >
                        {index + 1}
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
  );
}
