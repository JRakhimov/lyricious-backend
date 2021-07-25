import { Lyrics } from '../../entities';
import { Cache, load } from 'flat-cache';
import * as path from 'path';
import { deserialize, serialize } from 'serializr';
import { injectable } from 'power-di';
import { FLAT_CACHE_ID, FLAT_CACHE_PATH } from '../../utils/env';

@injectable()
export class CacheService {
  cache: Cache;

  constructor(cacheId?: string, cachePath?: string) {
    cacheId = cacheId ?? FLAT_CACHE_ID;
    cachePath = cachePath ?? path.resolve(FLAT_CACHE_PATH);

    this.cache = load(cacheId, cachePath);
  }

  static toLyricsKey(artist: string, name: string): string {
    return [artist.split(' ').join('_'), name.split(' ').join('_')].join('|');
  }

  putLyrics(lyrics: Lyrics): void {
    this.cache.setKey(
      CacheService.toLyricsKey(lyrics.song.artist, lyrics.song.name),
      serialize(lyrics),
    );

    this.cache.save();
  }

  getLyrics(key: string): Lyrics | null {
    return deserialize(Lyrics, this.cache.getKey(key));
  }
}
