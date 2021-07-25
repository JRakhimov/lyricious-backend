import * as express from 'express';
import * as bodyParser from 'body-parser';
import { lyricsRouter } from './routes';
import { PORT } from '../utils/env';

export const ExpressApp = () => {
  const app = express();

  app.get('/', (_req, res) => res.sendStatus(200));

  app.use('/lyrics', bodyParser.json(), lyricsRouter);

  app.listen(PORT, () =>
    console.log(`.::Magic happens at port ${process.env.PORT || 3000}::.`),
  );
};
