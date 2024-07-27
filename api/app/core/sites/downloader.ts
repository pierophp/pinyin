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
    const response = await fetch(
      `https://proxy.pinyin.workers.dev/?url=${url}`,
    );

    if (response.status > 400) {
      throw new Error(`Error downloading ${url}`);
    }

    return await response.text();
  }

  public async download(url: string) {
    // try {
    return await this.downloadByAxios(url);
    // } catch (e) {
    //   return await this.downloadByAxiosWithVercel(url);
    // }
  }
}
