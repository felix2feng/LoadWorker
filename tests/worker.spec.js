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

    it('should save all items to the database', (done) => {
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
      });
      done();
    });
  });

  describe('saveSpawnsToDB', () => {
    it('should save all items to the database', (done) => {
      // 
      done();
    });
  });

  describe('responseFromMasterCallback', () => {
    it('should shut off if body is done', (done) => {
      // 
      done();
    });

    it('should call the callback if there are remaining jobs', (done) => {
      // 
      done();
    });
  });
});



