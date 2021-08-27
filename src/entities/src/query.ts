import { serializable } from 'serializr';

export class LyricsQuery {
  @serializable
  name: string;

  @serializable
  artist: string;

  constructor(name: string, artist: string) {
    this.name = name;
    this.artist = artist;
  }
}
