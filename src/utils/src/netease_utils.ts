import { Line, LyricsQuery } from '../../entities';
import {
  Lyric,
  NeteaseService,
  NSong,
} from '../../services/src/netease_service';
//@ts-ignore
import { sify, tify } from 'chinese-conv';

export interface ParseLyricsOptions {
  cleanLyrics?: boolean;
  keepPlainText?: boolean;
}

interface MatchingLyricsOptions {
  onlySearchName?: boolean;
  duration?: number;
  fetchData?: (s: string, fetchOptions?: RequestInit) => Promise<NSong[]>;
}

export class NeteaseUtils {
  static capitalize(s: string) {
    return s.replace(/^(\w)/, ($1) => $1.toUpperCase());
  }

  // Convert all into English punctuation marks for processing
  static normalize(s: string, emptySymbol = true) {
    const result = s
      .replace(/（/g, '(')
      .replace(/）/g, ')')
      .replace(/【/g, '[')
      .replace(/】/g, ']')
      .replace(/。/g, '. ')
      .replace(/；/g, '; ')
      .replace(/：/g, ': ')
      .replace(/？/g, '? ')
      .replace(/！/g, '! ')
      .replace(/、|，/g, ', ')
      .replace(/‘|’|′|＇/g, "'")
      .replace(/“|”/g, '"')
      .replace(/〜/g, '~')
      .replace(/·|・/g, '•');

    if (emptySymbol) {
      result.replace(/-/g, ' ').replace(/\//g, ' ');
    }

    return result.replace(/\s+/g, ' ').trim();
  }

  static plainText(s: string) {
    return s
      .replace(/[\(\)\[\]\-.,?!:'"~]/g, ' ')
      .replace(
        /((\p{sc=Han}|\p{sc=Katakana}|\p{sc=Hiragana}|\p{sc=Hang})+)/gu,
        ' $1 ',
      )
      .replace(/\s+/g, ' ')
      .trim();
  }

  // https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
  static ignoreAccented(s: string) {
    return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  static simplifiedText(s: string) {
    return NeteaseUtils.ignoreAccented(
      NeteaseUtils.plainText(sify(NeteaseUtils.normalize(s)).toLowerCase()),
    );
  }

  static removeSongFeat(s: string) {
    return (
      s
        .replace(/-\s+(feat|with).*/i, '')
        .replace(/(\(|\[)(feat|with)\.?\s+.*(\)|\])$/i, '')
        .trim() || s
    );
  }

  static getText(s: string) {
    return s
      .replace(/\(.*?\)|\[.*?\]|\sremix$|\sversion$/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  static parseLyrics(lyricStr: string, options: ParseLyricsOptions = {}) {
    if (!lyricStr) return null;
    const otherInfoKeys = [
      '作?\\s*词|作?\\s*曲|编\\s*曲?|监\\s*制?',
      '.*编写|.*和音|.*和声|.*合声|.*提琴|.*录|.*工程|.*工作室|.*设计|.*剪辑|.*制作|.*发行|.*出品|.*后期|.*混音|.*缩混',
      '原唱|翻唱|题字|文案|海报|古筝|二胡|钢琴|吉他|贝斯|笛子|鼓|弦乐',
      'lrc|publish|vocal|guitar|program|produce|write',
    ];

    const otherInfoRegexp = new RegExp(
      `^(${otherInfoKeys.join('|')}).*(:|：)`,
      'i',
    );

    const lines = lyricStr.split(/\r?\n/).map((line) => line.trim());
    const lyrics = lines
      .map((line) => {
        // ["[ar:Beyond]"]
        // ["[03:10]"]
        // ["[03:10]", "永远高唱我歌"]
        // ["永远高唱我歌"]
        // ["[03:10]", "[03:10]", "永远高唱我歌"]
        const matchResult = line.match(/(\[.*?\])|([^\[\]]+)/g) || [line];
        const textIndex = matchResult.findIndex(
          (slice) => !slice.endsWith(']'),
        );
        let text = '';

        if (textIndex > -1) {
          text = matchResult.splice(textIndex, 1)[0];
          text = NeteaseUtils.capitalize(NeteaseUtils.normalize(text, false));
          text = sify(text).replace(/\.|,|\?|!|;$/u, '');
        }

        if (!matchResult.length || options.keepPlainText) {
          return [new Line(text)];
        }

        return matchResult.map((slice) => {
          const matchResut = slice.match(/[^\[\]]+/g);
          const [key, value] = matchResut?.[0].split(':') || [];
          const [min, sec] = [parseFloat(key), parseFloat(value)];

          if (!isNaN(min)) {
            if (!options.cleanLyrics || !otherInfoRegexp.test(text)) {
              return new Line(text, Math.round((min * 60 + sec) * 100) / 100);
            }
          } else if (!options.cleanLyrics && key && value) {
            return new Line(`${key.toUpperCase()}: ${value}`);
          }

          return new Line('');
        });
      })
      .flat()
      .sort((a, b) => {
        if (a.startTime === null) {
          return 0;
        }
        if (b.startTime === null) {
          return 1;
        }
        return a.startTime - b.startTime;
      })
      .filter(({ text }, index, arr) => {
        if (index) {
          const prevEle = arr[index - 1];

          if (prevEle.text === text || text === '') {
            return false;
          }
        }
        return true;
      });

    return lyrics.length ? lyrics : null;
  }

  static correctionLyrics(lyrics: Lyric, str: string) {
    // ignore traditional Chinese
    if (!lyrics) return lyrics;
    const normalizeStr = NeteaseUtils.normalize(str, false);
    const regularization = (s: string) =>
      new RegExp(
        NeteaseUtils.normalize(s, false)
          .toLowerCase()
          .replace(/\./g, '\\.')
          .replace(/\*/g, '.')
          .replace(/\(/g, '\\(')
          .replace(/\)/g, '\\)')
          .replace(/\[/g, '\\[')
          .replace(/\]/g, '\\]'),
        'i',
      );
    return lyrics.map(({ startTime, text }) => {
      let match: RegExpMatchArray | null = null;
      if (text.replace(/\*/g, '').length > 5) {
        try {
          match = normalizeStr.match(regularization(text));
        } catch {}
      }
      return {
        startTime,
        text: NeteaseUtils.capitalize(match?.[0] || text),
      };
    });
  }

  static async matchingLyrics(
    query: LyricsQuery,
    options: MatchingLyricsOptions = {},
  ): Promise<{ list: NSong[]; id: number; score: number }> {
    const {
      onlySearchName = false,
      fetchData = NeteaseService.fetchSongList,
      duration,
      // fetchTransName = fetchChineseName,
    } = options;

    const { name = '', artists = '' } = query;

    const queryName = NeteaseUtils.normalize(name);
    const queryName1 = queryName.toLowerCase();
    const queryName2 = sify(queryName1);
    const queryName3 = NeteaseUtils.plainText(queryName1);
    const queryName4 = NeteaseUtils.ignoreAccented(queryName3);
    const queryName5 = NeteaseUtils.removeSongFeat(queryName4);
    const queryName6 = NeteaseUtils.getText(
      NeteaseUtils.removeSongFeat(NeteaseUtils.ignoreAccented(queryName2)),
    );
    const queryArtistsArr = artists
      .split(',')
      .map((e) => NeteaseUtils.normalize(e.trim()))
      .sort();
    const queryArtistsArr1 = queryArtistsArr.map((e) => e.toLowerCase());
    const queryArtistsArr2 = queryArtistsArr1.map((e) => sify(e));
    const queryArtistsArr3 = queryArtistsArr2.map((e) =>
      NeteaseUtils.ignoreAccented(NeteaseUtils.plainText(e)),
    );

    // const singerAlias = await fetchTransName(
    //   queryArtistsArr.map(this.simplifiedText).join(),
    //   fetchOptions,
    // );
    // const buildInSingerAlias = await buildInSingerAliasPromise;

    // const queryArtistsArr4 = queryArtistsArr3
    // .map((e) => singerAlias[e] || buildInSingerAlias[e] || e)
    // .map((e) => sify(e).toLowerCase());

    const searchString = onlySearchName
      ? NeteaseUtils.removeSongFeat(name)
      : `${queryArtistsArr3.join()} ${NeteaseUtils.removeSongFeat(name)}`;
    const songs = await fetchData(searchString);
    const listIdSet = new Set<number>();
    const list: NSong[] = [];

    let id = 0;
    let score = 0;

    songs.forEach((song) => {
      const DURATION_WEIGHT = duration != null ? 10 : 0;
      let currentScore = 0;

      // if (
      //   !audio ||
      //   (!isProd && audio.duration < 40) ||
      //   !song.duration ||
      //   Math.abs(audio.duration - song.duration / 1000) < 2
      // ) {
      //   currentScore += DURATION_WEIGHT;
      // }

      let songName = NeteaseUtils.normalize(song.name);
      if (songName === queryName) {
        currentScore += 10;
      } else {
        songName = songName.toLowerCase();
        if (songName === queryName1) {
          currentScore += 9.1;
        } else {
          songName = sify(songName);
          if (
            songName === queryName2 ||
            songName.endsWith(`(${queryName2})`) ||
            queryName2.endsWith(`(${songName})`)
          ) {
            currentScore += 9;
          } else {
            songName = NeteaseUtils.plainText(songName);
            if (songName === queryName3) {
              currentScore += 8.2;
            } else {
              songName = NeteaseUtils.ignoreAccented(songName);
              if (songName === queryName4) {
                currentScore += 8.1;
              } else {
                songName = NeteaseUtils.removeSongFeat(songName);
                if (songName === queryName5) {
                  currentScore += 8;
                } else {
                  songName = NeteaseUtils.getText(
                    // without `plainText`
                    NeteaseUtils.removeSongFeat(
                      NeteaseUtils.ignoreAccented(
                        sify(NeteaseUtils.normalize(song.name).toLowerCase()),
                      ),
                    ),
                  );

                  if (songName === queryName6) {
                    // name & name (abc)
                    // name & name remix
                    currentScore += 7;
                  } else if (
                    songName.startsWith(queryName6) ||
                    queryName6.startsWith(songName)
                  ) {
                    currentScore += 6;
                  } else if (
                    songName.includes(queryName6) ||
                    queryName6.includes(songName)
                  ) {
                    currentScore += 3;
                  }
                }
              }
            }
          }
        }
      }

      let songArtistsArr = song.artists
        .map((e) => NeteaseUtils.normalize(e.name))
        .sort();
      const len = queryArtistsArr.length + songArtistsArr.length;
      if (queryArtistsArr.join() === songArtistsArr.join()) {
        currentScore += 6;
      } else {
        songArtistsArr = songArtistsArr.map((e) => e.toLowerCase());
        if (
          false
          // queryArtistsArr1.join() === songArtistsArr.join() ||
          // queryArtistsArr4.join() === songArtistsArr.join()
        ) {
          currentScore += 5.5;
        } else if (
          new Set([...queryArtistsArr1, ...songArtistsArr]).size < len
        ) {
          currentScore += 5.4;
        } else {
          songArtistsArr = songArtistsArr.map((e) => sify(e));
          if (queryArtistsArr2.join() === songArtistsArr.join()) {
            currentScore += 5.3;
          } else {
            songArtistsArr = songArtistsArr.map((e) =>
              NeteaseUtils.ignoreAccented(NeteaseUtils.plainText(e)),
            );
            if (queryArtistsArr3.join() === songArtistsArr.join()) {
              currentScore += 5.1;
            } else {
              if (
                new Set([...queryArtistsArr2, ...songArtistsArr]).size < len
                // || new Set([...queryArtistsArr4, ...songArtistsArr]).size < len
              ) {
                currentScore += 5;
              } else {
                songArtistsArr = songArtistsArr.map((e) =>
                  NeteaseUtils.getText(e),
                );

                if (
                  songArtistsArr.some(
                    (artist) =>
                      queryName2.includes(artist) ||
                      queryArtistsArr2.join().includes(artist),
                    // || queryArtistsArr4.join().includes(artist),
                  )
                ) {
                  currentScore += 3;
                }
              }
            }
          }
        }
      }

      if (currentScore > score) {
        if (currentScore > 10 + DURATION_WEIGHT) {
          id = song.id;
        }

        score = currentScore;
      }

      if (currentScore > 0) {
        list.push(song);
        listIdSet.add(song.id);
      }
    });

    if (!onlySearchName) {
      const {
        id: idForMissingName,
        list: listForMissingName,
        score: scoreForMissingName,
      } = await this.matchingLyrics(query, {
        duration: duration,
        onlySearchName: true,
        fetchData,
      });

      listForMissingName.forEach((song) => {
        if (!listIdSet.has(song.id)) {
          list.push(song);
        }
      });

      const resultId = scoreForMissingName > score ? idForMissingName : id;
      const resultScore = Math.max(scoreForMissingName, score);
      return { id: resultId, list, score: resultScore };
    }

    return { id, list, score };
  }
}
