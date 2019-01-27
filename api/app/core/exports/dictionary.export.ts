import * as bluebird from 'bluebird';
import { ensureDir, unlink, writeFile } from 'fs-extra';
import * as replaceall from 'replaceall';
import * as separatePinyinInSyllables from '../../../../shared/helpers/separate-pinyin-in-syllables';
import { CjkRepository } from '../../repository/cjk.repository';

export class DictionaryExport {
  async exportAll() {
    const result = await CjkRepository.findAllIdeograms();

    await bluebird.map(
      result,
      async (entry: any) => {
        await this.exportEntry(entry.ideogram_raw);
      },
      {
        concurrency: 10,
      },
    );
  }

  async exportEntry(ideograms: string) {
    const firstIdeogram = ideograms.substring(0, 1);

    const parentFolder = firstIdeogram
      .charCodeAt(0)
      .toString()
      .substr(0, 3)
      .padStart(3, '0');

    let dirname = `${__dirname}/../../../../chinese-dictionary/dict/${parentFolder}/${firstIdeogram}`;

    const filename = `${dirname}/${ideograms}.json`;

    if (ideograms.indexOf('?') !== -1 || ideograms.indexOf('%') !== -1) {
      console.log('Invalid format ', ideograms);
      try {
        await unlink(filename);
      } catch (e) {}
      return;
    }

    let response: any[] = [];

    await ensureDir(dirname);

    const entries = await CjkRepository.searchByIdeogramRaw(ideograms);
    for (let entry of entries) {
      const originalEntry = entry;

      if (entry.type === 'C' && entry.frequency === 999) {
        continue;
      }

      if (!entry.simplified && !entry.traditional_exclusive) {
        const variants = JSON.parse(entry.variants);
        if (variants && variants.length) {
          const entriesSimplified = await CjkRepository.searchByIdeogramRawAndPronunciation(
            variants[0],
            entry.pronunciation,
          );

          if (entriesSimplified.length) {
            entry = entriesSimplified[0];
          }
        } else {
          console.log('Simplified form not found for ', ideograms);
        }
      }

      const tags: string[] = [];

      if (entry.hsk && entry.hsk < 999) {
        tags.push(`HSK ${entry.hsk}`);
      }

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
        measure_words: originalEntry.measure_words
          ? JSON.parse(originalEntry.measure_words)
          : null,
        simplified: entry.simplified,
        traditional: entry.traditional,
        variants: originalEntry.variants
          ? JSON.parse(originalEntry.variants)
          : null,
        erhua: entry.erhua,
        hsk: entry.hsk,
        main: entry.main,
        classifications: entry.classifications,
        synonyms: entry.synonyms,
        antonyms: entry.antonyms,
        is_separable: entry.is_separable,
        tags,
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

    await writeFile(filename, JSON.stringify(response, null, 2));
  }
}
