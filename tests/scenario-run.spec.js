/* eslint-env mocha */
const request = require('request');
const sinon = require('sinon');
const scenario = require('../worker/scripts/scenario.js');
const expect = require('chai').expect;

describe('User Profile', () => {
  const site = 'http://localhost:3000';

  before((done) => {
    sinon
      .stub(request, 'get')
      .yields(null, null);
    done();
  });

  after((done) => {
    request.get.restore();
    done();
  });

  it('can log in using JWT', (done) => {
    const script = `login(\'/login\', {"username":"bill", "password":"password"}).get(\'/links\');`;
    scenario.run(site, script).then((results) => {
      (results.scenarioTime).should.be.above(0);
      console.log(results.transactionTimes);
      done();
    }).catch(done);
  });
});
