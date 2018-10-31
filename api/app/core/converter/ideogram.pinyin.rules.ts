const numbers = [
  '一',
  '两',
  '兩',
  '三',
  '四',
  '五',
  '六',
  '七',
  '八',
  '九',
  '十',
  '百',
  '千',
  '万',
  '萬',
  '亿',
  '億',
];

const rules = {
  之: {
    地: 'dì',
  },
};

for (const number of numbers) {
  rules[number] = {
    只: 'zhī',
    隻: 'zhī',
  };
}

export default rules;
