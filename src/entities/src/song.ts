import { list, object, primitive, serializable } from 'serializr';
import { Album } from './album';
import { Lyrics } from './lyrics';

export class Song {
  @serializable
  name: string;

  @serializable
  duration?: number;

  @serializable(list(primitive()))
  artists: string[];

  @serializable(object(Album))
  album?: Album;

  @serializable(object(Lyrics))
  lyrics?: Lyrics;

  constructor(
    name: string,
    artists: string[],
    duration?: number,
    album?: Album,
    lyrics?: Lyrics,
  ) {
    this.name = name;
    this.duration = duration;
    this.artists = artists;
    this.album = album;
    this.lyrics = lyrics;
  }
}
