import { Arguments, CommandModule } from 'yargs';
import { DictionaryExport } from '../core/exports/dictionary.export';

export class DictionaryExportCommand implements CommandModule {
  public command = 'dictionary:export';
  public describe = 'Dictionary Export';

  public async handler(argv: Arguments) {
    const dictionaryExport = new DictionaryExport();

    console.info('Start export');
    await dictionaryExport.exportAll();
    console.info('End export');

    process.exit();
  }
}
