import { exec } from 'child_process';
import { remove as removeDiacritics } from 'diacritics';
import { writeFile } from 'fs-extra';

import * as separatePinyinInSyllables from '../../../../shared/helpers/separate-pinyin-in-syllables';
import * as env from '../../../env';
import * as extractPinyinTone from '../../helpers/extract-pinyin-tone';
import { CjkRepository } from '../../repository/cjk.repository';
import { IdeogramsConverter } from '../converter/ideograms.converter';

export class PlecoExport {
  async export() {
    let dirname = `${__dirname}/../../../storage/`;
    if (env.storage_path) {
      dirname = `${env.storage_path}/`;
    }

    const ideogramsConverter = new IdeogramsConverter();

    const result = await CjkRepository.findPtNotNull();
    let resultFile: string = '';

    for (const entry of result) {
      let definition = JSON.parse(entry.definition_pt);
      definition = definition.join(String.fromCharCode(60081));
      const pinyin = separatePinyinInSyllables(entry.pronunciation);
      let pinyinTones = '';
      pinyin.forEach(syllable => {
        let tone = extractPinyinTone(syllable);
        if (tone === 0) {
          tone = 5;
        }
        pinyinTones += `${removeDiacritics(syllable)}${tone}`;
      });

      const ideograms = ideogramsConverter.convertUtf16ToIdeograms(
        entry.ideogram,
      );
      const line = `${ideograms}\t${pinyinTones}\t${definition}\n`;
      resultFile += line;
    }

    resultFile = resultFile.trim();

    // eslint-disable-next-line
    const filenamePleco = `${dirname}PlecoDictionaryUTf8.txt`;
    const filenamePlecoUTF16 = `${dirname}Dicionario_Pleco.txt`;
    
    await writeFile(filenamePleco, resultFile);

    exec(`iconv -f UTF-8 -t UTF-16LE ${filenamePleco} > ${filenamePlecoUTF16}`);
  }
}
