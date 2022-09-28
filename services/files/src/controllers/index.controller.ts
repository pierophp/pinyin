import { AppRequest } from '..';

export class IndexController {
  public static async welcome(req: AppRequest): Promise<Response> {
    return new Response('Home!');
  }
}
