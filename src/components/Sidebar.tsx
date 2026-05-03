import React from 'react';
import { Home, Search, Library, PlusCircle, Heart } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';

export default function Sidebar({ setView, view }: { setView: (v: string) => void; view?: string }) {
  const { playlists, createPlaylist } = usePlayerStore();

  const handleNewPlaylist = () => {
    const name = prompt('Enter playlist name:');
    if (name) {
      createPlaylist(name);
    }
  };

  return (
    <div className="w-64 glass h-full flex flex-col z-20 text-gray-400 pb-24">
      <div className="p-8">
        <div className="flex items-center space-x-3 text-white mb-8 cursor-pointer" onClick={() => setView('home')}>
          <div className="w-10 h-10 bg-gradient-to-tr from-pink-500 to-violet-500 rounded-xl flex items-center justify-center font-bold text-xl">
            V
          </div>
          <span className="text-2xl font-bold tracking-tight">VIBE</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 font-semibold text-sm">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-4 mb-4">Menu</div>
          <button 
            onClick={() => setView('home')} 
            className={`flex items-center space-x-4 px-4 py-3 rounded-lg cursor-pointer transition w-full ${view === 'home' ? 'active-nav text-white' : 'hover:bg-white/5 hover:text-white'}`}
          >
            <Home className="w-6 h-6" />
            <span>Home</span>
          </button>
          <button 
            onClick={() => setView('search')} 
            className={`flex items-center space-x-4 px-4 py-3 rounded-lg cursor-pointer transition w-full ${view === 'search' ? 'active-nav text-white' : 'hover:bg-white/5 hover:text-white'}`}
          >
            <Search className="w-6 h-6" />
            <span>Search</span>
          </button>
          <button 
            onClick={() => setView('library')} 
            className={`flex items-center space-x-4 px-4 py-3 rounded-lg cursor-pointer transition w-full ${view === 'library' ? 'active-nav text-white' : 'hover:bg-white/5 hover:text-white'}`}
          >
            <Library className="w-6 h-6" />
            <span>Library</span>
          </button>
        </nav>
      </div>

      <div className="mt-4 px-6 flex-1 overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">
          <span>Playlists</span>
          <button onClick={handleNewPlaylist} className="hover:text-emerald-500 transition">
            <PlusCircle className="w-4 h-4" />
          </button>
        </div>
        
        <button 
          onClick={() => setView('favorites')} 
          className="flex items-center space-x-3 mb-4 hover:text-white transition w-full text-left bg-gradient-to-br from-indigo-600 to-purple-800 p-2 rounded-md text-white shadow-sm"
        >
          <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow">
            <Heart className="w-4 h-4 fill-current" />
          </div>
          <span className="font-medium text-sm truncate">Liked Songs</span>
        </button>

        <ul className="space-y-3 text-sm text-zinc-400">
          {playlists.map(p => (
            <li key={p.id}>
              <button 
                onClick={() => setView(`playlist-${p.id}`)}
                className="hover:text-white truncate w-full text-left transition"
              >
                {p.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
