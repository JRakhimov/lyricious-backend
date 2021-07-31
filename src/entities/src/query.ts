import { serializable } from "serializr";

export class LyricsQuery {
  @serializable
  name: string;

  @serializable
  artists: string;

  constructor(name: string, artists: string) {
    this.name = name;
    this.artists = artists;
  }
}
