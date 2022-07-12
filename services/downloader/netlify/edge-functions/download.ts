import { Downloader } from '../../src/sites/jw/downloader.ts';
// import { Downloader as GenericDownloader } from '../../src/sites/generic/downloader.ts';
// import { DownloaderInterface } from '../../src/sites/interfaces/downloader.interface.ts';
import { Context } from 'https://edge-bootstrap.netlify.app/v1/index.ts';

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);
  const requestUrl = url.searchParams.get('url');
  if (!requestUrl) {
    return new Response(JSON.stringify({ message: 'URL is required' }), {
      status: 400,
      headers: {
        'content-type': 'application/json',
      },
    });
  }

  const version = url.searchParams.get('version') ?? '1';

  // let downloader: DownloaderInterface = new GenericDownloader();
  // if (requestUrl.includes('.jw.org')) {
  //   console.log('JW Downloader');
  //   downloader = new JwDownloader();
  // }

  // console.log(downloader);
  // const downloadResponse = await downloader.download(
  //   requestUrl,
  //   url.searchParams.get('language') ?? 'e',
  //   url.searchParams.get('ideogramType'),
  // );

  // console.log(downloadResponse);

  return new Response(JSON.stringify({}), {
    headers: {
      'content-type': 'application/json',
    },
  });
};
