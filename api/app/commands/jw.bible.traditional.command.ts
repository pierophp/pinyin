import { Arguments, CommandModule } from 'yargs';
import { BibleImporter } from '../core/sites/jw/bible.importer';

export class JwBibleTraditionalCommand implements CommandModule {
  public command = 'jw:bible-traditional';
  public describe = 'JW Bible Traditional';

  public async handler(argv: Arguments) {
    const bibleImporter = new BibleImporter();
    await bibleImporter.getTraditionalBible();
    process.exit();
  }
}
