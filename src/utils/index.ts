import * as admin from 'firebase-admin';
import { IocContext } from 'power-di';
import { SpotifyService } from '../services';
import { DB_URL, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from './env';
export { NeteaseUtils } from './src/netease_utils';
export { Logger } from './src/logger';

export const bootstrap = async () => {
  try {
    const serviceAccount = require('../../service-account.json');

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: DB_URL,
    });
  } catch (e) {
    throw new Error('service-account.json not found!');
  }

  const spotifyService = IocContext.DefaultInstance.get(SpotifyService);
  if (spotifyService.spotifyEnabled) await spotifyService.auth();
};
