import * as AWS from 'aws-sdk';
import { AdapterInterface, LocalAdapter, S3Adapter } from 'node-filesystem';
import * as replaceall from 'replaceall';

let dirname = `${__dirname.replace('dist/', '')}/../../../../storage/`;
const storagePathEnv = process.env['STORAGE_PATH'];
if (storagePathEnv) {
  dirname = `${storagePathEnv}`;
}

export class FileManager {
  protected getAdapter(): AdapterInterface {
    let adapter = process.env['FILES_ADAPTER'];
    if (!adapter) {
      adapter = 'local';
    }

    if (adapter === 'local') {
      return new LocalAdapter(dirname);
    }

    if (adapter === 's3') {
      const s3Client = new AWS.S3({
        accessKeyId: process.env['AWS_ACCESS_KEY_ID'],
        secretAccessKey: process.env['AWS_SECRET_ACCESS_KEY'],
        region: process.env['AWS_REGION'],
      });

      return new S3Adapter(s3Client as any, process.env['AWS_S3_BUCKET']!);
    }

    throw new Error('Invalid adapter');
  }

  public async getFiles(userId: number): Promise<any> {
    const adapter = this.getAdapter();
    const basepath = 'files/' + userId;
    const files = await adapter.listContents(basepath, true);
    const response: any[] = [];
    files.forEach((file) => {
      if (file.basename === '.DS_Store') {
        return;
      }

      const item = {
        path: file.path.replace('.json', '').substr(basepath.length + 1),
        filename: file.filename,
        dirname: file.dirname.substr(basepath.length),
        type: file.type,
      };

      if (!item.dirname) {
        item.dirname = '/';
      }
      response.push(item);
    });

    return response;
  }

  public async getFile(userId: number, filename: string): Promise<any> {
    const adapter = this.getAdapter();
    filename = replaceall('../', '', filename);
    return (await adapter.read(`files/${userId}/${filename}`)).contents;
  }

  public async saveFile(
    userId: number,
    filename: string,
    content: string,
  ): Promise<any> {
    const adapter = this.getAdapter();
    filename = replaceall('../', '', filename);
    await adapter.write(`files/${userId}/${filename}`, content, {});
  }

  public async createDir(userId: number, path: string): Promise<any> {
    const adapter = this.getAdapter();
    path = replaceall('../', '', path);
    await adapter.createDir(`files/${userId}/${path}`);
  }

  public async deleteFile(userId: number, filename: string): Promise<any> {
    const adapter = this.getAdapter();
    filename = replaceall('../', '', filename);
    await adapter.delete(`files/${userId}/${filename}`);
  }

  public async deleteDir(userId: number, path: string): Promise<any> {
    const adapter = this.getAdapter();
    path = replaceall('../', '', path);
    await adapter.deleteDir(`files/${userId}/${path}`);
  }
}
