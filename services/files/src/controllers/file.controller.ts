import { Env } from '..';
import { Request } from 'itty-router';
import { S3 } from '@aws-sdk/client-s3';
import { S3Adapter } from 'node-filesystem/adapters/s3.adapter';

export class FilesController {
  public static async list(
    req: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const s3Client = new S3({
      region: env.AWS_REGION,
      endpoint: env.AWS_S3_ENDPOINT,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    const fileAdapter = new S3Adapter(s3Client, env.AWS_S3_BUCKET, '/');

    // await fileAdapter.write('1/teste.txt', 'Teste');

    return Response.json({
      test: await fileAdapter.listContents('/1'),
    });
  }
}
