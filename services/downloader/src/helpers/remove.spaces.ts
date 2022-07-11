// @todo remove this
function replaceall(item: string, search: string, replace: string) {
  return item.replaceAll(search, replace);
}

export function removeSpaces(str: string): string {
  str = str.replace(/[\u200B-\u200D\uFEFF]/g, ''); // replace zero width space to space
  str = replaceall(String.fromCharCode(160), '', str); // Convert NO-BREAK SPACE to SPACE
  str = replaceall(String.fromCharCode(8201), '', str); // Convert THIN SPACE to SPACE
  str = replaceall(String.fromCharCode(8203), '', str); // Zero Width Space
  str = replaceall(' ', '', str); // Zero Width Space

  return str;
}
