export class Encoder {
  public encodeUrl(url: string): string {
    let newUrl = 'https://www.jw.org/';
    if (url.substr(0, newUrl.length) !== newUrl) {
      return url;
    }

    const urlParts = url.replace(newUrl, '').split('/');
    urlParts.forEach(urlPart => {
      newUrl += encodeURIComponent(urlPart);
      if (urlPart) {
        newUrl += '/';
      }
    });

    return newUrl;
  }

  public decodeUrl(url: string): string {
    let newUrl = 'https://www.jw.org/';
    if (url.substr(0, newUrl.length) !== newUrl) {
      return url;
    }

    const urlParts = url.replace(newUrl, '').split('/');
    urlParts.forEach(urlPart => {
      newUrl += decodeURIComponent(urlPart);
      newUrl += '/';
    });

    return newUrl;
  }
}
