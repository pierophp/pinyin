export default function(lines) {
  let i = 0;
  const tracks = [];
  lines.forEach(line => {
    const lineSplit = line.split('-->');
    if (lineSplit.length > 1) {
      i += 1;

      const endTime = lineSplit[1].trim().split(' ');

      tracks[i] = {};
      tracks[i].startTime = lineSplit[0].trim();
      tracks[i].endTime = endTime[0];
      tracks[i].message = [];
      return;
    }

    if (i > 0) {
      if (line.trim()) {
        tracks[i].message.push(line.trim());
      }
    }
  });

  return tracks;
}
