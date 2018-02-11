import { Argv, CommandModule } from 'yargs';

import { ElasticsearchProvider } from '../core/search/elasticsearch.provider';
import { CjkRepository } from '../repository/cjk.repository';
import * as UnihanSearch from '../services/UnihanSearch';
import * as ChineseToolsDownloader from '../services/ChineseToolsDownloader';

export class ChineseToolsUpdateCommand implements CommandModule {
  public command = 'chinesetools:update';
  public describe = 'Update Chinese Tools';
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
      const cjks = await CjkRepository.findChineseToolsNotNull(language);
      for (const cjk of cjks) {
        const ideogram = UnihanSearch.convertUtf16ToIdeograms(cjk.ideogram);
        console.log(ideogram);
        
        try {
          const response = await ChineseToolsDownloader.download(ideogram, cjk.pronunciation, language);

          const saveOptions: any = {
            id: cjk.id,
          };
    
          saveOptions[`definition_ct_${language}`] = JSON.stringify(response);
    
          await CjkRepository.save(saveOptions);
        } catch (e) {
            console.log(e.message);
            continue;
        }
      }
      process.exit();
    } catch (e) {
      console.log(e);
      process.exit();
    }
  }
}
