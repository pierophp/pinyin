import * as env from '../../../env';
import { AdapterInterface } from 'node-filesystem';
import { LocalAdapter } from 'node-filesystem';
import { S3Adapter } from 'node-filesystem';

const adapters = {
  local: LocalAdapter,
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
      adapter = 'local';
    }

    if (adapter === 'local') {
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
    await adapter.write(`files/${userId}/${filename}`, content. {});
  }

  public async deleteFile(userId: number, filename: string): Promise<any> {
    const adapter = this.getAdapter();
    await adapter.delete(`files/${userId}/${filename}`);
  }
}
