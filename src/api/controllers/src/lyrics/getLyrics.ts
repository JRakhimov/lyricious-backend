import { RequestHandler } from 'express';
import { LyricsService } from '../../../../services';
import { Song } from '../../../../entities';
import { serialize } from 'serializr';
import { Logger, NeteaseUtils } from '../../../../utils';

export const getLyrics: RequestHandler = async (req, res) => {
  const name = req.body.name;
  const artist = req.body.artist;
  const duration = req.body.duration;

  if (name == null || artist == null) {
    return res
      .status(200)
      .json({ status: false, message: "Params 'name', 'artist' are required" });
  }

  Logger.log('black', 'bgGreen', [
    `New request: ${[
      `Name: ${name}`,
      `Artist: ${artist}`,
      `Duration: ${duration}`,
    ].join(', ')}`,
  ]);

  Logger.time('Benchmark');

  const song = new Song(name, [artist], duration);
  const lyrics = await LyricsService.getLyrics(song);

  Logger.timeEnd('Benchmark', 'green');

  if (lyrics) {
    Logger.log('black', 'bgGreen', [`Found on ${lyrics.service}`]);

    song.lyrics = lyrics;

    return res.status(200).json({
      ...serialize(song),
      lyrics: {
        service: lyrics.service,
        withTimeCode: lyrics.withTimeCode,
        lines:
          lyrics.text.length === 0
            ? []
            : serialize(NeteaseUtils.parseLyrics(lyrics.text)),
      },
    });
  }

  return res.status(200).json({ status: false });
};
