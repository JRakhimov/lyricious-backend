import { Router } from 'express';
import { lyricsController } from '../../controllers';

export const lyricsRouter = Router();

lyricsRouter.post('/', lyricsController.getLyrics);
