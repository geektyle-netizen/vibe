/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import Player from './components/Player';
import { usePlayerStore } from './store/usePlayerStore';

export default function App() {
  const [view, setView] = useState('home');
  const { currentTrack, playTrack } = usePlayerStore();

  useEffect(() => {
    // Check for shared song
    const params = new URLSearchParams(window.location.search);
    const songId = params.get('songId');
    if (songId && !currentTrack) {
      // In a real app we would use server to fetch the specific song details
      // Here we will just perform a search from the backend to construct the track
      fetch(`/api/search?q=${songId}`)
        .then(res => res.json())
        .then(data => {
          if (data.results && data.results.length > 0) {
            playTrack(data.results[0]);
            // Clean up the URL
            window.history.replaceState({}, '', '/');
          }
        })
        .catch(console.error);
    }
  }, []);

  useEffect(() => {
    // Setup MediaSession API for background / lockscreen controls
    if ('mediaSession' in navigator && currentTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.author,
        artwork: [
          { src: currentTrack.thumbnail, sizes: '512x512', type: 'image/jpeg' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => { usePlayerStore.getState().play() });
      navigator.mediaSession.setActionHandler('pause', () => { usePlayerStore.getState().pause() });
      navigator.mediaSession.setActionHandler('previoustrack', () => { usePlayerStore.getState().prevTrack() });
      navigator.mediaSession.setActionHandler('nexttrack', () => { usePlayerStore.getState().nextTrack() });
    }
  }, [currentTrack]);

  return (
    <div className="mesh-bg flex h-screen text-white overflow-hidden">
      <Sidebar setView={setView} view={view} />
      <MainContent view={view} setView={setView} />
      <Player />
    </div>
  );
}
