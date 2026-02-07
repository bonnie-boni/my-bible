'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize2 } from 'lucide-react';

interface AudioPlayerProps {
  currentVerse?: string;
  narrator?: string;
}

export default function AudioPlayer({ 
  currentVerse = 'John 1:1-18', 
  narrator = 'David Heath' 
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(73);
  const [duration, setDuration] = useState(265);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      setCurrentTime(Math.floor(percentage * duration));
    }
  };

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
      return () => clearInterval(interval);
    }
  }, [isPlaying, duration, playbackSpeed]);

  const progress = (currentTime / duration) * 100;

  return (
    <div className="bg-gray-900 border-t border-gray-800 px-6 py-3">
      <div className="flex items-center gap-6">
        {/* Thumbnail and Info */}
        <div className="flex items-center gap-3 w-64">
          <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-blue-800 rounded flex items-center justify-center shrink-0">
            <span className="text-white font-semibold text-xs">JN</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{currentVerse}</p>
            <p className="text-gray-400 text-xs truncate">Narrator: {narrator}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex-1 flex items-center gap-4">
          <button className="text-gray-400 hover:text-white transition-colors">
            <SkipBack size={20} />
          </button>
          
          <button
            onClick={handlePlayPause}
            className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors"
          >
            {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" />}
          </button>

          <button className="text-gray-400 hover:text-white transition-colors">
            <SkipForward size={20} />
          </button>

          {/* Progress Bar */}
          <div className="flex-1 flex items-center gap-3">
            <span className="text-xs text-gray-400 w-10 text-right">{formatTime(currentTime)}</span>
            <div 
              ref={progressBarRef}
              onClick={handleProgressClick}
              className="flex-1 h-1 bg-gray-700 rounded-full cursor-pointer group relative"
            >
              <div 
                className="h-full bg-blue-600 rounded-full transition-all relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <span className="text-xs text-gray-400 w-10">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setPlaybackSpeed(speed => speed === 2 ? 1 : speed + 0.25)}
            className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-300 transition-colors min-w-11.25"
          >
            {playbackSpeed}x
          </button>

          <button className="text-gray-400 hover:text-white transition-colors">
            <Volume2 size={20} />
          </button>

          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm text-white transition-colors flex items-center gap-2">
            <Maximize2 size={16} />
            <span>Insight</span>
          </button>
        </div>
      </div>
    </div>
  );
}
