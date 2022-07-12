export interface DownloaderInterface {
  download(
    url: string,
    language?: string,
    ideogramType?: string,
    convertPinyin?: boolean,
  ): Promise<any>;
}
