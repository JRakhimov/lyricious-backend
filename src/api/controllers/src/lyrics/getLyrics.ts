import { RequestHandler } from 'express';
import { LyricsService } from '../../../../services';
import { Song } from '../../../../entities';
import { serialize } from 'serializr';
import { NeteaseUtils } from '../../../../utils';

export const getLyrics: RequestHandler = async (req, res) => {
  const name = req.body.name;
  const artist = req.body.artist;

  if (name == null || artist == null) {
    return res
      .status(200)
      .json({ status: false, message: "Params 'name', 'artist' are required" });
  }

  const song = new Song(name, [artist]);
  const lyrics = await LyricsService.getLyrics(song);

  if (lyrics) {
    song.lyrics = lyrics;

    return res.status(200).json({
      ...serialize(song),
      lyrics: {
        service: lyrics.service,
        withTimeCode: lyrics.withTimeCode,
        lines: serialize(NeteaseUtils.parseLyrics(lyrics.text)),
      },
    });
  }

  return res.status(200).json({ status: false });
};
