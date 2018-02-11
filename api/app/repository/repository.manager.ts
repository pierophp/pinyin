import { RepositoryManager as DatabaseRepositoryManager } from './database/repository.manager';

export class RepositoryManager {
  static async beginTransaction() {
    await DatabaseRepositoryManager.beginTransaction();
  }

  static async commit() {
    await DatabaseRepositoryManager.commit();
  }

  static async rollBack() {
    await DatabaseRepositoryManager.rollBack();
  }
}
