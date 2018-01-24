import { BaseRepository } from './base.repository';
import * as knex from '../../services/knex';

export class VideoHistoryRepository extends BaseRepository {
  static async findByUserId(userId: number): Promise<any[]> {
    return (await knex('video_history')
      .select(
        knex.raw(`
          video_history.url,
          video_track.description,
          video_track.images
        `),
      )
      .leftJoin('video_track', function leftJoin() {
        this.on('video_track.video', '=', 'video_history.video');
      })
      .where({ user_id: userId })
      .orderBy('video_track.id', 'DESC')
      .limit(50)).map(item => {
      item.images = JSON.parse(item.images);
      return item;
    });
  }
}
