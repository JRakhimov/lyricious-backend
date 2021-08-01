import * as appRoot from 'app-root-path';
import { config } from 'dotenv';

config({ path: `${appRoot.path}/.env` });

const mandatory = ['DB_NAME', 'DB_USER', 'DB_PASSWORD'];

for (const property of mandatory) {
  if (process.env[property] == null) {
    throw new Error(`Required env variable '${property}' is not defined!`);
  }
}

export const PORT = process.env.PORT || 4000;
export const DB_URL = process.env.DB_URL || 'http://localhost:8529';
export const DB_NAME = process.env.DB_URL!;
export const DB_USER = process.env.DB_USER!;
export const DB_PASSWORD = process.env.DB_PASSWORD!;
