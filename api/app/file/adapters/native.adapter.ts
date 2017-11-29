import { readdir, readFile, writeFile, stat, mkdir } from 'fs';
import { promisify } from 'util';
import * as env  from '../../../env';
import { AdapterInterface } from './adapter.interface';

const readdirAsync = promisify(readdir);
const readFileAsync = promisify(readFile);
const writeFileAsync = promisify(writeFile);
const statAsync = promisify(stat);
const mkdirAsync = promisify(mkdir);

let dirname = `${__dirname}/../../storage/`;
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

  public async listContents(folder: string): Promise<any> {
    return await readdirAsync(folder, 'utf8');
  }

  public async write(path: string, content: string): Promise<any> {
    const folder = path.split('/').splice(-1, 1).join('/');
    const fullFolder = `${dirname}${folder}`;
    if (!await this.dirExists(fullFolder)) {
      await this.mkdir(fullFolder);
    }

    await writeFileAsync(dirname + path, content);
  }

  public async read(path: string): Promise<any> {
    await readFileAsync(`${dirname}${path}`, 'utf8');
  }
};
