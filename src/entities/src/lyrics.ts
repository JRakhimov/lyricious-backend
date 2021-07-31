import { serializable } from 'serializr';

export class Lyrics {
  @serializable
  service: string;

  @serializable
  text: string;

  @serializable
  withTimeCode: boolean;

  static withTimeCodeCheck(text: string) {
    return /(\[.*?\])/g.test(text);
  }

  constructor(service: string, text: string, withTimeCode: boolean) {
    this.withTimeCode = withTimeCode;
    this.service = service;
    this.text = text;
  }
}
