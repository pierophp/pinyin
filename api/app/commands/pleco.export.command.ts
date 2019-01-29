import { Arguments, CommandModule } from 'yargs';
import { PlecoExport } from '../core/exports/pleco.export';

export class PlecoExportCommand implements CommandModule {
  public command = 'pleco:export';
  public describe = 'Pleco Export';

  public async handler(argv: Arguments) {
    const plecoExport = new PlecoExport();

    console.info('Start export to Pleco - PT');
    await plecoExport.exportPt();

    console.info('Start export to Pleco - Chinese Tools PT');
    await plecoExport.exportChineseToolsPt();
    console.info('Start export to Pleco - Chinese Tools ES');
    await plecoExport.exportChineseToolsEs();
    console.info('Start export to Pleco - Chinese Tools EN');
    await plecoExport.exportChineseToolsEn();

    console.info('Start export to Pleco - Glosbe PT');
    await plecoExport.exportGlosbePt();
    console.info('Start export to Pleco - Glosbe ES');
    await plecoExport.exportGlosbeEs();
    console.info('Start export to Pleco - Glosbe EN');
    await plecoExport.exportGlosbeEn();

    process.exit();
  }
}
