'use client';

import { useState, useEffect } from 'react';
import { Note } from '@/lib/types';
import { StickyNote, X, Plus } from 'lucide-react';

interface NotesPanelProps {
  verseReference: string | null;
}

export default function NotesPanel({ verseReference }: NotesPanelProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  useEffect(() => {
    // Load notes from localStorage
    const savedNotes = localStorage.getItem('bibleNotes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
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
    localStorage.setItem('bibleNotes', JSON.stringify(updatedNotes));
    setNewNote('');
    setIsAddingNote(false);
  };

  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    localStorage.setItem('bibleNotes', JSON.stringify(updatedNotes));
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-50 p-2 bg-gray-800 rounded-lg hover:bg-gray-700"
      >
        <StickyNote size={20} />
      </button>
    );
  }

  const currentNotes = verseReference 
    ? notes.filter(note => note.verseReference === verseReference)
    : notes;

  return (
    <div className="w-80 bg-gray-900 border-l border-gray-800 h-screen overflow-y-auto flex flex-col">
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StickyNote size={16} className="text-blue-400" />
          <h2 className="font-semibold text-sm uppercase tracking-wider text-gray-400">
            Notes & Insights
          </h2>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-gray-800 rounded"
        >
          <X size={16} />
        </button>
      </div>

      {verseReference && (
        <div className="p-4 bg-gray-950 border-b border-gray-800">
          <p className="text-xs text-gray-400">Linked to {verseReference}</p>
          <span className="inline-block mt-2 px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded">
            AUTOSAVED
          </span>
        </div>
      )}

      <div className="flex-1 p-4 space-y-4">
        {!isAddingNote && (
          <button
            onClick={() => setIsAddingNote(true)}
            className="w-full py-6 border-2 border-dashed border-gray-700 rounded-lg hover:border-blue-500 hover:bg-gray-800/50 transition-colors flex items-center justify-center gap-2 text-gray-400 hover:text-blue-400"
          >
            <Plus size={20} />
            <span className="text-sm">Add a note</span>
          </button>
        )}

        {isAddingNote && (
          <div className="bg-gray-800 rounded-lg p-4 space-y-3">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Start typing your reflection here..."
              className="w-full bg-gray-900 text-gray-200 rounded p-2 text-sm min-h-25 border border-gray-700 focus:border-blue-500 focus:outline-none"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={addNote}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsAddingNote(false);
                  setNewNote('');
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {currentNotes.length === 0 && !isAddingNote && (
          <div className="text-center text-gray-500 text-sm mt-8">
            <p>No notes yet</p>
            <p className="mt-1">Click above to add your first note</p>
          </div>
        )}

        {currentNotes.map(note => (
          <div key={note.id} className="bg-gray-800 rounded-lg p-4 space-y-2">
            <div className="flex items-start justify-between">
              <p className="text-xs text-blue-400">{note.verseReference}</p>
              <button
                onClick={() => deleteNote(note.id)}
                className="text-gray-500 hover:text-red-400 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <p className="text-sm text-gray-300 whitespace-pre-wrap">{note.content}</p>
            <p className="text-xs text-gray-500">
              {new Date(note.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-800">
        <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <div className="w-1 h-4 bg-blue-500 rounded-full mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-blue-300 mb-1">QUICK STUDY TIP</p>
              <p className="text-xs text-gray-400">
                The word &quot;Word&quot; (Logos) in verse 1 reflects both the Hebrew concept of God&apos;s dynamic word and the Greek concept of reason.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
