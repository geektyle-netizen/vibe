import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import ytSearch from 'yt-search';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API constraints
  app.get('/api/search', async (req, res) => {
    try {
      const q = req.query.q as string;
      if (!q) {
        return res.status(400).json({ error: 'Query is required' });
      }
      
      const r = await ytSearch(q);
      const videos = r.videos.slice(0, 20).map(v => ({
        id: v.videoId,
        title: v.title,
        author: v.author.name,
        thumbnail: v.thumbnail,
        duration: v.timestamp,
        url: v.url
      }));

      res.json({ results: videos });
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ error: 'Failed to search' });
    }
  });

  app.get('/api/trending', async (req, res) => {
    try {
      // Fetch trending by searching a popular term or empty search usually returns trending-like
      const r = await ytSearch('latest music hits');
      const videos = r.videos.slice(0, 15).map(v => ({
        id: v.videoId,
        title: v.title,
        author: v.author.name,
        thumbnail: v.thumbnail,
        duration: v.timestamp,
        url: v.url
      }));
      res.json({ results: videos });
    } catch (error) {
       console.error('Trending error:', error);
       res.status(500).json({ error: 'Failed to fetch trending' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
