import { CommandModule } from 'yargs';

import { ElasticsearchProvider } from '../core/search/elasticsearch.provider';
import { CjkRepository } from '../repository/cjk.repository';
import * as UnihanSearch from '../services/UnihanSearch';
import * as ChineseToolsDownloader from '../services/ChineseToolsDownloader';

export class ChineseToolsInsertCommand implements CommandModule {
  public command = 'chinesetools:insert';
  public describe = 'Insert Chinese Tools';
  builder(yargs: any) {
    return yargs.option('l', {
      alias: 'language',
      describe: 'Language',
    });
  }

  public async handler(argv: any) {
    let languages = ['pt', 'en', 'es'];
    if (argv.language) {
      languages = [argv.language];
    }

    try {
      for (const language of languages) {
        console.log('\n', new Date(), language);
        const cjks = await CjkRepository.findChineseToolsIsNull(language);
        for (const cjk of cjks) {
          const ideogram = UnihanSearch.convertUtf16ToIdeograms(cjk.ideogram);
          console.log(ideogram);

          try {
            const response = await ChineseToolsDownloader.download(
              ideogram,
              cjk.pronunciation,
              language,
            );

            const saveOptions: any = {
              id: cjk.id,
            };

            saveOptions[`definition_ct_${language}`] = JSON.stringify(response);

            await CjkRepository.save(saveOptions);
          } catch (e) {
            console.log(e.message);
            continue;
          }

          // AWAIT 15 seconds
          await new Promise(resolve => {
            setTimeout(resolve, 15000);
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
