import { http } from '../../../helpers/http';
import * as knex from '../../../services/knex';
import * as UnihanSearch from '../../../services/UnihanSearch';

export class Track {
  public async get(url: string, type: string) {
    const urlParts = url.split('/');
    const filename = urlParts[urlParts.length - 1]
      .replace(/_r(.*)P/g, '')
      .replace('.mp4', '');
    const videoTrack = await knex('video_track').where({ video: filename });

    if (videoTrack.length === 0) {
      return '';
    }

    let showPinyin = true;
    let showIdeograms = true;
    if (type === 'p') {
      showIdeograms = false;
    }

    if (type === 'c') {
      showPinyin = false;
    }

    const response = await http.get(this.encodeUrl(videoTrack[0].track_url));

    const lines = response.data.split('\n');
    let i = 0;
    const trackList = await Promise.map(lines, async line => {
      const lineSplit = line.split('-->');
      if (lineSplit.length > 1) {
        i += 1;
        return line;
      }

      if (i > 0) {
        if (line.trim()) {
          const ideograms = UnihanSearch.segment(line);
          const pinyinList = await UnihanSearch.toPinyin(ideograms);
          let newLine = '<ruby>';
          pinyinList.forEach(pinyin => {
            if (showIdeograms) {
              newLine += `${pinyin.ideogram}`;
            }
            if (showPinyin) {
              newLine += ` <rt>${pinyin.pinyin.trim()}</rt> `;
            } else {
              newLine += ' <rt> </rt> ';
            }
          });
          newLine += '</ruby>';

          return newLine;
        }

        return line;
      }

      return line;
    });

    return trackList.join('\n');
  }
}
