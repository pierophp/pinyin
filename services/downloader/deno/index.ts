import { serve } from 'https://deno.land/std@0.142.0/http/server.ts';
import { Downloader as JwDownloader } from '../src/sites/jw/downloader.ts';
import { Downloader as GenericDownloader } from '../src/sites/generic/downloader.ts';
import { DownloaderInterface } from '../src/sites/interfaces/downloader.interface.ts';

serve(async (request: Request) => {
  const url = new URL(request.url);
  const requestUrl = url.searchParams.get('url');
  if (!requestUrl) {
    return new Response(JSON.stringify({ message: 'URL is required' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }

  let downloader: DownloaderInterface = new GenericDownloader();
  if (requestUrl.includes('.jw.org')) {
    console.log('JW Downloader');
    downloader = new JwDownloader();
  }

  const downloadResponse = await downloader.download(
    requestUrl,
    url.searchParams.get('language') ?? 'e',
    url.searchParams.get('ideogramType') ?? undefined,
  );

  // console.log(downloadResponse);

  return await fetch(requestUrl, request);
});
