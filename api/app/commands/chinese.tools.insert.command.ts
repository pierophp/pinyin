import { CommandModule } from 'yargs';

import { ElasticsearchProvider } from '../core/search/elasticsearch.provider';
import { CjkRepository } from '../repository/cjk.repository';
import * as UnihanSearch from '../services/UnihanSearch';
import * as ChineseToolsDownloader from '../services/ChineseToolsDownloader';

export class ChineseToolsInsertCommand implements CommandModule {
  public command = 'chinesetools:insert';
  public describe = 'Insert Chinese Tools';
  builder(yargs: any) {
    return yargs
        .option("l", {
            alias: "language",
            describe: "Language"
       })
  }

  public async handler(argv: any) {
    const language = argv.language;

    try {
      const cjks = await CjkRepository.findChineseToolsIsNull(language);
      for (const cjk of cjks) {
        const response = await ChineseToolsDownloader.download(UnihanSearch.convertUtf16ToIdeograms(cjk.ideogram), cjk.pronunciation, language);
        const saveOptions: any = {
          id: cjk.id,
        };
  
        saveOptions[`definition_ct_${language}`] = JSON.stringify(response);
  
        await CjkRepository.save(saveOptions);
      }
      process.exit();
    } catch (e) {
      console.log(e);
      process.exit();
    }
  }
}
