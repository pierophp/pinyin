import * as pinyinParser from '../../../../../pdf-pinyin/src/core/pinyin.parser';
import * as isChinese from '../../../../../shared/helpers/is-chinese';

export class PdfParser {
  public async parse(
    pdfParsedObjectPromise: Promise<any>,
    lines: string[],
  ): Promise<any> {
    const pdfParsedObject: any = await pdfParsedObjectPromise;

    // @ts-ignore
    let result = await pinyinParser(pdfParsedObject, lines);

    let bible: any = null;

    if (result) {
      result = result.lines.map(item => {
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

          let indexOfBible = -1;

          if (item2.tagsStart) {
            indexOfBible = item2.tagsStart.indexOf('<bible');
          }

          if (indexOfBible >= 0) {
            bible = item2.tagsStart.match(/\<bible text="(.*?)"\>/);
          }

          if (bible && bible[1] && !isChinese(returnItem.c, true)) {
            returnItem.b = bible[1];
            bible = null;
          }

          let indexOfFootnote = -1;

          if (item2.tagsStart) {
            indexOfFootnote = item2.tagsStart.indexOf('<footnote');
          }

          if (indexOfFootnote >= 0) {
            const footnote = item2.tagsStart.match(/\<footnote id="(.*?)"\>/);

            returnItem.footnote = footnote[1];
          }

          return returnItem;
        });
      });

      return result;
    }
  }
}
