export function explodeLines(text: string): string[] {
  if (typeof text === 'string') {
    return text.split('\r\n').map(s => s.trim());
  }

  return text;
}
