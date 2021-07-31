import { Line } from '../../entities';
import { lyric, search } from 'NeteaseCloudMusicApi';

export type Lyric = Line[] | null;

export interface NArtist {
  name: string;
  alias: string[];
  transNames?: string[];
}

export interface NAlbum {
  name: string;
}

export interface NSong {
  id: number;
  name: string;
  artists: NArtist[];
  album: NAlbum;
  duration?: number; // ms
}

export class NeteaseService {
  static async fetchSongList(s: string): Promise<NSong[]> {
    const { body } = await search({ keywords: s, type: 1, limit: 100 });

    return (body as any)?.result?.songs || [];
  }

  static async fetchLyric(songId: number): Promise<string> {
    const { body } = await lyric({ id: songId });

    return (body as any).lrc?.lyric || '';
  }
}
