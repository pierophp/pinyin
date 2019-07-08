import { Arguments, CommandModule } from 'yargs';
import { BibleImporter } from '../core/sites/jw/bible.importer';

export class JwBibleImportCommand implements CommandModule {
  public command = 'jw:bible-import';
  public describe = 'JW Bible Import';

  public async handler(argv: Arguments) {
    const bibleImporter = new BibleImporter();
    await bibleImporter.import();
    // const book = 18; // Salmos
    // const chapter = 102;

    // // PARTIAL
    // await bibleImporter.parseChapter(
    //   `/cmn-Hans/wol/b/r23/lp-chs/bi12/CHS/2001/${book +
    //     1}/${chapter}#study=discover`,
    //   book,
    //   String(chapter),
    // );

    process.exit();
  }
}
