import ytSearch from 'yt-search';

export default async function handler(req: any, res: any) {
  try {
    const q = req.query.q as string;
    if (!q) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    const r = await ytSearch(q);
    const videos = r.videos.slice(0, 20).map((v: any) => ({
      id: v.videoId,
      title: v.title,
      author: v.author.name,
      thumbnail: v.thumbnail,
      duration: v.timestamp,
      url: v.url
    }));

    res.status(200).json({ results: videos });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search' });
  }
}
