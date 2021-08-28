import { injectable } from 'power-di';
import { deserialize } from 'serializr';
// @ts-ignore
import * as SpotifyWebApi from 'spotify-web-api-node';
import { Logger } from '../../utils';
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from '../../utils/env';
import { Song } from '../../entities';

@injectable()
export class SpotifyService {
  spotifyClient: SpotifyWebApi;
  spotifyEnabled: boolean;

  constructor() {
    this.spotifyEnabled =
      SPOTIFY_CLIENT_ID != null && SPOTIFY_CLIENT_SECRET != null;

    if (this.spotifyEnabled) {
      this.spotifyEnabled = true;

      this.spotifyClient = new SpotifyWebApi({
        clientId: SPOTIFY_CLIENT_ID,
        clientSecret: SPOTIFY_CLIENT_SECRET,
      });
    }
  }

  async auth() {
    return this.spotifyClient.clientCredentialsGrant().then((data) => {
      Logger.log('blue', ['.::Spotify connected::.']);

      this.spotifyClient.setAccessToken(data.body.access_token);
    });
  }

  async search(query: string): Promise<Song[]> {
    const { body } = await this.spotifyClient.search(query, ['track']);

    const tracksResponse = body.tracks.items;
    const response = tracksResponse
      .map((track) => ({
        spotifyId: track.id,
        name: track.name,
        duration: track.duration_ms,
        artist: track.artists[0].name,
        album: {
          name: track.album.name,
          image: track.album.images[0].url,
        },
      }))
      .map((track) => deserialize(Song, track));

    return response;
  }
}
