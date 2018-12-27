import { http } from '../../../helpers/http';
import * as knex from '../../../services/knex';
// @ts-ignore
import * as UnihanSearch from '../../../services/UnihanSearch';
import { Encoder } from '../encoder';
import * as bluebird from 'bluebird';

export class Track {
  public async get(url: string, type: string, userId: number) {
    const encoder = new Encoder();

    let videoTrack: any[] = [];
    const urlParts = url.split('/');
    if (url.indexOf('.mp4') !== -1) {
      const filename = urlParts[urlParts.length - 1]
        .replace(/_r(.*)P/g, '')
        .replace('.mp4', '');

      videoTrack = await knex('video_track').where({ video: filename });
    } else {
      videoTrack = await knex('video_track').where({
        code: urlParts[urlParts.length - 1],
        language: url.indexOf('cmn-hant') !== -1 ? 'CH' : 'CHS',
      });
    }

    if (videoTrack.length === 0) {
      return {
        track: '',
      };
    }

    const videoHistory = await knex('video_history')
      .where({
        user_id: userId,
      })
      .limit(1)
      .orderBy('id', 'DESC');

    if (
      videoHistory.length === 0 ||
      videoHistory[0].video !== videoTrack[0].video
    ) {
      await knex('video_history').insert({
        video: videoTrack[0].video,
        url,
        user_id: userId,
        created_at: new Date(),
      });
    }

    let showPinyin = true;
    let showIdeograms = true;

    if (type === 'p') {
      showIdeograms = false;
    }

    if (type === 'c') {
      showPinyin = false;
    }

    let trackList: any[] = [];

    if (videoTrack[0].track_url) {
      const response = await http.get(
        encoder.encodeUrl(videoTrack[0].track_url),
      );

      const lines = response.data.split('\n');
      let i = 0;
      trackList = await bluebird.map(lines, async (line: string) => {
        const lineSplit = line.split('-->');
        if (lineSplit.length > 1) {
          i += 1;
          return line;
        }

        if (i > 0) {
          if (line.trim()) {
            const ideograms = UnihanSearch.segment(line);
            const pinyinList = await UnihanSearch.toPinyin(ideograms);
            let newLine = '<ruby>';
            pinyinList.forEach(pinyin => {
              if (showIdeograms) {
                newLine += `${pinyin.ideogram}`;
              }
              if (showPinyin) {
                newLine += ` <rt>${pinyin.pinyin.trim()}</rt> `;
              } else {
                newLine += ' <rt> </rt> ';
              }
            });
            newLine += '</ruby>';

            return newLine;
          }

          return line;
        }

        return line;
      });
    }

    let videoUrl = '';
    const videos = JSON.parse(videoTrack[0].videos);
    if (videos && videos['720p']) {
      videoUrl = videos['720p'];
    }

    if (videos && videos['480p'] && !videoUrl) {
      videoUrl = videos['480p'];
    }

    if (videos && videos['360p'] && !videoUrl) {
      videoUrl = videos['360p'];
    }

    if (videos && videos['240p'] && !videoUrl) {
      videoUrl = videos['240p'];
    }

    return {
      url: videoUrl,
      track: trackList.join('\n'),
    };
  }

  public async loadTracks() {
    const languages = ['CH', 'CHS'];
    const videosInserted = {};
    await bluebird.mapSeries(languages, async language => {
      const response = await http.get(
        `https://data.jw-api.org/mediator/v1/categories/${language}/VideoOnDemand?detailed=1`,
      );
      const categories = response.data.category.subcategories;
      await bluebird.mapSeries(categories, async (category: any) => {
        const res = await http.get(
          `https://data.jw-api.org/mediator/v1/categories/${language}/${
            category.key
          }?detailed=1`,
        );

        const subcategories = res.data.category.subcategories;

        await bluebird.mapSeries(subcategories, async (subcategory: any) => {
          if (subcategory.key.substr(-8) === 'Featured') {
            return;
          }

          const url = `https://data.jw-api.org/mediator/v1/categories/${language}/${
            subcategory.key
          }?detailed=0`;
          try {
            const subRes = await http.get(url);

            await bluebird.mapSeries(
              subRes.data.category.media,
              async (media: any) => {
                if (!media) {
                  return;
                }

                let trackUrl = '';

                const urlParts = media.files[0].progressiveDownloadURL.split(
                  '/',
                );

                const videos = {};
                let images = {};

                if (media.images) {
                  images = media.images.wss;
                }

                const video = urlParts[urlParts.length - 1]
                  .replace(/_r(.*)P/g, '')
                  .replace('.mp4', '');

                if (videosInserted[video]) {
                  return;
                }

                await bluebird.mapSeries(media.files, async (file: any) => {
                  videos[file.label] = file.progressiveDownloadURL;

                  if (file.subtitles === undefined) {
                    return;
                  }

                  trackUrl = file.subtitles.url;
                });

                const videoTrack = await knex('video_track').where({
                  video,
                });

                if (videoTrack.length === 0) {
                  await knex('video_track').insert({
                    video,
                    track_url: trackUrl,
                    description: media.title,
                    videos: JSON.stringify(videos),
                    images: JSON.stringify(images),
                    code: media.languageAgnosticNaturalKey,
                    language,
                    created_at: new Date(),
                  });
                  // eslint-disable-next-line
                  console.log(video);
                  // eslint-disable-next-line
                  console.log(media.title);
                  // eslint-disable-next-line
                  console.log(trackUrl);

                  videosInserted[video] = 1;
                } else {
                  await knex('video_track')
                    .where('id', '=', videoTrack[0].id)
                    .update({
                      video,
                      track_url: trackUrl,
                      description: media.title,
                      videos: JSON.stringify(videos),
                      images: JSON.stringify(images),
                      code: media.languageAgnosticNaturalKey,
                      language,
                      updated_at: new Date(),
                    });
                }
              },
            );
          } catch (e) {
            // eslint-disable-next-line
            console.log(url);
            // eslint-disable-next-line
            console.log(e);
            return;
          }
        });
      });
    });
  }
}
