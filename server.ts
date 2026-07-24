import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  app.get('/api/youtube', async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) return res.status(400).json({ error: 'Query required' });

      const fetchRes = await fetch('https://www.youtube.com/results?search_query=' + encodeURIComponent(query), {
         headers: {
             'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
         }
      });
      
      if (!fetchRes.ok) {
          throw new Error('Failed to fetch from YouTube');
      }
      
      const html = await fetchRes.text();
      let match = html.match(/var ytInitialData = (\{.*?\});<\/script>/s);
      if (!match) match = html.match(/window\["ytInitialData"\] = (\{.*?\});/s);
      
      let videos = [];
      if (match) {
          const json = JSON.parse(match[1]);
          const contents = json.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents;
          const vids = contents.filter((c: any) => c.videoRenderer).map((c: any) => c.videoRenderer);
          videos = vids.slice(0, 10).map((v: any) => ({
              id: v.videoId,
              title: v.title?.runs[0]?.text || 'No Title',
              thumb: v.thumbnail?.thumbnails[0]?.url || '',
              channel: v.ownerText?.runs[0]?.text || '',
              viewCount: v.viewCountText?.simpleText || ''
          }));
      }

      res.json(videos);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

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
