import { http } from '../../helpers/http';

export class Downloader {
  protected async downloadByAxios(url: string) {
    const response = await http.get(url, {
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
      },
    });

    if (response.status > 400) {
      throw new Error(`Error downloading ${url}`);
    }

    return response.data;
  }

  protected async downloadByAxiosWithVercel(url: string) {
    const response = await http.get(
      `https://pinyin-proxy.vercel.app/api/?url=${url}`,
    );
    if (response.status > 400) {
      throw new Error(`Error downloading ${url}`);
    }

    return response.data;
  }

  protected async downloadByFetch(url: string) {
    // const response = await fetch(
    //   `https://proxy.pinyin.workers.dev/?url=${url}`,
    // );

    const myHeaders = new Headers();
    myHeaders.append(
      'accept',
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    );
    myHeaders.append(
      'accept-language',
      'pt-BR,pt;q=0.9,zh-CN;q=0.8,zh;q=0.7,en-US;q=0.6,en;q=0.5,ru;q=0.4',
    );
    myHeaders.append('cache-control', 'max-age=0');
    // myHeaders.append(
    //   'cookie',
    //   'cookieConsent-STRICTLY_NECESSARY=true; cookieConsent-FUNCTIONAL=true; cookieConsent-DIAGNOSTIC=true; cookieConsent-USAGE=true; cookieConsent-STRICTLY_NECESSARY=true; cookieConsent-FUNCTIONAL=true; cookieConsent-DIAGNOSTIC=true; cookieConsent-USAGE=true; ckLang=T',
    // );
    // myHeaders.append('if-modified-since', 'Thu, 25 Jul 2024 21:31:12 GMT');
    myHeaders.append('priority', 'u=0, i');
    myHeaders.append(
      'sec-ch-ua',
      '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
    );
    myHeaders.append('sec-ch-ua-mobile', '?0');
    myHeaders.append('sec-ch-ua-platform', '"Windows"');
    myHeaders.append('sec-fetch-dest', 'document');
    myHeaders.append('sec-fetch-mode', 'navigate');
    myHeaders.append('sec-fetch-site', 'same-origin');
    myHeaders.append('sec-fetch-user', '?1');
    myHeaders.append('upgrade-insecure-requests', '1');
    myHeaders.append(
      'user-agent',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
    );

    const requestOptions: RequestInit = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
    };

    const response = await fetch(url, requestOptions);

    if (response.status > 400) {
      throw new Error(`Error downloading ${url}`);
    }

    return await response.text();
  }

  public async download(url: string) {
    // try {
    return await this.downloadByFetch(url);
    // } catch (e) {
    //   return await this.downloadByAxiosWithVercel(url);
    // }
  }
}
