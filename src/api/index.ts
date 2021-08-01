import * as express from 'express';
import * as bodyParser from 'body-parser';
import { lyricsRouter } from './routes';
import { PORT } from '../utils/env';
import { Logger } from '../utils';

export const ExpressApp = () => {
  const app = express();

  app.get('/', (_req, res) => res.sendStatus(200));

  app.use('/lyrics', bodyParser.json(), lyricsRouter);

  console.log('L14 PORT:', PORT);

  app.listen(PORT, () =>
    Logger.log('magenta', [`.::Magic happens at port ${PORT}::.`]),
  );
};
