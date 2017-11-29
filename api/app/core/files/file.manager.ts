import { NativeAdapter } from '../../file/adapters/native.adapter';
import { AdapterInterface } from '../../file/adapters/adapter.interface';

export class FileManager {
  protected getAdapter(): AdapterInterface {
    return new NativeAdapter();
  }

  public async getFiles(userId: number): Promise<any> {

    const adapter = this.getAdapter();
    const filesList: any[] = [];
    const files = await adapter.listContents('files/' + userId);

    files.forEach((file) => {
      // const isFile = fs.lstatSync(`${filesPath}${file}`).isFile();
      const isFile = true;
      filesList.push({
        type: isFile ? 'file' : 'folder',
        path: file.replace('.json', ''),
      });
    });

    return filesList;
  }

  public async getFile(userId: number, filename: string): Promise<any> {
    const adapter = this.getAdapter();
    await adapter.read(`files/${userId}/${filename}`);
  }

  public async saveFile(userId: number, filename: string, content: string): Promise<any> {
    const adapter = this.getAdapter();
    await adapter.write(`files/${userId}/${filename}`, content);
  }
}
