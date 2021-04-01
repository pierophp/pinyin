import extractPinyinTone from '../../helpers/extract-pinyin-tone';

export class V2FileConverter {
  public convert(lines: any, audio: any) {
    const converted: any = {
      version: '2',
      lines: [],
    };
    for (const line of lines) {
      const convertedLine: any = {
        blocks: [],
      };

      converted.lines.push(convertedLine);

      if (line[0]?.line.type) {
        convertedLine.type = line[0].line.type;
      }

      if (line[0]?.line.pinyin_source) {
        convertedLine.type = line[0].line.pinyin_source;
      }

      if (line[0]?.trans) {
        convertedLine.trans = line[0].trans;
      }

      if (audio) {
        converted.audio = audio;
      }

      for (const block of line) {
        const tones: any[] = [];

        const pinyins = block.p.split(String.fromCharCode(160));
        for (const pinyin of pinyins) {
          tones.push(extractPinyinTone(pinyin).toString());
        }

        convertedLine.blocks.push({
          c: block.c,
          p: block.p,
          h: block.h,
          t: tones,
          isBold: block.isBold,
          isItalic: block.isItalic,
        });
      }
    }

    return converted;
  }
}
