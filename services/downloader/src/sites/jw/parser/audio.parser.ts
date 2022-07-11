import * as replaceIdeogramsToSpace from '../../../data/special-ideograms-chars.ts';
import { Encoder } from '../../encoder.ts';
import { Wol } from '../wol.ts';

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
      let titleWithoutSpaces = String($('article header h1').text()).replaceAll(
        ' ',
        '',
      );

      replaceIdeogramsToSpace.forEach((item) => {
        titleWithoutSpaces = titleWithoutSpaces.replaceAll(item, '');
      });

      if (!titleWithoutSpaces) {
        return;
      }

      const responseAudio = await (
        await fetch(encoder.encodeUrl(media.attr('data-jsonurl')))
      ).json();

      let fileUrl;

      const language = responseAudio.files.CHS
        ? responseAudio.files.CHS
        : responseAudio.files.CH;

      if (!language) {
        return fileUrl;
      }

      language.MP3.some((file) => {
        let audioTitleWithoutSpaces = String(file.title || '').replaceAll(
          ' ',
          '',
        );

        replaceIdeogramsToSpace.forEach((item) => {
          audioTitleWithoutSpaces = audioTitleWithoutSpaces.replaceAll(
            item,
            '',
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
