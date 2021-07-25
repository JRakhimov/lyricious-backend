import fetch from 'node-fetch';
import JSSoup from 'jssoup';
import { Lyrics, Song } from '../../entities';
import { IocContext } from 'power-di';
import { CacheService } from './cache_service';

export class LyricsService {
  static async getLyrics(song: Song): Promise<Lyrics | null> {
    const cached = IocContext.DefaultInstance.get(CacheService).getLyrics(
      CacheService.toLyricsKey(song.artist, song.name),
    );

    if (cached) return cached;

    const services: Array<(Song) => Promise<Lyrics>> = [
      LyricsService.genius,
      LyricsService.musixMatch,
    ];

    for (const service of services) {
      const lyrics = await service(song);

      if (lyrics) return lyrics;
    }
  }

  static async genius(song: Song): Promise<Lyrics | null> {
    const url = `https://genius.com/${song.artist
      .split(' ')
      .join('-')}-${song.name.split(' ').join('-')}-lyrics`;

    const body = await fetch(encodeURI(url)).then((response) =>
      response.text(),
    );
    const soup = new JSSoup(body, 'html.parser');
    const lyrics = soup.find('div', { class: 'lyrics' });

    if (lyrics != null) return new Lyrics('Genius', url, lyrics.text, song);
  }

  static async musixMatch(song: Song): Promise<Lyrics | null> {
    const url = `https://www.musixmatch.com/search/${song.artist
      .split(' ')
      .join('-')}-${song.name.split(' ').join('-')}`;

    const headers = {
      'User-Agent':
        'curl/7.9.8 (i686-pc-linux-gnu) libcurl 7.9.8 (OpenSSL 0.9.6b) (ipv6 enabled)',
    };

    const body = await fetch(encodeURI(url), {
      headers,
    }).then((response) => response.text());

    const soup = new JSSoup(body, 'html.parser');

    const extractProps = (soup: JSSoup): string | null => {
      const scripts = soup.findAll('script') as Array<any> | null;

      if (scripts == null) return null;

      for (const script of scripts) {
        if (script && script.text.includes('__mxmProps')) {
          return script.text;
        }
      }
    };

    const props = extractProps(soup);

    if (props) {
      const regex = new RegExp('"track_share_url":"([^"]*)"');
      const page = regex.exec(props);

      if (page && page[0]) {
        const lyricsUrl = JSON.parse(`{${page[0]}}`)['track_share_url'];

        const lyricsPage = await fetch(lyricsUrl, {
          headers,
        }).then((response) => response.text());

        const soup = new JSSoup(lyricsPage, 'html.parser');
        const props = extractProps(soup);

        if (props.includes('"body":"')) {
          let lyrics = props.split('"body":"')[1].split('","language"')[0];
          lyrics = lyrics.split('\\n').join('\n');
          lyrics = lyrics.split('\\').join('');

          return new Lyrics('Musixmatch', decodeURI(lyricsUrl), lyrics, song);
        }
      }
    }
  }
}
