import { ListContentsResponse } from '../response/list.contents.response';

export interface AdapterInterface {
  listContents(folder: string): Promise<ListContentsResponse[]>;

  write(path: string, content: string): Promise<string>;

  read(path: string): Promise<string>;

  delete(path: string): Promise<void>;
}
