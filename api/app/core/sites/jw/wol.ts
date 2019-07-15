import { Downloader } from '../downloader';

interface LanguageInterface {
  [key: string]: {
    contentLocale: string;
    contentRsconf: string;
    contentLib: string;
  };
}

export class Wol {
  protected getParts(): LanguageInterface {
    const response = {
      'cmn-hans': {
        contentLocale: 'cmn-Hans',
        contentRsconf: 'r23',
        contentLib: 'lp-chs-rb',
      },
      'cmn-hant': {
        contentLocale: 'cmn-Hant',
        contentRsconf: 'r24',
        contentLib: 'lp-ch',
      },
      de: {
        contentLocale: 'de',
        contentRsconf: 'r10',
        contentLib: 'lp-x',
      },
      en: {
        contentLocale: 'en',
        contentRsconf: 'r1',
        contentLib: 'lp-e',
      },
      es: {
        contentLocale: 'es',
        contentRsconf: 'r4',
        contentLib: 'lp-s',
      },
      fr: {
        contentLocale: 'fr',
        contentRsconf: 'r30',
        contentLib: 'lp-f',
      },
      it: {
        contentLocale: 'it',
        contentRsconf: 'r6',
        contentLib: 'lp-i',
      },
      ja: {
        contentLocale: 'ja',
        contentRsconf: 'r7',
        contentLib: 'lp-j',
      },
      ko: {
        contentLocale: 'ko',
        contentRsconf: 'r8',
        contentLib: 'lp-ko',
      },
      pt: {
        contentLocale: 'pt',
        contentRsconf: 'r5',
        contentLib: 'lp-t',
      },
    };

    return response;
  }

  public changeUrlLanguage(url: string, language: string): string {
    const parts = this.getParts();
    if (!parts[language]) {
      throw new Error('Language not found');
    }

    const languageParts = parts[language];

    const urlParts = url.split('/');

    urlParts[3] = languageParts.contentLocale;
    urlParts[6] = languageParts.contentRsconf;
    urlParts[7] = languageParts.contentLib;

    return urlParts.join('/');
  }

  public async getAudioLink(url: string): Promise<string> {
    const urlParts = url.split('/');

    const audioUrl = `https://apps.jw.org/GETPUBMEDIALINKS?langwritten=CH&txtCMSLang=CH&fileformat=mp3&docid=${
      urlParts[8]
    }`;

    try {
      const downloader = new Downloader();
      const response = await downloader.download(audioUrl);
      return response.files.CH.MP3[0].file.url;
    } catch (e) {
      console.error('Error on audio ' + e);
    }

    return '';
  }
}
