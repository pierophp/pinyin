import { Arguments, CommandModule } from 'yargs';
import { MoedictParser } from '../core/parser/moedict.parser';

export class MoedictLoadCommand implements CommandModule {
  public command = 'moedict:load';
  public describe = 'Moedict Load';

  public async handler(argv: Arguments) {
    const moedictParser = new MoedictParser();
    await moedictParser.parse();
    process.exit();
  }
}
