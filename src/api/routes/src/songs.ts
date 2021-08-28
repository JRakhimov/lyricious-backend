import { Router } from 'express';
import { songsController } from '../../controllers';

export const songsRouter = Router();

songsRouter.post('/search', songsController.searchSong);
