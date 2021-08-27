import { object, serializable } from 'serializr';
import { Album } from './album';
import { Lyrics } from './lyrics';

export class Song {
  @serializable
  name: string;

  @serializable
  duration?: number;

  @serializable
  artist: string;

  @serializable(object(Album))
  album?: Album;

  @serializable(object(Lyrics))
  lyrics?: Lyrics;

  constructor(
    name: string,
    artist: string,
    duration?: number,
    album?: Album,
    lyrics?: Lyrics,
  ) {
    this.name = name;
    this.duration = duration;
    this.artist = artist;
    this.album = album;
    this.lyrics = lyrics;
  }
}
