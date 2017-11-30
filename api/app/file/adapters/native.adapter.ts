import { ListContentsResponse } from '../response/list.contents.response';
import { readdir, readFile, writeFile, stat, mkdir, unlink } from 'fs';
import { promisify } from 'util';
import * as env from '../../../env';
import { AdapterInterface } from './adapter.interface';

const readdirAsync = promisify(readdir);
const readFileAsync = promisify(readFile);
const writeFileAsync = promisify(writeFile);
const statAsync = promisify(stat);
const mkdirAsync = promisify(mkdir);
const unlinkAsync = promisify(unlink);

let dirname = `${__dirname}/../../../storage/`;
if (env.storage_path) {
  dirname = `${env.storage_path}`;
}

export class NativeAdapter implements AdapterInterface {
  protected async dirExists(dirpath: string): Promise<boolean> {
    try {
      await statAsync(dirpath);
      return true;
    } catch (e) {
      return false;
    }
  }

  protected async mkdir(dirpath: string): Promise<void> {
    await mkdirAsync(dirpath);
  }

  public async listContents(folder: string): Promise<ListContentsResponse[]> {
    const files = await readdirAsync(folder, 'utf8');
    const response: ListContentsResponse[] = [];
    files.forEach(file => {
      // const isFile = fs.lstatSync(`${filesPath}${file}`).isFile();
      const isFile = true;
      const listContentResponse = new ListContentsResponse();
      listContentResponse.type = isFile ? 'file' : 'folder';
      listContentResponse.path = file;
      response.push(listContentResponse);
    });

    return response;
  }

  public async write(path: string, content: string): Promise<string> {
    const pathList = path.split('/');
    pathList.splice(-1, 1);

    const folder = pathList.join('/');

    const fullFolder = `${dirname}${folder}`;

    if (!await this.dirExists(fullFolder)) {
      await this.mkdir(fullFolder);
    }

    await writeFileAsync(dirname + path, content);

    return dirname + path;
  }

  public async read(path: string): Promise<string> {
    return await readFileAsync(`${dirname}${path}`, 'utf8');
  }

  public async delete(path: string): Promise<void> {
    await unlinkAsync(`${dirname}${path}`);
  }
}
