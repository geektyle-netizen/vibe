export interface Track {
  id: string;
  title: string;
  author: string;
  thumbnail: string;
  duration: string;
  url: string;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
}
