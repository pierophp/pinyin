import { AdapterInterface } from './adapter.interface';

export class S3Adapter implements AdapterInterface {
  public async listContents(folder: string): Promise<any> {}

  public async write(path: string, content: string): Promise<any> {}

  public async read(path: string): Promise<any> {}
}
