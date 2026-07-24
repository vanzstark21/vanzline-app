async function search(query) {
    const res = await fetch('https://www.youtube.com/results?search_query=' + encodeURIComponent(query), {
       headers: {
           'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
       }
    });
    const html = await res.text();
    let match = html.match(/var ytInitialData = (\{.*?\});<\/script>/s);
    if (!match) match = html.match(/window\["ytInitialData"\] = (\{.*?\});/s);
    if (match) {
        try {
            const json = JSON.parse(match[1]);
            const contents = json.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents;
            const videos = contents.filter(c => c.videoRenderer).map(c => c.videoRenderer);
            console.log('Videos:', videos.length);
            if(videos.length > 0) {
                console.log(videos[0].title.runs[0].text, videos[0].videoId);
            }
        } catch(e) {
            console.error("Parse Error:", e.message);
        }
    } else {
        console.log('No match');
    }
}
search('kopi hitam');
