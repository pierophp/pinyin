import { CommandModule } from 'yargs';

import { ElasticsearchProvider } from '../core/search/elasticsearch.provider';
import { CjkRepository } from '../repository/cjk.repository';
import * as UnihanSearch from '../services/UnihanSearch';
import { ChineseToolsParser } from '../core/parser/chinese.tools.parser';

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
    let languages: any = { pt: 4, es: 9, en: 9 };
    if (argv.language) {
      languages = {};
      languages[argv.language] = 20;
    }

    const chineseToolsParser = new ChineseToolsParser();

    try {
      for (const language of Object.keys(languages)) {
        console.log(
          '\n',
          new Date(),
          language,
          ' total: ',
          languages[language],
        );

        const cjks = await CjkRepository.findChineseToolsIsNull(
          language,
          languages[language],
        );

        for (const cjk of cjks) {
          const ideogram = UnihanSearch.convertUtf16ToIdeograms(cjk.ideogram);
          console.log(ideogram);

          try {
            const response = await chineseToolsParser.parse(
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
