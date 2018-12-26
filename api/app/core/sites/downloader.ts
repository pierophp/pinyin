import { Curl } from 'node-libcurl';
import { http } from '../../helpers/http';

export class Downloader {
  protected async downloadByCurl(url: string) {
    const curl = new Curl();
    curl.setOpt('URL', url);
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
    const response = await http.get(url);
    if (response.status > 400) {
      throw new Error(`Error downloading ${url}`);
    }

    return response.data;
  }

  public async download(url: string) {
    try {
      return await this.downloadByAxios(url);
    } catch (e) {
      return await this.downloadByCurl(url);
    }
  }
}
