import { CommandModule } from 'yargs';

import { ElasticsearchProvider } from '../core/search/elasticsearch.provider';
import { CjkRepository } from '../repository/cjk.repository';
import * as UnihanSearch from '../services/UnihanSearch';
import * as GlosbeDownloader from '../services/GlosbeDownloader';

export class GlosbeInsertCommand implements CommandModule {
  public command = 'glosbe:insert';
  public describe = 'Insert Glosbe';
  builder(yargs: any) {
    return yargs.option('l', {
      alias: 'language',
      describe: 'Language',
    });
  }

  public async handler(argv: any) {
    let languages = ['pt', 'es', 'en'];
    if (argv.language) {
      languages = [argv.language];
    }

    try {
      for (const language of languages) {
        console.log('\n', new Date(), language);
        const cjks = await CjkRepository.findGlosbeIsNull(language);
        for (const cjk of cjks) {
          const ideogram = UnihanSearch.convertUtf16ToIdeograms(cjk.ideogram);
          console.log(ideogram);

          try {
            const response = await GlosbeDownloader.download(
              ideogram,
              language,
            );

            const saveOptions: any = {
              id: cjk.id,
            };

            saveOptions[`definition_glosbe_${language}`] = JSON.stringify(
              response,
            );

            await CjkRepository.save(saveOptions);
          } catch (e) {
            console.log(e.message);
            continue;
          }

          // AWAIT 5 seconds
          await new Promise(resolve => {
            setTimeout(resolve, 5000);
          });
        }
      }
      process.exit();
    } catch (e) {
      console.log(e);
      process.exit();
    }
  }
}
