import axios from 'axios';

export async function separateWords(text: string): Promise<string[]> {
  const jiebaBaseUrl =
    process.env.JIEBA_URL ?? 'https://pinyin-jieba.netlify.app';

  return (
    await axios.post(`${jiebaBaseUrl}/.netlify/functions/separateWords`, {
      text,
    })
  ).data.words;
}
