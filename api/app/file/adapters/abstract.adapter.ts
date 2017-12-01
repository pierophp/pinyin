import * as rtrim from 'rtrim';
import * as ltrim from 'ltrim';

export abstract class AbstractAdapter {
  protected pathPrefix: string | null;

  protected pathSeparator: string = '/';

  public setPathPrefix(prefix: string) {
    if (prefix === '') {
      this.pathPrefix = null;
      return;
    }

    this.pathPrefix = rtrim(prefix, '\\/') + this.pathSeparator;
  }

  public getPathPrefix(): string | null{
    return this.pathPrefix;
  }

  public applyPathPrefix(path) : string
  {
      return this.getPathPrefix() + ltrim(path, '\\/');
  }
}
