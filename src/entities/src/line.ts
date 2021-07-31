import { serializable } from "serializr";

export class Line {
  @serializable
  startTime?: number;

  @serializable
  text: string;

  constructor(text: string, starTime?: number) {
    this.startTime = starTime;
    this.text = text;
  }
}
