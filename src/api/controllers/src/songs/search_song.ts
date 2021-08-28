import { RequestHandler } from 'express';
import { IocContext } from 'power-di';
import { Logger } from '../../../../utils';
import { SpotifyService } from '../../../../services';

export const searchSong: RequestHandler = async (req, res) => {
  const spotifyService = IocContext.DefaultInstance.get(SpotifyService);

  if (!spotifyService.spotifyEnabled) {
    return res.json({ status: false, message: 'Search service is disabled' });
  }

  const { query } = req.body;

  if (query == null) {
    return res.json({ status: false, message: "Param 'query' are required" });
  }

  Logger.log('black', 'bgGreen', [
    `New search request: ${[`Query: ${query}`].join(', ')}`,
  ]);

  Logger.time('Search Benchmark');

  res.json(await spotifyService.search(query));

  Logger.timeEnd('Search Benchmark', 'green');
};
