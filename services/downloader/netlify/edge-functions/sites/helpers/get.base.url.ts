export function getBaseUrl(url: string): string {
  let newUrl = '';
  const urlParts = url.split('://');
  newUrl += urlParts[0];
  if (urlParts[1]) {
    newUrl += '://';
    const urlParts2 = urlParts[1].split('/');
    newUrl += urlParts2[0];
  }

  return newUrl;
}
