// import chai from 'chai';
import { V2FileConverter } from '../../../../app/core/converter/v2.file.converter';
import { readFile, writeFile } from 'fs-extra';

describe('V2FileConverter', () => {
  it('convert', async () => {
    const data = await readFile(__dirname + '/data/doc1_v1.json');
    const dataExpected = await readFile(__dirname + '/data/doc1_v2.json');

    const v2FileConverter = new V2FileConverter();
    const result = v2FileConverter.convert(JSON.parse(data.toString()));
    // await writeFile(
    //   __dirname + '/data/doc1_v2.json',
    //   JSON.stringify(result, null, 2),
    // );

    expect(dataExpected.toString()).toBe(JSON.stringify(result, null, 2));
  });
});
