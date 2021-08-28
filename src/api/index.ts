import * as express from 'express';
import { lyricsRouter } from './routes';
import { PORT } from '../utils/env';
import { Logger } from '../utils';
import * as path from 'path';
import { SpotifyService } from '../services';
import { IocContext } from 'power-di';
import { songsRouter } from './routes/src/songs';

export const ExpressApp = () => {
  const app = express();

  app.get('/', (_req, res) => res.sendStatus(200));

  app.use(express.json());

  app.get('/ios-auth', (_req, res) =>
    res.sendFile(path.join(__dirname, './views/spotify_ios_oauth.html')),
  );

  app.use('/lyrics', lyricsRouter);
  app.use('/songs', songsRouter);

  app.listen(PORT, () =>
    Logger.log('magenta', [`.::Magic happens at port ${PORT}::.`]),
  );
};
