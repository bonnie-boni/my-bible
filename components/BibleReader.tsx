'use client';

import { BibleContent, BibleBook } from '@/lib/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const HIGHLIGHT_COLORS = [
  '#fef08a',
  '#fdba74',
  '#fca5a5',
  '#f9a8d4',
  '#c4b5fd',
  '#93c5fd',
  '#86efac',
  '#67e8f9',
  '#d9f99d',
  '#e5e7eb',
];

const HIGHLIGHT_STORAGE_KEY = 'verse-highlights-v1';

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
  const [selectedColor, setSelectedColor] = useState<string>(HIGHLIGHT_COLORS[0]);
  const [allHighlights, setAllHighlights] = useState<Record<string, Record<string, string>>>(() => {
    if (typeof window === 'undefined') return {};
    const raw = window.localStorage.getItem(HIGHLIGHT_STORAGE_KEY);
    if (!raw) return {};
    try {
      return JSON.parse(raw) as Record<string, Record<string, string>>;
    } catch {
      return {};
    }
  });
  const chapterKey = content?.id || '';
  const chapterHighlights = useMemo(() => {
    if (!chapterKey) return {} as Record<string, string>;
    return allHighlights[chapterKey] || {};
  }, [allHighlights, chapterKey]);

  const updateChapterHighlight = useCallback((verseNumber: string, color: string | null) => {
    if (!chapterKey) return;
    setAllHighlights((prev) => {
      const next = { ...prev };
      const chapter = { ...(next[chapterKey] || {}) };

      if (!color) {
        delete chapter[verseNumber];
      } else {
        chapter[verseNumber] = color;
      }

      if (Object.keys(chapter).length === 0) {
        delete next[chapterKey];
      } else {
        next[chapterKey] = chapter;
      }

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(HIGHLIGHT_STORAGE_KEY, JSON.stringify(next));
      }

      return next;
    });
  }, [chapterKey]);

  useEffect(() => {
    const contentNode = contentRef.current;
    if (!contentNode) return;

    const verseParagraphs = contentNode.querySelectorAll('p');
    verseParagraphs.forEach((p) => {
      const paragraph = p as HTMLElement;
      if (paragraph.dataset.verse) return;

      const verseNumberElement = paragraph.querySelector('.v');
      const numberText = verseNumberElement?.textContent?.trim();
      if (!numberText) return;

      paragraph.dataset.verse = numberText;
      paragraph.classList.add('verse-line');
    });

    const handleVerseClick = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const verseElement = target.closest('[data-verse]') as HTMLElement | null;
      if (!verseElement) return;

      const verse = verseElement.dataset.verse;
      if (!verse) return;

      if (selectedColor === 'clear') {
        updateChapterHighlight(verse, null);
      } else {
        updateChapterHighlight(verse, selectedColor);
      }
    };

    contentNode.addEventListener('click', handleVerseClick);

    return () => {
      contentNode.removeEventListener('click', handleVerseClick);
    };
  }, [content?.id, selectedColor, updateChapterHighlight]);

  useEffect(() => {
    if (!contentRef.current) return;

    const verseElements = contentRef.current.querySelectorAll('[data-verse]');
    verseElements.forEach((el) => {
      const verseElement = el as HTMLElement;
      const verse = verseElement.dataset.verse;

      verseElement.classList.add('verse-line');

      if (verse && chapterHighlights[verse]) {
        verseElement.style.color = chapterHighlights[verse];
        verseElement.style.backgroundColor = '';
        verseElement.style.borderRadius = '';
        verseElement.style.padding = '';
      } else {
        verseElement.style.color = '';
        verseElement.style.backgroundColor = '';
        verseElement.style.borderRadius = '';
        verseElement.style.padding = '';
      }
    });
  }, [content?.id, chapterHighlights]);

  useEffect(() => {
    if (!contentRef.current || !currentVerse) return;

    const highlighted = contentRef.current.querySelectorAll('.verse-focus-highlight');
    highlighted.forEach(el => el.classList.remove('verse-focus-highlight'));

    const verseElement = contentRef.current.querySelector(`[data-verse="${currentVerse}"]`);
    if (verseElement) {
      verseElement.classList.add('verse-focus-highlight');
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

        <div className="mb-5 rounded-lg border border-gray-800 bg-gray-900/60 p-3">
          <p className="text-xs text-gray-300 mb-2">Tap a color, then click verses to highlight</p>
          <div className="flex flex-wrap items-center gap-2">
            {HIGHLIGHT_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`h-6 w-6 rounded-full border ${selectedColor === color ? 'border-white' : 'border-gray-600'}`}
                style={{ backgroundColor: color }}
                aria-label={`Select highlight color ${color}`}
                title={color}
              />
            ))}
            <button
              onClick={() => setSelectedColor('clear')}
              className={`px-2 py-1 text-xs rounded border ${selectedColor === 'clear' ? 'border-white text-white' : 'border-gray-600 text-gray-300'}`}
            >
              Erase
            </button>
          </div>
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

        .bible-content .verse-focus-highlight {
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5) inset;
        }

        .bible-content .verse-line {
          cursor: pointer;
          transition: box-shadow 0.2s ease;
        }

        .bible-content .verse-line:hover {
          box-shadow: 0 0 0 1px rgba(148, 163, 184, 0.35) inset;
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
