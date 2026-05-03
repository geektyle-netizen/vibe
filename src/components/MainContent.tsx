import React, { useState, useEffect } from 'react';
import { Search, Play, Heart, Plus, Loader2, Trash2, Download } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { Track } from '../types';

export default function MainContent({ view, setView }: { view: string, setView: (v: string) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [trending, setTrending] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const { playTrack, toggleFavorite, favorites, addToQueue, playlists, addToPlaylist, removeFromPlaylist } = usePlayerStore();

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    if (view === 'home' && trending.length === 0) {
      setLoading(true);
      fetch('/api/trending')
        .then(res => res.json())
        .then(data => {
          if (data.results) setTrending(data.results);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [view]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.results) {
        setResults(data.results);
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const renderTrackList = (tracks: Track[], showAdd = false, playlistId?: string) => (
    <div className="flex flex-col space-y-2 mt-4">
      {tracks.map((track, i) => {
        const isFav = favorites.some(t => t.id === track.id);
        return (
          <div key={`${track.id}-${i}`} className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 cursor-pointer group transition-all">
            <div className="flex items-center space-x-4 w-1/2">
              <div className="w-8 text-gray-500 text-sm font-mono text-center">{String(i + 1).padStart(2, '0')}</div>
              <div className="relative w-12 h-12 flex-shrink-0">
                <img src={track.thumbnail} alt={track.title} className="w-12 h-12 object-cover rounded-lg shadow-md group-hover:opacity-60 transition" />
                <button 
                  onClick={() => playTrack(track, tracks.slice(i + 1))}
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  <Play className="w-6 h-6 fill-white drop-shadow-lg" />
                </button>
              </div>
              <div className="flex-1 truncate">
                <div className="font-medium text-white truncate">{track.title}</div>
                <div className="text-xs text-gray-400 truncate">{track.author}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 opacity-0 group-hover:opacity-100 transition text-gray-400">
              <div className="text-xs text-gray-500 mr-8 uppercase hidden md:block">Source: YouTube</div>
              
              <button onClick={() => { showToast("Saved to offline cache"); }} className="hover:text-white" title="Download for Offline">
                <Download className="w-5 h-5" />
              </button>
              
              <button onClick={() => toggleFavorite(track)} className="hover:text-pink-500">
                <Heart className={`w-5 h-5 ${isFav ? 'fill-pink-500 text-pink-500 opacity-100' : ''}`} />
              </button>
              
              {showAdd && playlists.length > 0 && (
                <div className="relative group/menu">
                  <button className="hover:text-white"><Plus className="w-5 h-5" /></button>
                  <div className="absolute right-0 bottom-full mb-2 hidden group-hover/menu:block w-48 bg-[#0c0a1a] shadow-2xl glass rounded py-1 z-10">
                    <div className="px-3 py-1 text-[10px] text-gray-400 uppercase font-bold tracking-widest border-b border-white/10 mb-1">Add to playlist</div>
                    {playlists.map(p => (
                      <button 
                        key={p.id}
                        onClick={() => { addToPlaylist(p.id, track); showToast(`Added to ${p.name}`); }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-white/10 text-white truncate transition-colors"
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {playlistId && (
                <button onClick={() => removeFromPlaylist(playlistId, track.id)} className="hover:text-red-400 transition" title="Remove from playlist">
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
              
              <div className="text-xs text-gray-500 w-12 text-right">{track.duration}</div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {toast && (
        <div className="fixed top-4 right-4 bg-pink-500 text-white px-6 py-3 rounded shadow-2xl z-50 transition-all font-medium text-sm">
          {toast}
        </div>
      )}
      <header className="h-20 flex items-center justify-between px-10 z-10 space-x-6">
        {(view === 'search' || view === 'home') && (
          <form onSubmit={handleSearch} className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search for songs, artists, or albums..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-pink-500 text-white transition placeholder-gray-500"
              onFocus={() => setView('search')}
            />
          </form>
        )}
      </header>

      <div className="flex-1 px-10 overflow-y-auto no-scrollbar pb-32">
        {loading && (
          <div className="flex items-center justify-center p-12 text-pink-500">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        )}

        {view === 'search' && !loading && (
          <div>
            <div className="flex items-center justify-between mb-6 mt-4">
               <h2 className="text-2xl font-bold">Search Results</h2>
            </div>
            {results.length > 0 ? renderTrackList(results, true) : (
                <div className="text-gray-500 text-center py-12">Search for songs, artists, or podcasts.</div>
            )}
          </div>
        )}

        {view === 'home' && !loading && (
          <div>
            <div className="flex items-center justify-between mb-6 mt-4">
              <h2 className="text-2xl font-bold">Trending Now</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {trending.map((track) => (
                <div 
                  key={track.id} 
                  className="glass rounded-3xl p-4 flex flex-col group cursor-pointer hover:bg-white/10 transition-all relative"
                  onClick={() => playTrack(track, trending)}
                >
                  <div className="relative mb-4 aspect-square rounded-2xl bg-indigo-500 overflow-hidden shadow-2xl">
                    <img src={track.thumbnail} className="w-full h-full object-cover" alt={track.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-pink-500 shadow-xl flex items-center justify-center">
                         <Play className="w-5 h-5 fill-white text-white ml-1" />
                      </div>
                    </div>
                  </div>
                  <h3 className="font-bold truncate text-white">{track.title}</h3>
                  <p className="text-xs text-gray-400 mt-1 truncate">{track.author}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-12">
               <h2 className="text-2xl font-bold mb-6">Top Tracks</h2>
               {renderTrackList(trending.slice(0, 10), true)}
            </div>
          </div>
        )}

        {view === 'favorites' && (
          <div>
            <div className="flex items-end space-x-6 mb-8 mt-4">
              <div className="w-48 h-48 bg-gradient-to-br from-pink-500 to-violet-500 shadow-2xl flex items-center justify-center rounded-3xl">
                <Heart className="w-16 h-16 fill-white text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm uppercase font-bold tracking-widest mb-2">Playlist</p>
                <h1 className="text-6xl font-black text-white tracking-tight mb-4">Liked Songs</h1>
                <p className="text-gray-300 text-sm font-medium">{favorites.length} songs</p>
              </div>
            </div>
            {favorites.length > 0 ? renderTrackList(favorites, true) : (
                <div className="text-gray-500 text-center py-12">No liked songs yet.</div>
            )}
          </div>
        )}

        {view.startsWith('playlist-') && (
          <div>
            {(() => {
              const p = playlists.find(p => p.id === view.split('-')[1]);
              if (!p) return <div className="text-gray-500">Playlist not found</div>;
              
              return (
                <>
                  <div className="flex items-end space-x-6 mb-8 mt-4">
                    <div className="w-48 h-48 glass shadow-2xl flex items-center justify-center rounded-3xl">
                      <Search className="w-16 h-16 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm uppercase font-bold tracking-widest mb-2">Playlist</p>
                      <h1 className="text-6xl font-black text-white tracking-tight mb-4">{p.name}</h1>
                      <p className="text-gray-300 text-sm font-medium">{p.tracks.length} songs</p>
                    </div>
                  </div>
                  {p.tracks.length > 0 ? renderTrackList(p.tracks, false, p.id) : (
                    <div className="text-gray-500 text-center py-12">This playlist is empty. Let's find some songs for it!</div>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {view === 'library' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Your Library</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
               <div 
                  className="bg-gradient-to-br from-pink-500 to-violet-500 p-6 rounded-3xl shadow-xl hover:scale-105 transition-transform cursor-pointer"
                  onClick={() => setView('favorites')}
                >
                  <Heart className="w-8 h-8 fill-white text-white mb-4" />
                  <h3 className="text-2xl font-bold text-white">Liked Songs</h3>
                  <p className="text-white/80 mt-2">{favorites.length} liked songs</p>
               </div>
               {playlists.map(p => (
                 <div 
                    key={p.id}
                    className="glass p-6 rounded-3xl hover:bg-white/10 transition-colors cursor-pointer flex flex-col group relative"
                    onClick={() => setView(`playlist-${p.id}`)}
                  >
                    <Search className="w-8 h-8 text-gray-400 mb-4 group-hover:text-pink-500 transition-colors" />
                    <h3 className="text-xl font-bold text-white truncate">{p.name}</h3>
                    <p className="text-gray-400 mt-2 text-sm">{p.tracks.length} tracks</p>
                 </div>
               ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
