import { CedictLoadCommand } from './commands/cedict.load.command';
import { ChineseToolsInsertCommand } from './commands/chinese.tools.insert.command';
import { ChineseToolsUpdateCommand } from './commands/chinese.tools.update.command';
import { ElasticsearchStructureCommand } from './commands/elasticsearch.structure.command';
import { ElasticsearchSyncCommand } from './commands/elasticsearch.sync.command';
import { GlosbeInsertCommand } from './commands/glosbe.insert.command';
import { IdeogramRawCommand } from './commands/ideogram.raw.command';
import { JwTrackCommand } from './commands/jw.track.command';
import { PlecoExportCommand } from './commands/pleco.export.command';

require('yargs')
  .usage('Usage: $0 <command> [options]')
  .command(new ElasticsearchSyncCommand())
  .command(new ElasticsearchStructureCommand())
  .command(new JwTrackCommand())
  .command(new ChineseToolsUpdateCommand())
  .command(new ChineseToolsInsertCommand())
  .command(new GlosbeInsertCommand())
  .command(new CedictLoadCommand())
  .command(new IdeogramRawCommand())
  .command(new PlecoExportCommand())
  .demandCommand(1)
  .strict()
  .help('h')
  .alias('v', 'version').argv;
