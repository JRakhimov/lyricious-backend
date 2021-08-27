import { injectable } from 'power-di';
import { Song } from '../../entities';
import * as admin from 'firebase-admin';
import { deserialize, serialize } from 'serializr';
const CyrillicToTranslit = require('cyrillic-to-translit-js');

@injectable()
export class DatabaseService {
  db: admin.database.Database;
  translit: typeof CyrillicToTranslit;

  constructor() {
    this.db = admin.database();
    this.translit = new CyrillicToTranslit({ preset: 'ru' });
  }

  private _genPath(songName: string, artist: string): string {
    return this.translit.transform(`songs/${songName}_${artist}`);
  }

  async getSongs(songName: string, artist: string): Promise<Song | null> {
    const song = await this.db
      .ref(this._genPath(songName, artist))
      .once('value')
      .then((x) => x.val());

    if (song) return deserialize(Song, song);
  }

  async insertSong(song: Song) {
    await this.db
      .ref(this._genPath(song.name, song.artist))
      .set(JSON.parse(JSON.stringify(song)));
  }
}
