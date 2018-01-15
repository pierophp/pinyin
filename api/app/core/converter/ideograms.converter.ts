export class IdeogramsConverter {
  convertIdeogramsToUtf16(ideograms: string): string {
    const ideogramsConverted: string[] = [];
    for (let i = 0; i < ideograms.length; i += 1) {
      ideogramsConverted.push(ideograms[i].charCodeAt(0).toString(16));
    }

    return ideogramsConverted.join('|');
  }

  convertUtf16ToIdeograms(ideogramsUtf16: string): string {
    const ideograms = ideogramsUtf16.split('|');
    let ideogramsConverted = '';
    for (let i = 0; i < ideograms.length; i += 1) {
      ideogramsConverted += String.fromCodePoint(parseInt(ideograms[i], 16));
    }

    return ideogramsConverted;
  }
}
