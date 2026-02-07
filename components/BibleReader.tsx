'use client';

import { BibleContent, BibleBook } from '@/lib/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BibleReaderProps {
  content: BibleContent | null;
  book: BibleBook | null;
  chapterNumber: string | null;
  onPreviousChapter: () => void;
  onNextChapter: () => void;
  loading?: boolean;
}

export default function BibleReader({
  content,
  book,
  chapterNumber,
  onPreviousChapter,
  onNextChapter,
  loading = false,
}: BibleReaderProps) {
  if (loading) {
    return (
      <div className="flex-1 bg-gray-950 p-8 overflow-y-auto flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!content || !book) {
    return (
      <div className="flex-1 bg-gray-950 p-8 overflow-y-auto flex items-center justify-center">
        <div className="text-center text-gray-400">
          <p className="text-xl mb-2">Welcome to Bible Sanctuary</p>
          <p className="text-sm">Select a book and chapter to begin reading</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-950 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-8">
        {/* Chapter Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-light text-white mb-2">
            {book.name}
          </h1>
          <p className="text-gray-400 uppercase tracking-wider text-sm">
            Chapter {chapterNumber}
          </p>
        </div>

        {/* Bible Content */}
        <div 
          className="text-gray-200 leading-relaxed text-lg space-y-4 bible-content"
          dangerouslySetInnerHTML={{ __html: content.content }}
        />

        {/* Chapter Navigation */}
        <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-800">
          <button
            onClick={onPreviousChapter}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm"
          >
            <ChevronLeft size={16} />
            Previous Chapter
          </button>
          <button
            onClick={onNextChapter}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm"
          >
            Next Chapter
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
