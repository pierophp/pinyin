import { Argv, CommandModule, Arguments } from 'yargs';
import { IdeogramsConverter } from '../core/converter/ideograms.converter';
import { CjkRepository } from '../repository/cjk.repository';

const ideogramsConverter = new IdeogramsConverter();
export class IdeogramRawCommand implements CommandModule {
  public command = 'ideogram:raw';
  public describe = 'Generate ideogram raw';

  public async handler(argv: Arguments) {
    const cjks = await CjkRepository.findIdeogramRawIsNull();
    for (const cjk of cjks) {
      console.log(cjk.id);

      const ideogramConverted = ideogramsConverter.convertUtf16ToIdeograms(
        cjk.ideogram,
      );
      cjk.ideogram_raw = ideogramConverted;
      await CjkRepository.save(cjk);
    }

    process.exit();
  }
}
