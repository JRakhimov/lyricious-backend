import { RequestHandler } from 'express';
import { LyricsService } from '../../../../services';
import { Song } from '../../../../entities';
import { serialize } from 'serializr';

export const getLyrics: RequestHandler = async (req, res) => {
  const name = req.body.name;
  const artist = req.body.artist;

  if (name == null || artist == null) {
    return res
      .status(200)
      .json({ status: false, message: "Params 'name', 'artist' are required" });
  }

  const lyrics = await LyricsService.getLyrics(new Song(name, [artist]));

  if (lyrics) {
    return res.status(200).json(serialize(lyrics));
  }

  return res.status(200).json({ status: false });
};
