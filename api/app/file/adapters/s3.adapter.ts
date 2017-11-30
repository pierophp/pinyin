import { createClient } from 's3';
import { AdapterInterface } from './adapter.interface';

let instance;

export class S3Adapter implements AdapterInterface {
  protected getInstance() {
    if (instance) {
      return instance;
    }

    instance = createClient({
      maxAsyncS3: 20,     // this is the default
      s3RetryCount: 3,    // this is the default
      s3RetryDelay: 1000, // this is the default
      multipartUploadThreshold: 20971520, // this is the default (20 MB)
      multipartUploadSize: 15728640, // this is the default (15 MB)
      s3Options: {
        accessKeyId: "your s3 key",
        secretAccessKey: "your s3 secret",
        region: "your region",
      },
    });


  }

  public async listContents(folder: string): Promise<any> {}

  public async write(path: string, content: string): Promise<any> {}

  public async read(path: string): Promise<any> {}
}
