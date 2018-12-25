import { exec } from 'child-process-promise';
import * as uniqid from 'uniqid';
import { readFile, writeFile, remove, ensureDir } from 'fs-extra';

export class PdfParser {
  public async parse(link: string, lines: string[]): Promise<any> {
    const pdfPinyinFolder = `${__dirname}/../../../../../../../pdf-pinyin/`;
    const textFile = uniqid() + '.txt';
    const resultFile = `result.${textFile}.json`;

    await ensureDir(`${pdfPinyinFolder}data`);
    await writeFile(`${pdfPinyinFolder}data/${textFile}`, lines.join('\n'));

    const execCommmand = `node  ${pdfPinyinFolder}index.js ${link} ${textFile}`;

    await exec(execCommmand, {});

    const resultTxt = await readFile(`${pdfPinyinFolder}data/${resultFile}`);

    await remove(`${pdfPinyinFolder}data/${resultFile}`);
    await remove(`${pdfPinyinFolder}data/${textFile}`);

    let result = JSON.parse(resultTxt.toString());

    if (result) {
      result = result.map(item => {
        return item.map(item2 => {
          const returnItem: any = {
            c: item2.c.join(''),
            p: item2.p.join(String.fromCharCode(160)),
          };

          if (item2.isBold) {
            returnItem.isBold = 1;
          }

          if (item2.isItalic) {
            returnItem.isItalic = 1;
          }

          return returnItem;
        });
      });
      return result;
    }
  }
}
