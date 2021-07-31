import { Database, aql } from 'arangojs';
import { injectable } from 'power-di';
import { Song } from '../../entities';
import { deserialize, serialize } from 'serializr';

@injectable()
export class DatabaseService {
  db: Database;

  constructor() {
    this.db = new Database({
      databaseName: 'Lyricious',
      auth: {
        username: 'root',
        password: 'root',
      },
    });
  }

  async getSongs(name: string, artists: string[]): Promise<Song | null> {
    const songs = await this.db.query(aql`
      for song in songsView
        filter like(song.name, ${name}, true)
        filter count(intersection(song.artists, ${artists})) > 0
        return song
    `);

    const allSongs = await songs.all();

    if (allSongs.length > 0) {
      return deserialize(Song, allSongs[0]);
    }
  }

  async insertSong(song: Song) {
    await this.db.query(aql`insert ${serialize(song)} into songs`);
  }
}
