import { CommandModule } from 'yargs';

import { ElasticsearchProvider } from '../core/search/elasticsearch.provider';
import { CjkRepository } from '../repository/cjk.repository';
import * as UnihanSearch from '../services/UnihanSearch';
import { GlosbeParser } from '../core/parser/glosbe.parser';

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
    let languages: any = { pt: 2, es: 5, en: 5 };
    if (argv.language) {
      languages = {};
      languages[argv.language] = 10;
    }

    const glosbeParser = new GlosbeParser();

    try {
      for (const language of languages) {
        console.log(
          '\n',
          new Date(),
          language,
          ' total: ',
          languages[language],
        );

        const cjks = await CjkRepository.findGlosbeIsNull(
          language,
          languages[language],
        );

        for (const cjk of cjks) {
          const ideogram = UnihanSearch.convertUtf16ToIdeograms(cjk.ideogram);
          console.log(ideogram);

          try {
            const response = await glosbeParser.parse(ideogram, language);

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
