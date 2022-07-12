export class Downloader {
  protected async downloadByFetchWithVercel(url: string): Promise<string> {
    const response = await fetch(
      `https://pinyin-proxy.vercel.app/api/?url=${url}`,
    );
    if (response.status > 400) {
      throw new Error(`Error downloading ${url}`);
    }

    return await response.text();
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

  public async download(url: string): Promise<string> {
    try {
      return await this.downloadByFetch(url);
    } catch (e) {
      return await this.downloadByFetchWithVercel(url);
    }
  }
}
