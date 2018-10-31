import * as extractPinyinTone from './extract-pinyin-tone';

export function pinyinAccentsToNumbers(pinyin: string) {
  let tone = extractPinyinTone(pinyin);
  if (!tone) {
    tone = 5;
  }

  pinyin = pinyin.replace(/[āáǎà]/g, 'a');
  pinyin = pinyin.replace(/[ēéěè]/g, 'e');
  pinyin = pinyin.replace(/[īíǐì]/g, 'i');
  pinyin = pinyin.replace(/[ōóǒò]/g, 'o');
  pinyin = pinyin.replace(/[ūúǔù]/g, 'u');
  pinyin = pinyin.replace(/[ǖǘǚǜ]/g, 'ü');

  return `${pinyin}${tone}`;
}
