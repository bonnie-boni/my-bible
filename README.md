# My Bible & I 📖

A modern, feature-rich Bible reading application built with Next.js, React, and the Bible API. Read, study, and take notes on God's Word in a beautiful, intuitive interface.

## Features ✨

- **Complete Bible Navigation**: Browse through Old and New Testament books with easy chapter selection
- **Beautiful Reading Experience**: Clean, distraction-free reading interface with proper verse formatting
- **Notes & Insights**: Take personal notes linked to specific verses, automatically saved to local storage
- **Audio Player**: Simulated audio playback interface for listening to scripture (ready for integration)
- **Search Functionality**: Search for books, verses, and keywords (UI ready)
- **Multiple Bible Versions**: Switch between ESV, KJV, NIV, and NKJV translations
- **Responsive Design**: Fully responsive UI that works on desktop and mobile devices
- **Dark Theme**: Eye-friendly dark mode optimized for extended reading sessions

## Technology Stack 🛠️

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **API**: Bible API (https://scripture.api.bible/)
- **Language**: TypeScript

## Getting Started 🚀

### Prerequisites

- Node.js 18+ 
- pnpm (or npm/yarn)
- Bible API key from [scripture.api.bible](https://scripture.api.bible/)

### Installation

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment variables:**
   
   The `.env.local` file should already be configured with:
   ```env
   NEXT_PUBLIC_BIBLE_API=your_api_key_here
   NEXT_PUBLIC_BIBLE_API_URL=https://api.scripture.api.bible/v1/
   ```
   
   Replace the API key with your own from scripture.api.bible if needed.

3. **Run the development server:**
   ```bash
   pnpm dev
   ```

4. **Open your browser:**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure 📁

```
mybible/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page with app logic
│   └── globals.css         # Global styles
├── components/
│   ├── Navigation.tsx      # Sidebar navigation for books/chapters
│   ├── BibleReader.tsx     # Main reading area
│   ├── NotesPanel.tsx      # Notes and insights panel
│   ├── Header.tsx          # Top header with search and settings
│   └── AudioPlayer.tsx     # Bottom audio player
├── lib/
│   ├── bible-api.ts        # API integration functions
│   └── types.ts            # TypeScript type definitions
└── .env.local              # Environment variables
```

## Components Overview 🧩

### Navigation
- Collapsible Old/New Testament sections
- Book selection with chapter grids
- Visual indication of current selection
- Responsive hide/show functionality

### BibleReader
- Displays chapter content with proper formatting
- Chapter navigation (previous/next)
- Verse numbering and styling
- Loading states

### NotesPanel
- Add, view, and delete notes
- Notes linked to specific verses
- Local storage persistence
- Quick study tips section
- Auto-save indication

### Header
- Logo and branding
- Search bar (UI ready for implementation)
- Bible version selector
- Settings and user profile buttons

### AudioPlayer
- Play/pause controls
- Progress bar with seek functionality
- Playback speed control (1x, 1.25x, 1.5x, 1.75x, 2x)
- Volume control
- Chapter information display

## API Integration 🌐

The app uses the Bible API from scripture.api.bible. Key endpoints:

- `GET /bibles` - List available Bible versions
- `GET /bibles/{bibleId}/books` - Get all books
- `GET /bibles/{bibleId}/books/{bookId}/chapters` - Get chapters for a book
- `GET /bibles/{bibleId}/chapters/{chapterId}` - Get chapter content

## Customization 🎨

### Theme Colors
Edit `app/globals.css` to customize colors:
- Primary: Blue (#60a5fa)
- Background: Dark gray (#0a0a0a)
- Cards: Gray (#1f2937)

### Default Bible
Change the default Bible version in `app/page.tsx`:
```typescript
const [bibleId] = useState('de4e12af7f28f599-02'); // ESV Bible
```

## Future Enhancements 💡

- [ ] Implement actual search functionality
- [ ] Add real audio narration integration
- [ ] User authentication and cloud sync for notes
- [ ] Bookmarking system
- [ ] Reading plans and daily devotionals
- [ ] Cross-references and study tools
- [ ] Highlighting and text selection
- [ ] Share verses on social media
- [ ] Offline mode with service workers
- [ ] Multiple language support

## License 📄

This project is open source and available under the MIT License.

## Acknowledgments 🙏

- Bible content provided by [Bible API](https://scripture.api.bible/)
- Icons by [Lucide](https://lucide.dev/)
- Built with [Next.js](https://nextjs.org/)

---

Built with ❤️ for Bible readers everywhere
