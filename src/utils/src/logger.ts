import * as chalk from 'chalk';
import { isArray } from 'util';

export class Logger {
  private static _timerMap: Record<string, number> = {};

  static time(name: string) {
    if (Logger._timerMap[name] != null) {
      throw new Error(`Timer with name ${name} already exists`);
    }

    Logger._timerMap[name] = Date.now();
  }

  static timeEnd(name: string, color?: typeof chalk.ForegroundColor) {
    console.log(
      chalk[color](`${name}: ${(Date.now() - Logger._timerMap[name]) / 1000}s`),
    );

    delete Logger._timerMap[name];
  }

  //@ts-ignore
  static log(
    foregroundColor: typeof chalk.ForegroundColor,
    objects: any[],
  ): void;

  static log(
    foregroundColor: typeof chalk.ForegroundColor,
    backgroundColor: typeof chalk.BackgroundColor,
    objects: any[],
  ): void;

  static log(objects: any[]) {
    if (Array.isArray(arguments[0])) {
      console.log(...objects);
      return;
    }

    if (
      typeof arguments[0] === 'string' &&
      typeof arguments[1] === 'string' &&
      arguments[2] != null
    ) {
      console.log(chalk[arguments[0]][arguments[1]](...arguments[2]));
      return;
    }

    if (typeof arguments[0] === 'string' && arguments[1] != null) {
      console.log(chalk[arguments[0]](...arguments[1]));
      return;
    }
  }
}
