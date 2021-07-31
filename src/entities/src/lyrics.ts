import { serializable } from 'serializr';

export class Lyrics {
  @serializable
  service: string;
  @serializable
  text: string;

  constructor(service: string, text: string) {
    this.service = service;
    this.text = text;
  }
}
