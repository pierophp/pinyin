export async function separateWords(text: string): Promise<string[]> {
  // const jiebaBaseUrl =
  //   process.env.JIEBA_URL ?? 'https://pinyin-jieba.netlify.app';

  const jiebaBaseUrl = 'https://pinyin-jieba.netlify.app';

  const response = await (
    await fetch(`${jiebaBaseUrl}/.netlify/functions/separateWords`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
      }),
    })
  ).json();

  return response.words;
}
