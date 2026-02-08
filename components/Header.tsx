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
          <h1 className="text-white font-semibold text-sm sm:text-lg hidden sm:block truncate">My Bible & I</h1>
          <h1 className="text-white font-semibold text-sm sm:hidden truncate italic ">My Bible & I</h1>
        </div>
      </div>



      {/* Right Section - Controls */}
      <div className="no_show flex items-center gap-2 sm:gap-3 flex-shrink-0">
     
        {/* Notes button (mobile) + User avatar (desktop) */}
        <button
          onClick={onNotesClick}
          className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
          aria-label="Open notes panel"
        >
          <StickyNote size={18} className="text-gray-300" />
        </button>
      </div>

    </header>
  );
}
