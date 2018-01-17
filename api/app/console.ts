import { ElasticsearchStructureCommand } from './commands/elasticsearch.structure.command';
import { ElasticsearchSyncCommand } from './commands/elasticsearch.sync.command';

require('yargs')
  .usage('Usage: $0 <command> [options]')
  .command(new ElasticsearchSyncCommand())
  .command(new ElasticsearchStructureCommand())
  .demandCommand(1)
  .strict()
  .help('h')
  .alias('v', 'version').argv;
