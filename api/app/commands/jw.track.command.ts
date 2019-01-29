import { Arguments, CommandModule } from 'yargs';
import { Track } from '../core/sites/jw/track';

export class JwTrackCommand implements CommandModule {
  public command = 'jw:track';
  public describe = 'Extract video tracks from JW';

  public async handler(argv: Arguments) {
    const track = new Track();
    await track.loadTracks();
    process.exit();
  }
}
