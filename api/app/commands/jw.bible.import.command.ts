import { Arguments, CommandModule } from 'yargs';
import { BibleImporter } from '../core/sites/jw/bible.importer';

export class JwBibleImportCommand implements CommandModule {
  public command = 'jw:bible-import';
  public describe = 'JW Bible Import';

  public async handler(argv: Arguments) {
    const bibleImporter = new BibleImporter();
    await bibleImporter.import();

    // PARTIAL
    // await bibleImporter.parseChapter(
    //   '/cmn-Hans/wol/b/r23/lp-chs-rb/bi12/CHS/2001/1/15#study=discover',
    //   0, // Genesis
    //   '15', // Chapter
    // );

    process.exit();
  }
}
