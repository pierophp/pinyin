import * as env from '../../../env';
import { AdapterInterface } from '../../file/adapter.interface';
import { NativeAdapter } from '../../file/adapters/native.adapter';
import { S3Adapter } from '../../file/adapters/s3.adapter';

const adapters = {
  native: NativeAdapter,
  s3: S3Adapter,
};

let dirname = `${__dirname}/../../../storage/`;
if (env.storage_path) {
  dirname = `${env.storage_path}`;
}

export class FileManager {
  protected getAdapter(): AdapterInterface {
    let adapter = env.files_adapter;
    if (!adapter) {
      adapter = 'native';
    }

    if (adapter === 'native') {
      return new adapters[adapter](dirname);
    }

    return new adapters[adapter]();
  }

  public async getFiles(userId: number): Promise<any> {
    const adapter = this.getAdapter();
    const files = await adapter.listContents('files/' + userId, true);

    files.forEach(file => {
      file.path = file.path.replace('.json', '');
    });

    return files;
  }

  public async getFile(userId: number, filename: string): Promise<any> {
    const adapter = this.getAdapter();
    return (await adapter.read(`files/${userId}/${filename}`)).contents;
  }

  public async saveFile(
    userId: number,
    filename: string,
    content: string,
  ): Promise<any> {
    const adapter = this.getAdapter();
    await adapter.write(`files/${userId}/${filename}`, content);
  }

  public async deleteFile(userId: number, filename: string): Promise<any> {
    const adapter = this.getAdapter();
    await adapter.delete(`files/${userId}/${filename}`);
  }
}
