import { BaseRepository } from './base.repository';
import { VideoHistoryRepository as DatabaseVideoHistoryRepository } from './database/video.history.repository';
import { ArrayCache } from '../cache/array.cache';

export class VideoHistoryRepository extends BaseRepository {
  static async findByUserId(userId: number) {
    return await DatabaseVideoHistoryRepository.findByUserId(userId);
  }
}
