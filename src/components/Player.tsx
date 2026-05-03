import React, { useState } from 'react';
import ReactPlayer from 'react-player';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, Share2, ListMusic } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';

export default function Player() {
  const { currentTrack, isPlaying, play, pause, nextTrack, prevTrack, toggleFavorite, favorites } = usePlayerStore();
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const playerRef = React.useRef<ReactPlayer>(null);

  const isFavorite = currentTrack && favorites.some(t => t.id === currentTrack.id);

  if (!currentTrack) return null;

  const handleProgress = (state: { playedSeconds: number, played: number }) => {
    setPlayed(state.played);
  };

  const shareSong = () => {
    if (currentTrack) {
      const url = `${window.location.origin}?songId=${currentTrack.id}`;
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPlayed = parseFloat(e.target.value);
    setPlayed(newPlayed);
    playerRef.current?.seekTo(newPlayed, 'fraction');
  };

  const playerConfig = React.useMemo(() => ({
    youtube: {
      playerVars: {
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        vq: 'tiny',
        playsinline: 1,
        origin: typeof window !== 'undefined' ? window.location.origin : undefined
      }
    }
  }), []);

  return (
    <div className="absolute bottom-0 left-0 right-0 h-24 glass z-30 px-10 flex items-center justify-between">
      {/* Hidden YouTube Player, kept inside viewport to prevent browser throttling in background tabs */}
      <div className="absolute top-0 left-0 w-10 h-10 opacity-[0.01] pointer-events-none overflow-hidden z-[-1]">
        <ReactPlayer
          ref={playerRef}
          url={currentTrack.url}
          playing={isPlaying}
          volume={volume}
          muted={muted}
          onEnded={nextTrack}
          onProgress={handleProgress}
          width="100%"
          height="100%"
          playsinline
          config={playerConfig}
        />
      </div>

      {/* Track Info */}
      <div className="flex items-center w-1/4 min-w-[200px]">
        <img 
          src={currentTrack.thumbnail} 
          alt={currentTrack.title} 
          className="w-14 h-14 object-cover rounded-xl shadow-lg mr-4"
        />
        <div className="flex flex-col truncate pr-4">
          <div className="text-sm font-bold text-white truncate hover:underline cursor-pointer">
            {currentTrack.title}
          </div>
          <div className="text-xs text-gray-400 truncate mt-1">
            {currentTrack.author}
          </div>
        </div>
        <button 
          onClick={() => toggleFavorite(currentTrack)} 
          className="ml-auto text-pink-500 hover:text-pink-400 transition-colors"
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center flex-1 max-w-2xl px-12">
        <div className="flex items-center space-x-8 mb-3">
          <button onClick={shareSong} className="text-gray-400 hover:text-white transition" title="Share Song">
            <Share2 className="w-5 h-5" />
          </button>
          <button onClick={prevTrack} className="text-gray-400 hover:text-white transition">
            <SkipBack className="w-6 h-6 fill-current" />
          </button>
          <button 
            onClick={isPlaying ? pause : play} 
            className="w-12 h-12 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 transition-transform"
          >
            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
          </button>
          <button onClick={nextTrack} className="text-gray-400 hover:text-white transition">
            <SkipForward className="w-6 h-6 fill-current" />
          </button>
          <button className="text-gray-400 hover:text-white transition" title="Queue">
            <ListMusic className="w-5 h-5" />
          </button>
        </div>
        <div className="w-full flex items-center space-x-3 group relative cursor-pointer" onClick={(e) => {
          // Custom progress bar click handling since we're rendering it manually for styling
          const bounds = e.currentTarget.getBoundingClientRect();
          const p = (e.clientX - bounds.left) / bounds.width;
          handleSeekChange({ target: { value: p.toString() } } as any);
        }}>
          <span className="text-[10px] text-gray-500 font-mono w-10 text-right">{formatTime(played * (parseDuration(currentTrack.duration)))}</span>
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden relative group-hover:h-2 transition-all">
            <div 
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-pink-500 to-violet-500" 
              style={{ width: `${played * 100}%` }}
            ></div>
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `calc(${played * 100}% - 6px)` }}
            ></div>
          </div>
          <span className="text-[10px] text-gray-500 font-mono w-10">{currentTrack.duration}</span>
        </div>
      </div>

      {/* Volume */}
      <div className="flex items-center justify-end w-1/4 space-x-4">
        <button onClick={() => setMuted(!muted)} className="text-gray-400 hover:text-white transition">
          {muted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
        <div className="flex items-center space-x-2">
           <div 
             className="w-24 h-1 bg-white/10 rounded-full relative cursor-pointer"
             onClick={(e) => {
               const bounds = e.currentTarget.getBoundingClientRect();
               const v = (e.clientX - bounds.left) / bounds.width;
               setVolume(Math.max(0, Math.min(1, v)));
             }}
           >
             <div className="absolute left-0 top-0 bottom-0 bg-white rounded-full" style={{ width: `${(muted ? 0 : volume) * 100}%` }}></div>
           </div>
        </div>
      </div>
    </div>
  );
}

function parseDuration(durationStr: string): number {
  if (!durationStr) return 0;
  const parts = durationStr.split(':').map(Number).reverse();
  let seconds = 0;
  if (parts[0]) seconds += parts[0];
  if (parts[1]) seconds += parts[1] * 60;
  if (parts[2]) seconds += parts[2] * 3600;
  return seconds;
}

function formatTime(secondsStr: number): string {
  const totalSeconds = Math.floor(secondsStr);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
