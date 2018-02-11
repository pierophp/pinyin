import { ElasticsearchStructureCommand } from './commands/elasticsearch.structure.command';
import { ElasticsearchSyncCommand } from './commands/elasticsearch.sync.command';
import { JwTrackCommand } from './commands/jw.track.command';
import { ChineseToolsUpdateCommand } from './commands/chinese.tools.update.command';
import { ChineseToolsInsertCommand } from './commands/chinese.tools.insert.command';

require('yargs')
  .usage('Usage: $0 <command> [options]')
  .command(new ElasticsearchSyncCommand())
  .command(new ElasticsearchStructureCommand())
  .command(new JwTrackCommand())
  .command(new ChineseToolsUpdateCommand())
  .command(new ChineseToolsInsertCommand())
  .demandCommand(1)
  .strict()
  .help('h')
  .alias('v', 'version').argv;
