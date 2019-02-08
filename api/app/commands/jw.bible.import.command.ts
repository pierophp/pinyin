import { Arguments, CommandModule } from 'yargs';

import { BibleImporter } from '../core/sites/jw/bible.importer';

export class JwBibleImportCommand implements CommandModule {
  public command = 'jw:bible-import';
  public describe = 'JW Bible Import';

  public async handler(argv: Arguments) {
    const bibleImporter = new BibleImporter();
    await bibleImporter.import();
    process.exit();
  }
}
