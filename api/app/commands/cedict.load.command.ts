import { Argv, CommandModule } from 'yargs';
import { CedictParser } from '../core/parser/cedict.parser';
export class CedictLoadCommand implements CommandModule {
  public command = 'cedict:load';
  public describe = 'CE Dict Load';

  public async handler(argv: Argv) {
    const cedictParser = new CedictParser();
    await cedictParser.parse();
    process.exit();
  }
}
