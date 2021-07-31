import { serializable } from "serializr";

export class Album {
  @serializable
  name: string;

  @serializable
  image?: string;
}
