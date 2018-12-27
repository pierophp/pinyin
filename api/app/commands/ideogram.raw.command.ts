import { Argv, CommandModule } from 'yargs';

import { CjkRepository } from '../repository/cjk.repository';
// @ts-ignore
import * as UnihanSearch from '../services/UnihanSearch';

export class IdeogramRawCommand implements CommandModule {
  public command = 'ideogram:raw';
  public describe = 'Generate ideogram raw';

  public async handler(argv: Argv) {
    const cjks = await CjkRepository.findIdeogramRawIsNull();
    for (const cjk of cjks) {
      console.log(cjk.id);

      const ideogramConverted = UnihanSearch.convertUtf16ToIdeograms(
        cjk.ideogram,
      );
      cjk.ideogram_raw = ideogramConverted;
      await CjkRepository.save(cjk);
    }

    process.exit();
  }
}
