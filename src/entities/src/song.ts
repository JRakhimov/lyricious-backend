import { serializable } from 'serializr';

export class Song {
  @serializable
  name: string;
  @serializable
  artist: string;
  @serializable
  album?: string;
  @serializable
  albumUrl?: string;

  constructor(name: string, artist: string, album?: string, albumUrl?: string) {
    this.name = name;
    this.artist = artist;
    this.album = album;
    this.albumUrl = albumUrl;
  }
}
