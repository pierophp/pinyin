function isCharacterChange(data) {
  data.lines.forEach((blocks, lineIndex) => {
    blocks.forEach((block, blockIndex) => {
      const ideograms = [];
      if (data.options.pinyinHide === '1') {
        for (let i = 0; i < block.c.length; i += 1) {
          ideograms.push(block.c[i]);
        }
      } else {
        ideograms.push(block.c);
      }

      ideograms.forEach(ideogram => {
        if (ideogram === data.character) {
          self.postMessage({
            type: 'changeCharacter',
            lineIndex,
            blockIndex,
          });
        }
      });
    });
  });
}

self.addEventListener('message', e => {
  if (e.data.type === 'addCharacter') {
    isCharacterChange(e.data);
  } else if (e.data.type === 'removeCharacter') {
    isCharacterChange(e.data);
  } else if (e.data.type === 'changeCharacter') {
    self.postMessage(e.data);
  }
});
