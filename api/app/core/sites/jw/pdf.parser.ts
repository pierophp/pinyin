import * as pinyinParser from '../../../../../pdf-pinyin/src/core/pinyin.parser';

export class PdfParser {
  public async parse(
    pdfParsedObjectPromise: Promise<any>,
    lines: string[],
  ): Promise<any> {
    const pdfParsedObject: any = await pdfParsedObjectPromise;

    // @ts-ignore
    let result = await pinyinParser(pdfParsedObject, lines);

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
