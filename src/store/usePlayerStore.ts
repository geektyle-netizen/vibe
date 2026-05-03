import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Track, Playlist } from '../types';

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  queue: Track[];
  history: Track[];
  favorites: Track[];
  playlists: Playlist[];
  
  // Actions
  playTrack: (track: Track, queue?: Track[]) => void;
  pause: () => void;
  play: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  
  // Library Actions
  toggleFavorite: (track: Track) => void;
  createPlaylist: (name: string) => void;
  addToPlaylist: (playlistId: string, track: Track) => void;
  removeFromPlaylist: (playlistId: string, trackId: string) => void;
  deletePlaylist: (playlistId: string) => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentTrack: null,
      isPlaying: false,
      queue: [],
      history: [],
      favorites: [],
      playlists: [],

      playTrack: (track, queue) => set((state) => {
        const newHistory = state.currentTrack 
          ? [state.currentTrack, ...state.history.filter(t => t.id !== state.currentTrack?.id)].slice(0, 50)
          : state.history;
          
        return {
          currentTrack: track,
          isPlaying: true,
          queue: queue || state.queue,
          history: newHistory
        };
      }),

      pause: () => set({ isPlaying: false }),
      play: () => set({ isPlaying: true }),

      nextTrack: () => set((state) => {
        if (state.queue.length === 0) return {};
        const [next, ...rest] = state.queue;
        const newHistory = state.currentTrack 
          ? [state.currentTrack, ...state.history].slice(0, 50)
          : state.history;
          
        return {
          currentTrack: next,
          queue: rest,
          history: newHistory,
          isPlaying: true
        };
      }),

      prevTrack: () => set((state) => {
        if (state.history.length === 0) return {};
        const [prev, ...rest] = state.history;
        return {
          currentTrack: prev,
          history: rest,
          queue: state.currentTrack ? [state.currentTrack, ...state.queue] : state.queue,
          isPlaying: true
        };
      }),

      addToQueue: (track) => set((state) => ({
        queue: [...state.queue, track]
      })),
      
      removeFromQueue: (index) => set((state) => {
        const newQueue = [...state.queue];
        newQueue.splice(index, 1);
        return { queue: newQueue };
      }),

      toggleFavorite: (track) => set((state) => {
        const exists = state.favorites.some(t => t.id === track.id);
        if (exists) {
          return { favorites: state.favorites.filter(t => t.id !== track.id) };
        }
        return { favorites: [...state.favorites, track] };
      }),

      createPlaylist: (name) => set((state) => ({
        playlists: [...state.playlists, { id: crypto.randomUUID(), name, tracks: [] }]
      })),

      addToPlaylist: (playlistId, track) => set((state) => ({
        playlists: state.playlists.map(p => {
          if (p.id === playlistId && !p.tracks.some(t => t.id === track.id)) {
            return { ...p, tracks: [...p.tracks, track] };
          }
          return p;
        })
      })),

      removeFromPlaylist: (playlistId, trackId) => set((state) => ({
        playlists: state.playlists.map(p => 
          p.id === playlistId 
            ? { ...p, tracks: p.tracks.filter(t => t.id !== trackId) } 
            : p
        )
      })),

      deletePlaylist: (playlistId) => set((state) => ({
        playlists: state.playlists.filter(p => p.id !== playlistId)
      }))
    }),
    {
      name: 'wave-player-storage',
      // Don't persist isPlaying state
      partialize: (state) => ({
        favorites: state.favorites,
        playlists: state.playlists,
        history: state.history,
      })
    }
  )
);
