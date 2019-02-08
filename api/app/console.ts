import { upperFirst, camelCase } from 'lodash';

const filter = '';

const commandsPath = [
  'cedict.load.command',
  'chinese.tools.insert.command',
  'chinese.tools.update.command',
  'dictionary.export.command',
  'elasticsearch.structure.command',
  'elasticsearch.sync.command',
  'glosbe.insert.command',
  'ideogram.raw.command',
  'jieba.compiler.command',
  'jw.bible.import.command',
  'jw.bible.traditional.command',
  'jw.track.command',
  'memrise.to.inkstone.command',
  'pleco.export.command',
  'three.lines.load.command',
  'three.lines.to.pleco.command',
  'jw.songs.command',
];

const yargs = require('yargs').usage('Usage: $0 <command> [options]');

(async function init() {
  for (const commandPath of commandsPath) {
    const className = upperFirst(camelCase(commandPath.replace(/\./g, '-')));

    if (
      process.env.NODE_ENV !== 'production' &&
      filter &&
      `${filter}.command` !== commandPath
    ) {
      continue;
    }

    const classInterface = (await import(`./commands/${commandPath}`))[
      className
    ];

    const commandObject = new classInterface();
    try {
      yargs.command(commandObject);
    } catch (e) {
      console.log('ERROR ON COMMAND');
      console.log(e);
    }
  }

  yargs
    .demandCommand(1)
    .strict()
    .help('h')
    .alias('v', 'version').argv;
})();
