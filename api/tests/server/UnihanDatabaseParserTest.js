const UnihanDatabaseParser = require('../../app/services/UnihanDatabaseParser');
const chai = require('chai');

const expect = chai.expect;
const udp = new UnihanDatabaseParser();

describe('XML Test', () => {

  it('Load file', () => {

    udp.loadile('./resources/UnihanDatabase.xml');
    //expect(1).to.equal(1);
  });

});