import * as appRoot from 'app-root-path';
import { config } from 'dotenv';

config({ path: `${appRoot.path}/.env` });

const mandatory = ['DB_URL'];

for (const property of mandatory) {
  if (process.env[property] == null) {
    throw new Error(`Required env variable '${property}' is not defined!`);
  }
}

export const PORT = process.env.PORT || 4000;
export const DB_URL = process.env.DB_URL!;
