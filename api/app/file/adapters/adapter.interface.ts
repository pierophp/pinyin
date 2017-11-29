export interface AdapterInterface {
  listContents(folder: string): Promise<any>;

  write(path: string, content: string): Promise<any>;

  read(path: string): Promise<any>;
}
