import { Curl, curly } from 'node-libcurl';
import { http } from '../../helpers/http';

export class Downloader {
  protected async downloadByCurly(url: string) {
    const { statusCode, data, headers } = await curly.get(url);
    if (statusCode > 400) {
      throw new Error(`Https Status ${statusCode}`);
    }

    return data;
  }

  protected async downloadByCurl(url: string) {
    const curl = new Curl();
    curl.setOpt('URL', `https://proxy.pinyin.workers.dev/?url=${url}`);
    curl.setOpt('FOLLOWLOCATION', true);
    return new Promise((done, reject) => {
      curl.on('end', (statusCode, body, headers) => {
        if (statusCode > 400) {
          reject();
          return;
        }

        curl.close.bind(curl);
        done(body);
      });

      curl.on('error', () => {
        curl.close.bind(curl);
        reject();
      });
      curl.perform();
    });
  }

  protected async downloadByAxios(url: string) {
    const response = await http.get(
      `https://proxy.pinyin.workers.dev/?url=${url}`,
      {
        headers: {
          'user-agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36',
        },
      },
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
    try {
      return await this.downloadByFetch(url);
    } catch (e) {
      try {
        return await this.downloadByAxios(url);
      } catch (e) {
        return await this.downloadByCurl(url);
      }
    }
  }
}
