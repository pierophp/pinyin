export interface DownloaderInterface {
  download(
    url: string,
    language: string,
    ideogramType: string | null,
    convertPinyin?: boolean,
  ): Promise<any>;
}
