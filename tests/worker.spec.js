/* eslint-disable */

// Tools to check out - Winston Logger

// Dependencies
const expect = require('chai').expect;
const sinon = require('sinon');

// Modules
const worker = require('../worker/worker.js');
const workerHandler = require('../worker/worker_controller.js');
const helpers = require('../worker/helper.js');
const script = require('../worker/scripts/scenario');
const Action = require('../models/ActionsModel');
const Spawn = require('../models/SpawnsModel');

describe('Worker', () => {
  
  const dummyJob = {
    scenarioID: 2,
  }

  describe('saveActionResultsToDB', () => {

    after(done => {
      Action.where('statusCode', 200).destroy();
      Action.where('statusCode', 400).destroy();
      done();
    });

    it('should save all Actions to the database', (done) => {
      const actionsData = [
        { 
          path: '/api/key', 
          statusCode: 200, 
          elapsedTime: 3, 
          dataSizeInBytes: 2, 
          httpVerb: 'GET',
        },
        { 
          path: '/api/key', 
          statusCode: 400, 
          elapsedTime: 4, 
          dataSizeInBytes: 3, 
          httpVerb: 'POST',
        },
      ];
      const actionsDataLength = actionsData.length;

      helpers.saveActionResultsToDB(actionsData, dummyJob);
      Action.fetchAll()
      .then(results => {
        expect(results.length).to.equal(actionsDataLength);
        for (var i = 0; i < results.length; i++) {
          expect(results[i].path).to.equal(actionsData[i].path);
          expect(results[i].statusCode).to.equal(actionsData[i].statusCode);
          expect(results[i].elapsedTime).to.equal(actionsData[i].elapsedTime);
          expect(results[i].dataSizeInBytes).to.equal(actionsData[i].dataSizeInBytes);
          expect(results[i].httpVerb).to.equal(actionsData[i].httpVerb);
        }
      });
      done();
    });
  });

  describe('saveSpawnsToDB', () => {
    
    after(done => {
      Spawn.where('totalTime', 3).destroy();
      done();
    });

    it('should save all items to the database', (done) => {
      const runResultsData = {
        scenarioTime: 3,
        transactionTimes: [],
      };

      helpers.saveSpawnsToDB(runResultsData, dummyJob);
      Spawn.fetchAll()
      .then(results => {
        expect(results.length).to.equal(runResultsData.length);
        expect(results.path).to.equal(runResultsData.path);
        expect(results.statusCode).to.equal(runResultsData.statusCode);
        expect(results.elapsedTime).to.equal(runResultsData.elapsedTime);
      });      
      done();
    });
  });

  xdescribe('responseFromMasterCallback', () => {
    it('should call handleJob if there are remaining jobs', (done) => {
      done();
    });

    it('should exit if the master responds with done', (done) => {
      done();
    });
  });
});
