export default function(pinyin) {
  if (pinyin === undefined) {
    return 0;
  }

  pinyin = pinyin.toLowerCase();

  const tones = [
    {
      tone: 1,
      letters: ['ā', 'ē', 'ī', 'ō', 'ū', 'ǖ'],
    },
    {
      tone: 2,
      letters: ['á', 'é', 'í', 'ó', 'ú', 'ǘ'],
    },
    {
      tone: 3,
      letters: ['ǎ', 'ě', 'ǐ', 'ǒ', 'ǔ', 'ǚ'],
    },
    {
      tone: 4,
      letters: ['à', 'è', 'ì', 'ò', 'ù', 'ǜ'],
    },
  ];

  for (const tone of tones) {
    for (const letter of tone.letters) {
      if (pinyin.indexOf(letter) > -1) {
        return tone.tone;
      }
    }
  }

  return 0;
}
