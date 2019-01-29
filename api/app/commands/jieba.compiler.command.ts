import { readdir, readFile, stat, writeFile } from 'fs-extra';
import { join } from 'path';
import { Arguments, CommandModule } from 'yargs';
import { IdeogramsConverter } from '../core/converter/ideograms.converter';

export class JiebaCompilerCommand implements CommandModule {
  public command = 'jieba:compile';
  public describe = 'Jieba compiler';

  public async handler(argv: Arguments) {
    const compiledDir = `${__dirname.replace('dist/api/', '')}/../data/`;

    const files = await readdir(compiledDir + 'src');

    const ideogramsConverter = new IdeogramsConverter();

    let compiledSimplified = '';
    let compiledTraditional = '';

    for (const file of files) {
      if (file.substr(-6) === 'utf8.t') {
        continue;
      }

      const contentSimplified = (await readFile(join(compiledDir, 'src', file)))
        .toString()
        .trim();

      let contentTraditional = '';

      try {
        await stat(join(compiledDir, 'src', file + '.t'));

        contentTraditional = (await readFile(
          join(compiledDir, 'src', file + '.t'),
        ))
          .toString()
          .trim();
      } catch (e) {
        console.info(file + '.t', 'not found');
        const words = contentSimplified.split('\n');
        for (const word of words) {
          contentTraditional +=
            (await ideogramsConverter.simplifiedToTraditional(word)) + '\n';
        }
      }

      compiledSimplified += contentSimplified.trim() + '\n';
      compiledTraditional += contentTraditional.trim() + '\n';
    }

    await writeFile(
      join(compiledDir, 'compiled.utf8'),
      compiledSimplified + '\n' + compiledTraditional,
    );

    process.exit();
  }
}
