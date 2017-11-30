import { writeFile } from 'fs';
import { createClient } from 's3';
import { promisify } from 'util';
import * as uid from 'uid';

import * as env from '../../../env';
import { ListContentsResponse } from '../response/list.contents.response';
import { AdapterInterface } from './adapter.interface';
import { NativeAdapter } from './native.adapter';

const writeFileAsync = promisify(writeFile);
const nativeAdapter = new NativeAdapter();

let instance;

export class S3Adapter implements AdapterInterface {
  protected getInstance() {
    if (instance) {
      return instance;
    }

    instance = createClient({
      s3Options: {
        accessKeyId: env.aws_access_key_id,
        secretAccessKey: env.aws_secret_access_key,
        region: env.aws_region,
      },
    });

    return instance;
  }

  public async listContents(folder: string): Promise<ListContentsResponse[]> {
    folder = `${folder}/`;
    const s3Params = {
      Bucket: env.aws_s3_bucket,
      Prefix: folder,
    };

    const finder = this.getInstance().listObjects({
      s3Params,
      recursive: false,
    });

    const response: ListContentsResponse[] = [];

    return new Promise<ListContentsResponse[]>((done, reject) => {
      finder.on('data', data => {
        data.Contents.forEach(element => {
          if (element.Key === folder) {
            return;
          }
          const listContentsResponse: ListContentsResponse = new ListContentsResponse();
          listContentsResponse.path = element.Key.split('/').splice(-1)[0];
          listContentsResponse.type = 'file';
          response.push(listContentsResponse);
        });
      });

      finder.on('end', () => {
        done(response);
      });

      finder.on('error', message => {
        reject();
      });
    });
  }

  public async write(path: string, content: string): Promise<string> {
    const localFile = `tmp/${uid(20)}`;
    const fullLocalFile = await nativeAdapter.write(localFile, content);
    const params = {
      localFile: fullLocalFile,
      s3Params: {
        Key: path,
        Bucket: env.aws_s3_bucket,
      },
    };

    const uploader = this.getInstance().uploadFile(params);

    return new Promise<string>(async (done, reject) => {
      await nativeAdapter.delete(localFile);

      uploader.on('error', reject);

      uploader.on('end', () => {
        done(path);
      });
    });
  }

  public async read(path: string): Promise<string> {
    const downloader = this.getInstance().downloadBuffer({
      Key: path,
      Bucket: env.aws_s3_bucket,
    });

    return new Promise<string>(done => {
      downloader.on('error', done(''));

      downloader.on('end', buffer => {
        const response = buffer.toString('utf8');
        done(response);
      });
    });
  }

  public async delete(path: string): Promise<void> {
    const params = {
      Bucket: env.aws_s3_bucket,
      Delete: {
        Objects: [
          {
            Key: path,
          },
        ],
      },
    };

    return new Promise<void>(done => {
      const deleter = this.getInstance().deleteObjects(params);
      deleter.on('end', function() {
        done();
      });
    });
  }
}
