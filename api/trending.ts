import ytSearch from 'yt-search';

export default async function handler(req: any, res: any) {
  try {
    const r = await ytSearch('latest music hits');
    const videos = r.videos.slice(0, 15).map((v: any) => ({
      id: v.videoId,
      title: v.title,
      author: v.author.name,
      thumbnail: v.thumbnail,
      duration: v.timestamp,
      url: v.url
    }));
    res.status(200).json({ results: videos });
  } catch (error) {
     console.error('Trending error:', error);
     res.status(500).json({ error: 'Failed to fetch trending' });
  }
}
