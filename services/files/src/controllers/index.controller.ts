import { AppRequest } from '..';

export class IndexController {
  public static async welcome(req: AppRequest): Promise<Response> {
    return Response.json({ welcome: 'Welcome to Pinyin Files' });
  }
}
