// @todo remove this
function replaceall(search: string, replace: string, item: string) {
  return item.replaceAll(search, replace);
}

export function removeHtmlSpecialTags($: any, text: string): string {
  text = replaceall('+', '', text);
  text = replaceall('<strong>', '//STRONG-OPEN//', text);
  text = replaceall('</strong>', '//STRONG-CLOSE//', text);
  text = replaceall('<em>', '//ITALIC-OPEN//', text);
  text = replaceall('</em>', '//ITALIC-CLOSE//', text);
  text = replaceall('<wbr>', ' ', text);
  text = replaceall('<p>', '\r\n<p>', text);
  text = replaceall('<li>', '\r\n<li>', text);
  text = $('<textarea />').html(text).text();

  text = text.replace(/[\u200B-\u200D\uFEFF]/g, ' '); // replace zero width space to space
  text = replaceall(String.fromCharCode(160), ' ', text); // Convert NO-BREAK SPACE to SPACE
  text = replaceall(String.fromCharCode(8201), ' ', text); // Convert THIN SPACE to SPACE
  text = replaceall(String.fromCharCode(8203), ' ', text); // Zero Width Space

  text = replaceall('//STRONG-OPEN//', '<b>', text);
  text = replaceall('//STRONG-CLOSE//', '</b>', text);
  text = replaceall('//ITALIC-OPEN//', '<i>', text);
  text = replaceall('//ITALIC-CLOSE//', '</i>', text);

  return text;
}
