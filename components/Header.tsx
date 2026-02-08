'use client';

import { Search, User, Menu, StickyNote } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  selectedVersion?: string;
  onVersionChange?: (version: string) => void;
  onMenuClick?: () => void;
  onNotesClick?: () => void;
}

export default function Header({ 
  selectedVersion = 'ESV Bible', 
  onVersionChange,
  onMenuClick,
  onNotesClick 
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search:', searchQuery);
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800 px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
      {/* Left Section - Logo & Menu */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} className="text-gray-300" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 sm:w-8 hidden sm:h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white  font-bold text-xs sm:text-sm">MBI</span>
          </div>
          <h1 className="text-white font-semibold text-sm sm:text-lg hidden sm:block truncate">My Bible & I</h1>
          <h1 className="text-white font-semibold text-sm sm:hidden truncate">MBI</h1>
        </div>
      </div>

      {/* Center Section - Search */}
      <div className="flex-1 max-w-xl hidden md:block">
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

      {/* Mobile Search Button */}
      <button
        onClick={() => setIsSearchOpen(!isSearchOpen)}
        className="md:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
        aria-label="Toggle search"
      >
        <Search size={20} className="text-gray-300" />
      </button>

      {/* Right Section - Controls */}
      <div className="no_show flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Version Selector */}
        <select 
          value={selectedVersion}
          onChange={(e) => onVersionChange?.(e.target.value)}
          id='hidden'
          className=" bg-gray-800 text-gray-200 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm border border-gray-700 focus:border-blue-500 focus:outline-none cursor-pointer hidden sm:block"
        >
          <option value="ESV Bible">ESV</option>
          <option value="KJV">KJV</option>
          <option value="NIV">NIV</option>
          <option value="NKJV">NKJV</option>
        </select>

        {/* User Avatar */}
        {/* Notes button (mobile) + User avatar (desktop) */}
        <button
          onClick={onNotesClick}
          className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
          aria-label="Open notes panel"
        >
          <StickyNote size={18} className="text-gray-300" />
        </button>
      </div>

      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="absolute top-full left-0 right-0 bg-gray-900 border-b border-gray-800 p-3 md:hidden z-50">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for books, verses..."
              className="w-full bg-gray-800 text-gray-200 pl-10 pr-4 py-2 rounded-lg text-sm border border-gray-700 focus:border-blue-500 focus:outline-none"
              autoFocus
            />
          </form>
        </div>
      )}
    </header>
  );
}
