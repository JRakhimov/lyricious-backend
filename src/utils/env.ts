import appRoot from 'app-root-path';
import { config } from 'dotenv';

config({ path: `${appRoot}/.env` });

const mandatory = [];

for (const property of mandatory) {
  if (process.env[property] == null) {
    throw new Error(`Required env variable '${property}' is not defined!`);
  }
}

export const PORT = process.env.PORT || 3000;
export const FLAT_CACHE_ID = process.env.FLAT_CACHE_ID || 'lyrics_cache';
export const FLAT_CACHE_PATH =
  process.env.FLAT_CACHE_PATH || 'temp/lyrics_cache';
