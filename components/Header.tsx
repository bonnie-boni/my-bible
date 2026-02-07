'use client';

import { Search, Settings, User } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  selectedVersion?: string;
  onVersionChange?: (version: string) => void;
}

export default function Header({ selectedVersion = 'ESV Bible', onVersionChange }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Search:', searchQuery);
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">BS</span>
          </div>
          <h1 className="text-white font-semibold text-lg">Bible Sanctuary</h1>
        </div>
      </div>

      <div className="flex-1 max-w-md mx-8">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for books, verses, or keywords..."
            className="w-full bg-gray-800 text-gray-200 pl-10 pr-4 py-2 rounded-lg text-sm border border-gray-700 focus:border-blue-500 focus:outline-none"
          />
        </form>
      </div>

      <div className="flex items-center gap-4">
        <select 
          value={selectedVersion}
          onChange={(e) => onVersionChange?.(e.target.value)}
          className="bg-gray-800 text-gray-200 px-3 py-2 rounded-lg text-sm border border-gray-700 focus:border-blue-500 focus:outline-none cursor-pointer"
        >
          <option value="ESV Bible">ESV Bible</option>
          <option value="KJV">KJV</option>
          <option value="NIV">NIV</option>
          <option value="NKJV">NKJV</option>
        </select>

        <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
          <Settings size={20} className="text-gray-400" />
        </button>

        <button className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors">
          <User size={16} className="text-gray-300" />
        </button>
      </div>
    </header>
  );
}
