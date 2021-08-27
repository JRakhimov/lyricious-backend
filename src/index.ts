import './utils/env';

import { ExpressApp } from './api';
import { bootstrap } from './utils';

const main = async () => {
  await bootstrap();
  ExpressApp();
};

main();
