import { CedictLoadCommand } from './commands/cedict.load.command';
import { ChineseToolsInsertCommand } from './commands/chinese.tools.insert.command';
import { ChineseToolsUpdateCommand } from './commands/chinese.tools.update.command';
import { ElasticsearchStructureCommand } from './commands/elasticsearch.structure.command';
import { ElasticsearchSyncCommand } from './commands/elasticsearch.sync.command';
import { GlosbeInsertCommand } from './commands/glosbe.insert.command';
import { IdeogramRawCommand } from './commands/ideogram.raw.command';
import { JiebaCompilerCommand } from './commands/jieba.compiler.command';
import { JwBibleTraditionalCommand } from './commands/jw.bible.traditional.command';
import { JwTrackCommand } from './commands/jw.track.command';
import { PlecoExportCommand } from './commands/pleco.export.command';
import { MemriseToInkstoneCommand } from './commands/memrise.to.inkstone.command';

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
  .command(new JiebaCompilerCommand())
  .command(new JwBibleTraditionalCommand())
  .command(new MemriseToInkstoneCommand())
  .demandCommand(1)
  .strict()
  .help('h')
  .alias('v', 'version').argv;
