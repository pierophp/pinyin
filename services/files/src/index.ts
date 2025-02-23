import { Router, Request as RouterRequest } from 'itty-router';
import { IndexController } from './controllers/index.controller';
import { FilesController } from './controllers/files.controller';
import { verify } from '@tsndr/cloudflare-worker-jwt';

export interface AppRequest extends RouterRequest {
  request: Request;
  env: Env;
  ctx: ExecutionContext;
  user?: {
    id: number;
  };
}

export interface Env {
  AWS_REGION: string;
  AWS_S3_ENDPOINT: string;
  AWS_S3_BUCKET: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  JWT_KEY: string;
}

const withUser = (req: AppRequest) => {
  const authHeader = req.request.headers.get('Authorization') ?? '';

  const isValidToken = verify(authHeader, req.env.JWT_KEY);

  console.log({ isValidToken });

  req.user = { id: 1 };
};

// requireUser optionally returns (early) if user not found on request
const requireUser = (req: AppRequest) => {
  if (!req.user) return new Response('Not Authenticated', { status: 401 });
};

function loadRequest(
  req: RouterRequest,
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): AppRequest {
  const newReq = req as AppRequest;
  newReq.request = request;
  newReq.env = env;
  newReq.ctx = ctx;
  return newReq;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const router = Router();
    router.get('/', (req) =>
      IndexController.welcome(loadRequest(req, request, env, ctx)),
    );
    router.get(
      '/files',
      (req) => withUser(loadRequest(req, request, env, ctx)),
      requireUser,
      (req) => FilesController.list(req),
    );
    router.all('*', () => new Response('Not Found.', { status: 404 }));

    return router.handle(request);
  },
};
