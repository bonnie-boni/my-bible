'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize2, VolumeX } from 'lucide-react';

interface AudioPlayerProps {
  currentVerse?: string;
  narrator?: string;
  onVerseChange?: (verseNumber: number) => void;
  isVisible?: boolean;
  verseCount?: number;
  audioUrl?: string | null;
  audioDuration?: number | undefined;
}

export default function AudioPlayer({ 
  currentVerse = 'John 1:1-18', 
  narrator = 'David Heath',
  onVerseChange,
  isVisible = true,
  verseCount
  , audioUrl = null,
  audioDuration,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(audioDuration ?? 265);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);
  const totalVerses = verseCount && verseCount > 0 ? verseCount : 18;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const usingAudioElement = !!audioUrl;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (usingAudioElement && audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      const newTime = Math.floor(percentage * duration);
      if (usingAudioElement && audioRef.current) {
        audioRef.current.currentTime = newTime;
        // currentTime will be updated by timeupdate event
      } else {
        setCurrentTime(newTime);
        const verseNumber = Math.min(
          totalVerses,
          Math.floor((newTime / duration) * totalVerses) + 1
        );
        // Defer parent state updates to avoid updating a parent during render
        setTimeout(() => onVerseChange?.(verseNumber), 0);
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleSkipBack = () => {
    setCurrentTime(Math.max(0, currentTime - 10));
  };

  const handleSkipForward = () => {
    setCurrentTime(Math.min(duration, currentTime + 10));
  };

  // If an audio URL is provided, hook into the HTMLAudioElement events
  useEffect(() => {
    if (!usingAudioElement) return;

    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'metadata';
    }

    const a = audioRef.current;
    a.src = audioUrl || '';
    // set duration if provided
    if (audioDuration) {
      setDuration(audioDuration);
    }

    const onLoaded = () => {
      setDuration(a.duration || audioDuration || 0);
    };

    const onTime = () => {
      setCurrentTime(a.currentTime);
      // Map currentTime to verse and inform parent occasionally
      const verseNumber = Math.min(
        totalVerses,
        Math.floor((a.currentTime / Math.max(1, a.duration)) * totalVerses) + 1
      );
      // Defer to avoid setState during render
      setTimeout(() => onVerseChange?.(verseNumber), 0);
    };

    const onEnded = () => setIsPlaying(false);

    a.addEventListener('loadedmetadata', onLoaded);
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('ended', onEnded);

    return () => {
      a.removeEventListener('loadedmetadata', onLoaded);
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('ended', onEnded);
      a.pause();
      // keep audioRef for reuse
    };
  }, [audioUrl, audioDuration, totalVerses, onVerseChange]);

  // Fallback simulated timer when not using audio element
  useEffect(() => {
    if (usingAudioElement) return;
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false);
            return duration;
          }
          const newTime = prev + 1;
          if (newTime % 15 === 0) {
            const verseNumber = Math.min(
              totalVerses,
              Math.floor((newTime / duration) * totalVerses) + 1
            );
            setTimeout(() => onVerseChange?.(verseNumber), 0);
          }
          return newTime;
        });
      }, 1000 / playbackSpeed);
      return () => clearInterval(interval);
    }
  }, [isPlaying, duration, playbackSpeed, onVerseChange, totalVerses, usingAudioElement]);

  const progress = (currentTime / duration) * 100;

  if (!isVisible) return null;

  return (
    <div className="hidden bg-gray-900 border-t border-gray-800 px-2 sm:px-4 md:px-6 py-2 sm:py-3">
      <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
        {/* Thumbnail and Info */}
        <div className="hidden sm:flex items-center gap-2 sm:gap-3 w-40 md:w-64 flex-shrink-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded flex items-center justify-center">
            <span className="text-white font-semibold text-xs">JN</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs sm:text-sm font-medium truncate">{currentVerse}</p>
            <p className="text-gray-400 text-xs truncate">Narrator: {narrator}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex-1 flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0">
          {/* Skip Back */}
          <button 
            onClick={handleSkipBack}
            className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
            aria-label="Skip back 10 seconds"
          >
            <SkipBack size={18} className="sm:w-5 sm:h-5" />
          </button>
          
          {/* Play/Pause */}
          <button
            onClick={handlePlayPause}
            className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? 
              <Pause size={18} className="sm:w-5 sm:h-5" fill="white" /> : 
              <Play size={18} className="sm:w-5 sm:h-5" fill="white" />
            }
          </button>

          {/* Skip Forward */}
          <button 
            onClick={handleSkipForward}
            className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
            aria-label="Skip forward 10 seconds"
          >
            <SkipForward size={18} className="sm:w-5 sm:h-5" />
          </button>

          {/* Progress Bar */}
          <div className="flex-1 flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="text-xs text-gray-400 w-8 sm:w-10 text-right flex-shrink-0 hidden sm:block">
              {formatTime(currentTime)}
            </span>
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
            <span className="text-xs text-gray-400 w-8 sm:w-10 flex-shrink-0 hidden sm:block">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
          {/* Playback Speed */}
          <button 
            onClick={() => setPlaybackSpeed(speed => speed === 2 ? 1 : speed + 0.25)}
            className="hidden sm:block px-2 sm:px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-300 transition-colors min-w-[45px] text-center"
            aria-label={`Playback speed ${playbackSpeed}x`}
          >
            {playbackSpeed}x
          </button>

          {/* Volume Control */}
          <div className="relative hidden md:flex items-center gap-2">
            <button 
              onClick={toggleMute}
              onMouseEnter={() => setShowVolumeSlider(true)}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? 
                <VolumeX size={20} /> : 
                <Volume2 size={20} />
              }
            </button>
            {showVolumeSlider && (
              <div 
                ref={volumeRef}
                onMouseLeave={() => setShowVolumeSlider(false)}
                className="absolute bottom-full right-0 mb-2 p-2 bg-gray-800 rounded-lg shadow-xl"
              >
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-24 h-1"
                />
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Mobile Info Bar */}
      <div className="sm:hidden mt-2 flex items-center justify-between text-xs text-gray-400">
        <span className="truncate flex-1">{currentVerse}</span>
        <span className="ml-2">{formatTime(currentTime)} / {formatTime(duration)}</span>
      </div>
    </div>
  );
}
