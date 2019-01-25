import { ensureDir, writeFile } from 'fs-extra';
import * as replaceall from 'replaceall';
import * as separatePinyinInSyllables from '../../../../shared/helpers/separate-pinyin-in-syllables';
import { CjkRepository } from '../../repository/cjk.repository';

export class DictionaryExport {
  async exportAll() {
    const result = await CjkRepository.findAllIdeograms();
    for (const entry of result) {
      await this.exportEntry(entry.ideogram_raw);
    }
  }

  async exportEntry(ideograms: string) {
    let dirname = `${__dirname}/../../../../chinese-dictionary/json/${ideograms.substring(
      0,
      1,
    )}`;

    console.log('Exporting ', ideograms);

    let response: any[] = [];

    await ensureDir(dirname);

    const entries = await CjkRepository.searchByIdeogramRaw(ideograms);
    for (const entry of entries) {
      response.push({
        ideograms: ideograms,
        pronunciation: separatePinyinInSyllables(entry.pronunciation).join(
          String.fromCharCode(160),
        ),
        pronunciation_taiwan: entry.pronunciation_taiwan
          ? separatePinyinInSyllables(entry.pronunciation_taiwan).join(
              String.fromCharCode(160),
            )
          : null,
        frequency: entries.frequency,
        usage: entries.usage,
        measure_words: entry.measure_words
          ? JSON.parse(entry.measure_words)
          : null,
        simplified: entry.simplified,
        traditional: entry.traditional,
        variants: entry.variants ? JSON.parse(entry.variants) : null,
        erhua: entry.erhua,
        hsk: entry.hsk,
        main: entry.main,
        classifications: entry.classifications,
        synonyms: entry.synonyms,
        antonyms: entry.antonyms,
        is_separable: entry.is_separable,
        definition_unihan: entry.definition_unihan,
        definition_cedict: entry.definition_cedict
          ? JSON.parse(entry.definition_cedict)
          : null,

        definition_pt: entry.definition_pt
          ? JSON.parse(entry.definition_pt)
          : null,
        definition_ct_pt: entry.definition_ct_pt
          ? JSON.parse(entry.definition_ct_pt).map(item => {
              return replaceall('~', entry.ideogram_raw, item);
            })
          : null,
        definition_ct_en: entry.definition_ct_en
          ? JSON.parse(entry.definition_ct_en)
          : null,
        definition_ct_es: entry.definition_ct_es
          ? JSON.parse(entry.definition_ct_es)
          : null,
        definition_glosbe_pt: entry.definition_glosbe_pt
          ? JSON.parse(entry.definition_glosbe_pt)
          : null,
        definition_glosbe_en: entry.definition_glosbe_en
          ? JSON.parse(entry.definition_glosbe_en)
          : null,
        definition_glosbe_es: entry.definition_glosbe_es
          ? JSON.parse(entry.definition_glosbe_es)
          : null,
      });
    }

    const filename = `${dirname}/${ideograms}.json`;

    await writeFile(filename, JSON.stringify(response, null, 2));
  }
}
