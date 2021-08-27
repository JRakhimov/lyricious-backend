import * as admin from 'firebase-admin';
import { DB_URL } from './env';
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
};
