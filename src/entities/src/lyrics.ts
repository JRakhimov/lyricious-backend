import { Song } from '../';
import { serializable, object } from 'serializr';

export class Lyrics {
  @serializable
  service: string;
  @serializable
  url: string;
  @serializable
  content: string;
  @serializable(object(Song))
  song: Song;

  constructor(service: string, url: string, content: string, song: Song) {
    this.service = service;
    this.url = url;
    this.content = content;
    this.song = song;
  }
}
