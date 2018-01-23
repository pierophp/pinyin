import { RepositoryManager } from './repository.manager';

export class BaseRepository {
  static async getTransaction() {
    return await RepositoryManager.getTransaction();
  }

  static async getMysqlConnection() {
    return await RepositoryManager.getMysqlConnection();
  }
}
