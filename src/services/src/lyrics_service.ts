import fetch from 'node-fetch';
import JSSoup from 'jssoup';
import { Lyrics, LyricsQuery, Song } from '../../entities';
import { IocContext } from 'power-di';
import { DatabaseService } from './database_service';
import { NeteaseUtils } from '../../utils';
import { NeteaseService } from './netease_service';
import SocksProxyAgent from 'socks-proxy-agent/dist/agent';

export enum LyricsServices {
  netease = 'Netease',
  musixMatch = 'MusixMatch',
  genius = 'Genius',
}

export class LyricsService {
  static agent = new SocksProxyAgent('socks5h://127.0.0.1:9050');

  static async getLyrics(song: Song): Promise<Lyrics | null> {
    const databaseService = IocContext.DefaultInstance.get(DatabaseService);
    const cached = await databaseService.getSongs(song.name, song.artists);

    if (cached) return cached.lyrics;

    const services: Array<(Song) => Promise<Lyrics>> = [
      LyricsService.netease,
      LyricsService.musixMatch,
      LyricsService.genius,
    ];

    for (const service of services) {
      const lyrics = await service(song);

      if (lyrics) {
        song.lyrics = lyrics;

        if (lyrics.text.length > 0) databaseService.insertSong(song);

        return lyrics;
      }
    }
  }

  static async netease(song: Song): Promise<Lyrics | null> {
    const { id } = await NeteaseUtils.matchingLyrics(
      new LyricsQuery(song.name, song.artists[0]),
      {
        duration: song.duration,
      },
    );

    if (id != 0) {
      const lyrics = await NeteaseService.fetchLyric(id);

      if (lyrics) {
        let fixedLyrics = lyrics
          .split('\n')
          .filter((line) => !/作词|作曲|制作人/.test(line))
          .join('\n');

        return new Lyrics(
          LyricsServices.netease,
          fixedLyrics,
          Lyrics.withTimeCodeCheck(fixedLyrics),
        );
      }
    }
  }

  static async genius(song: Song): Promise<Lyrics | null> {
    const url = `https://genius.com/${song.artists[0]
      .split(' ')
      .join('-')}-${song.name.split(' ').join('-')}-lyrics`;

    const body = await fetch(encodeURI(url)).then((response) =>
      response.text(),
    );
    const soup = new JSSoup(body, 'html.parser');
    const lyrics = soup.find('div', { class: 'lyrics' });

    if (lyrics != null)
      return new Lyrics(
        LyricsServices.genius,
        lyrics.text,
        Lyrics.withTimeCodeCheck(lyrics),
      );
  }

  static async musixMatch(song: Song): Promise<Lyrics | null> {
    const url = `https://www.musixmatch.com/search/${song.artists[0]
      .split(' ')
      .join('-')}-${song.name.split(' ').join('-')}`;

    const headers = {
      'User-Agent':
        'curl/7.9.8 (i686-pc-linux-gnu) libcurl 7.9.8 (OpenSSL 0.9.6b) (ipv6 enabled)',
    };

    const body = await fetch(encodeURI(url), {
      headers,
      agent: LyricsService.agent,
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

          return new Lyrics(
            LyricsServices.musixMatch,
            lyrics,
            Lyrics.withTimeCodeCheck(lyrics),
          );
        }
      }
    }
  }
}
