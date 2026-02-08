'use client';

import { useState, useEffect } from 'react';
import { Note } from '@/lib/types';
import { StickyNote, X, Plus } from 'lucide-react';

interface NotesPanelProps {
  verseReference: string | null;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function NotesPanel({ verseReference, isOpen = true, onClose }: NotesPanelProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  useEffect(() => {
    // Load notes from localStorage
    if (typeof window !== 'undefined') {
      const savedNotes = localStorage.getItem('bibleNotes');
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }
    }
  }, []);

  const addNote = () => {
    if (!newNote.trim() || !verseReference) return;

    const note: Note = {
      id: Date.now().toString(),
      verseReference,
      content: newNote,
      createdAt: new Date().toISOString(),
    };

    const updatedNotes = [...notes, note];
    setNotes(updatedNotes);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bibleNotes', JSON.stringify(updatedNotes));
    }
    setNewNote('');
    setIsAddingNote(false);
  };

  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bibleNotes', JSON.stringify(updatedNotes));
    }
  };

  const currentNotes = verseReference 
    ? notes.filter(note => note.verseReference === verseReference)
    : notes;

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

      {/* Notes Panel */}
      <div className={`
        fixed lg:relative
        inset-y-0 right-0
        w-full sm:w-96 lg:w-80
        bg-gray-900
        overflow-y-auto
        flex flex-col
        z-50
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-gray-900 z-10">
          <div className="flex items-center gap-2">
            <StickyNote size={16} className="text-blue-400 flex-shrink-0" />
            <h2 className="font-semibold text-xs sm:text-sm uppercase tracking-wider text-gray-400">
              Notes & Insights
            </h2>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 hover:bg-gray-800 rounded transition-colors"
            aria-label="Close notes panel"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Verse Reference */}
        {verseReference && (
          <div className="p-3 sm:p-4">
              <p className="text-xs text-gray-400 mb-2">Linked to {verseReference}</p>
            </div>
        )}

        {/* Notes Content */}
        <div className="flex-1 p-3 sm:p-4 space-y-3 sm:space-y-4">
          {/* Add Note Button */}
          {!isAddingNote && (
            <button
              onClick={() => setIsAddingNote(true)}
              className="w-full py-4 sm:py-6 bg-gray-800/30 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 text-gray-400"
            >
              <Plus size={20} />
              <span className="text-xs sm:text-sm">Add a note</span>
            </button>
          )}

          {/* Add Note Form */}
          {isAddingNote && (
            <div className="p-3 sm:p-4 space-y-3">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Start typing your reflection here..."
                className="w-full bg-gray-900 text-gray-200 rounded p-2 sm:p-3 text-xs sm:text-sm min-h-[100px] border border-gray-700 focus:border-blue-500 focus:outline-none"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={addNote}
                  className="flex-1 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-xs sm:text-sm transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsAddingNote(false);
                    setNewNote('');
                  }}
                  className="flex-1 px-3 sm:px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs sm:text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {currentNotes.length === 0 && !isAddingNote && (
            <div className="text-center text-gray-500 text-xs sm:text-sm mt-8">
              <p>No notes yet</p>
              <p className="mt-1">Click above to add your first note</p>
            </div>
          )}

          {/* Notes List */}
          {currentNotes.map(note => (
            <div key={note.id} className="p-3 sm:p-4 space-y-2 border-b border-gray-800">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs text-blue-400 truncate flex-1">{note.verseReference}</p>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="text-gray-500 hover:text-red-400 transition-colors flex-shrink-0"
                  aria-label="Delete note"
                >
                  <X size={14} />
                </button>
              </div>
              <p className="text-xs sm:text-sm text-gray-300 whitespace-pre-wrap break-words">{note.content}</p>
              <p className="text-xs text-gray-500">
                {new Date(note.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>

      </div>
    </>
  );
}
