import { Argv, CommandModule } from 'yargs';

import * as JWDownloader from '../services/JWDownloader';

export class JwBibleTraditionalCommand implements CommandModule {
  public command = 'jw:bible-traditional';
  public describe = 'JW Bible Traditional';

  public async handler(argv: Argv) {
    await JWDownloader.getTraditionalBible();
    process.exit();
  }
}
