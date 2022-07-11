export function replaceAt(str: string, index: number, chr: string) {
  if (index > str.length - 1) return str;
  return str.substr(0, index) + chr + str.substr(index + 1);
}
