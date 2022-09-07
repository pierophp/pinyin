import { Router } from 'itty-router';
import { IndexController } from './controllers/index.controller';
import { FilesController } from './controllers/file.controller';

export interface Env {
  AWS_REGION: string;
  AWS_S3_ENDPOINT: string;
  AWS_S3_BUCKET: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const router = Router();
    router.get('/', (req) => IndexController.welcome(req, env, ctx));
    router.get('/files/list', (req) => FilesController.list(req, env, ctx));
    router.all('*', () => new Response('Not Found.', { status: 404 }));

    return router.handle(request);
  },
};
