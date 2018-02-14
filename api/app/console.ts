import { ElasticsearchStructureCommand } from './commands/elasticsearch.structure.command';
import { ElasticsearchSyncCommand } from './commands/elasticsearch.sync.command';
import { JwTrackCommand } from './commands/jw.track.command';
import { ChineseToolsUpdateCommand } from './commands/chinese.tools.update.command';
import { ChineseToolsInsertCommand } from './commands/chinese.tools.insert.command';
import { GlosbeInsertCommand } from './commands/glosbe.insert.command';

require('yargs')
  .usage('Usage: $0 <command> [options]')
  .command(new ElasticsearchSyncCommand())
  .command(new ElasticsearchStructureCommand())
  .command(new JwTrackCommand())
  .command(new ChineseToolsUpdateCommand())
  .command(new ChineseToolsInsertCommand())
  .command(new GlosbeInsertCommand())
  .demandCommand(1)
  .strict()
  .help('h')
  .alias('v', 'version').argv;
