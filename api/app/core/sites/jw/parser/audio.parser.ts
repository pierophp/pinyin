import * as replaceall from 'replaceall';
import * as replaceIdeogramsToSpace from '../../../../../../shared/helpers/special-ideograms-chars';
import { http } from '../../../../helpers/http';
import { Encoder } from '../../encoder';
import { Wol } from '../wol';

export class AudioParser {
  public async parse($: any, chineseUrl: string): Promise<string | undefined> {
    if (chineseUrl && chineseUrl.indexOf('wol.jw.org') !== -1) {
      const wol = new Wol();
      return await wol.getAudioLink(chineseUrl);
    }

    let media = $('.jsAudioPlayer a');
    if (media.length > 0) {
      return media.attr('href');
    }

    media = $('.jsAudioFormat a');
    if (media.length === 0) {
      return;
    }

    const encoder = new Encoder();

    try {
      let titleWithoutSpaces = replaceall(
        ' ',
        '',
        $('article header h1').text(),
      );
      replaceIdeogramsToSpace.forEach(item => {
        titleWithoutSpaces = replaceall(item, '', titleWithoutSpaces);
      });

      if (!titleWithoutSpaces) {
        return;
      }

      const responseAudio = await http.get(
        encoder.encodeUrl(media.attr('data-jsonurl')),
      );

      let fileUrl;

      const language = responseAudio.data.files.CHS
        ? responseAudio.data.files.CHS
        : responseAudio.data.files.CH;

      if (!language) {
        return fileUrl;
      }

      language.MP3.some(file => {
        let audioTitleWithoutSpaces = replaceall(' ', '', file.title || '');
        replaceIdeogramsToSpace.forEach(item => {
          audioTitleWithoutSpaces = replaceall(
            item,
            '',
            audioTitleWithoutSpaces,
          );
        });

        if (audioTitleWithoutSpaces.indexOf(titleWithoutSpaces) !== -1) {
          fileUrl = file.file.url;
          return true;
        }

        return false;
      });

      return fileUrl;
    } catch (e) {
      // eslint-disable-next-line
      console.log(e);
    }

    return;
  }
}
