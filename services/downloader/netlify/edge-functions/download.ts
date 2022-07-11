import { Downloader as JwDownloader } from './sites/jw/downloader.ts';
import { Downloader as GenericDownloader } from './sites/generic/downloader.ts';
import { DownloaderInterface } from './sites/interfaces/downloader.interface.ts';

export default async (request: Request) => {
  const url = new URL(request.url);
  const requestUrl = url.searchParams.get('url');
  if (!requestUrl) {
    return Response.json({ message: 'URL is required' }, { status: 400 });
  }

  const version = url.searchParams.get('version') ?? '1';

  let downloader: DownloaderInterface = new GenericDownloader();
  if (requestUrl.includes('.jw.org')) {
    console.log('JW Downloader');
    downloader = new JwDownloader();
  }

  const downloadResponse = await downloader.download(
    requestUrl,
    url.searchParams.get('language') ?? 'e',
    url.searchParams.get('ideogramType'),
  );

  console.log(downloadResponse);

  return Response.json({});
};
