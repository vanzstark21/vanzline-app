import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
  try {
    const query = event.queryStringParameters?.q;
    if (!query) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Query required' })
      };
    }

    const res = await fetch('https://www.youtube.com/results?search_query=' + encodeURIComponent(query), {
       headers: {
           'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
       }
    });
    
    if (!res.ok) {
        throw new Error('Failed to fetch from YouTube');
    }
    
    const html = await res.text();
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

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(videos)
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
