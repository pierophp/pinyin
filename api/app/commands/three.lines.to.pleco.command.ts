import { readFile, writeFile } from 'fs-extra';
import { Arguments, CommandModule } from 'yargs';
import * as env from '../../env';

/**
 *
 * http://3lines.org/dictionaries/English-Pinyin.txt
 * http://3lines.org/dictionaries/Spanish-Pinyin.txt
 */
export class ThreeLinesToPlecoCommand implements CommandModule {
  public command = '3lines:pleco';
  public describe = '3 Lines to Pleco';

  public async handler(argv: Arguments) {
    let dirname = `${__dirname}/../../../storage/`;
    if (env.storage_path) {
      dirname = `${env.storage_path}/`;
    }

    const content = await readFile(dirname + '3Lines_Spanish-Pinyin.txt');

    const lines = content.toString().split('\n');

    let i = 0;

    let newContent = '';

    for (const line of lines) {
      i++;

      if (i === 1) {
        continue;
      }

      const fields = line.split('\t');

      if (!fields[1]) {
        continue;
      }

      const newLine = `${fields[1]}[${fields[0]}]\t${fields[2].replace(
        / /,
        '',
      )}\t${fields[3]
        .split('/')
        .filter(item => {
          return item !== '*';
        })
        .join(String.fromCharCode(60081))}\n`;

      newContent += newLine;
    }

    await writeFile(dirname + 'PlecoDictionary_3LinesES.txt', newContent);

    process.exit();
  }
}
