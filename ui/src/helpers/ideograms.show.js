import OptionsManager from 'src/domain/options-manager';
import separatePinyinInSyllables from 'src/helpers/separate-pinyin-in-syllables';
import extractPinyinTone from 'src/helpers/extract-pinyin-tone';
import specialIdeograms from '../../../shared/helpers/special-ideograms-chars';

export default function(params) {
  if (!params.pinyin && !params.character) {
    return [];
  }

  const printData = [];
  const options = OptionsManager.getOptions();
  const colors = {};
  colors[1] = options.color1;
  colors[2] = options.color2;
  colors[3] = options.color3;
  colors[4] = options.color4;
  colors[0] = options.color0;

  let pinyin = '';
  if (params.pinyin) {
    pinyin = separatePinyinInSyllables(params.pinyin, params.useSpaces);
  }

  if (options.ideogramColored === '0') {
    colors[1] = '#000000';
    colors[2] = '#000000';
    colors[3] = '#000000';
    colors[4] = '#000000';
    colors[0] = '#000000';
  }

  const chars = params.character.toString();
  const numberRegex = new RegExp('^[0-9]+$');
  let sameTone = true;
  let currentTone = null;
  for (let i = 0; i < chars.length; i += 1) {
    let ideogramClass = '';

    if (specialIdeograms.indexOf(chars[i]) > -1 || numberRegex.test(chars[i])) {
      ideogramClass = 'special-ideogram';
    }

    let tone = extractPinyinTone(pinyin[i]);
    if (chars[i] === '-') {
      tone = 0;
      ideogramClass = 'no-ideogram';
    }

    if (currentTone === null) {
      currentTone = tone;
    }

    if (currentTone !== tone) {
      sameTone = false;
    }

    printData.push({
      ideogramClass,
      toneColor: colors[tone] !== '#000000' ? `${colors[tone]} !important` : '',
      character: chars[i],
    });
  }

  if (chars.length === 0) {
    printData.push({
      character: '',
    });
  }

  for (let i = 0; i < printData.length; i++) {
    printData[i].sameTone = sameTone;
  }

  return printData;
}
