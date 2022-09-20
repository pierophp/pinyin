import { Env } from '..';
import { Request } from 'itty-router';
export class IndexController {
  public static async welcome(
    req: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    return Response.json({ welcome: 'Welcome to Pinyin Files' });
  }
}
