'use client';

import { BibleContent, BibleBook } from '@/lib/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface BibleReaderProps {
  content: BibleContent | null;
  book: BibleBook | null;
  chapterNumber: string | null;
  selectedChapterId?: string | null;
  onPreviousChapter: () => void;
  onNextChapter: () => void;
  loading?: boolean;
  currentVerse?: number;
}

export default function BibleReader({
  content,
  book,
  chapterNumber,
  selectedChapterId,
  onPreviousChapter,
  onNextChapter,
  loading = false,
  currentVerse,
}: BibleReaderProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current || !currentVerse) return;

    const highlighted = contentRef.current.querySelectorAll('.verse-highlight');
    highlighted.forEach(el => el.classList.remove('verse-highlight'));

    const verseElement = contentRef.current.querySelector(`[data-verse="${currentVerse}"]`);
    if (verseElement) {
      verseElement.classList.add('verse-highlight');
      verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentVerse]);

  if (loading) {
    return (
      <div className="flex-1 bg-gray-950 p-4 sm:p-8 overflow-y-auto flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      </div>
    );
  }

  if (!content || !book) {
    return (
      <div className="flex-1 bg-gray-950 p-4 sm:p-8 overflow-y-auto flex items-center justify-center">
        <div className="text-center text-gray-400 px-4">
          <p className="text-lg sm:text-xl mb-2">Welcome to My Bible & I</p>
          <p className="text-xs sm:text-sm">Select a book and chapter to begin reading</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-950 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8 lg:p-12">
        {/* Chapter Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-light text-white mb-2">
            {book.name}
          </h1>
          <p className="text-gray-400 uppercase tracking-wider text-xs sm:text-sm">
            Chapter {chapterNumber}
          </p>
        </div>

        {/* Bible Content */}
        <div 
          ref={contentRef}
          className="text-gray-200 leading-relaxed text-base sm:text-lg space-y-3 sm:space-y-4 bible-content px-2 sm:px-0"
          dangerouslySetInnerHTML={{ __html: content.content }}
        />

        {/* Chapter Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-800">
          {
            (() => {
              const total = book?.chapters?.length ?? 0;
              let current = 1;
              if (selectedChapterId && book?.chapters) {
                const idx = book.chapters.findIndex(c => c.id === selectedChapterId);
                if (idx >= 0) current = idx + 1;
                else current = parseInt(chapterNumber || '1', 10);
              } else {
                current = parseInt(chapterNumber || '1', 10);
              }
              const isFirst = current <= 1;
              const isLast = total > 0 ? current >= total : false;

              // If only one chapter or no chapters, hide both
              if (total <= 1) {
                return null;
              }

              // Only show Next on the first chapter
              if (isFirst && !isLast) {
                return (
                  <div className="w-full sm:w-auto">
                    <button
                      onClick={onNextChapter}
                      className="w-full flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-xs sm:text-sm"
                    >
                      <span className="hidden sm:inline">Next Chapter</span>
                      <span className="sm:hidden">Next</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                );
              }

              // Only show Previous on the last chapter
              if (isLast && !isFirst) {
                return (
                  <div className="w-full sm:w-auto">
                    <button
                      onClick={onPreviousChapter}
                      className="w-full flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-xs sm:text-sm"
                    >
                      <ChevronLeft size={16} />
                      <span className="hidden sm:inline">Previous Chapter</span>
                      <span className="sm:hidden">Previous</span>
                    </button>
                  </div>
                );
              }

              // Otherwise show both
              return (
                <>
                  <button
                    onClick={onPreviousChapter}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-xs sm:text-sm"
                  >
                    <ChevronLeft size={16} />
                    <span className="hidden sm:inline">Previous Chapter</span>
                    <span className="sm:hidden">Previous</span>
                  </button>
                  <button
                    onClick={onNextChapter}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-xs sm:text-sm"
                  >
                    <span className="hidden sm:inline">Next Chapter</span>
                    <span className="sm:hidden">Next</span>
                    <ChevronRight size={16} />
                  </button>
                </>
              );
            })()
          }
        </div>
      </div>

      <style jsx global>{`
        .bible-content .verse {
          display: inline;
        }
        
        .bible-content .verse-highlight {
          background-color: rgba(59, 130, 246, 0.2);
          padding: 2px 4px;
          border-radius: 4px;
          transition: background-color 0.3s ease;
        }

        .bible-content .v {
          font-size: 0.75rem;
          color: #9ca3af;
          vertical-align: super;
          margin-right: 4px;
        }

        .bible-content p {
          margin-bottom: 1rem;
          line-height: 1.8;
        }

        @media (max-width: 640px) {
          .bible-content .v {
            font-size: 0.65rem;
          }

          .bible-content p {
            line-height: 1.7;
          }
        }
      `}</style>
    </div>
  );
}
