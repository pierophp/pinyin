export default function(pinyin) {
  if (pinyin === undefined) {
    return 0;
  }

  pinyin = pinyin.toLowerCase();

  const tones = {
    ā: 1,
    ē: 1,
    ī: 1,
    ō: 1,
    ū: 1,
    ǖ: 1,
    á: 2,
    é: 2,
    í: 2,
    ó: 2,
    ú: 2,
    ǘ: 2,
    ǎ: 3,
    ě: 3,
    ǐ: 3,
    ǒ: 3,
    ǔ: 3,
    ǚ: 3,
    à: 4,
    è: 4,
    ì: 4,
    ò: 4,
    ù: 4,
    ǜ: 4,
  };

  for (const letter of pinyin) {
    if (tones[letter]) {
      return tones[letter];
    }
  }

  return 0;
}
