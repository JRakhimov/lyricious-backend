# Lyricious Backend

###### Search and fetch lyrics from popular lyrics provider services

Web Scraping tool of the project has ported from [python project](https://github.com/SimonIT/spotifylyrics) and currently provides texts from services:

| Service          | Status |
| ---------------- | ------ |
| musixmatch.com   | ✅     |
| genius.com       | ✅     |
| netease.com      | ✅     |
| rclyricsband.com | ❌     |
| songmeanings.com | ❌     |
| songlyrics.com   | ❌     |
| AZLyrics.com     | ❌     |

###### Lyricious supports caching and therefore all your future searches will be processed much faster

Now, the search scheme looks like this: cache → netease.com → musixmatch.com → genius.com
