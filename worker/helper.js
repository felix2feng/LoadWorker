const Action = require('../models/ActionsModel');
const Spawn = require('../models/SpawnsModel');
const workerController = require('./worker_controller');

let masterUrl = '';

if (process.env.NODE_ENV === 'development') {
  masterUrl = 'http://127.0.0.1:2000';
} else if (process.env.NODE_ENV === 'production') {
  masterUrl = process.env.PROTOCOL + process.env.MASTERHOST_PORT_2000_TCP_ADDR + ':' + process.env.MASTER_PORT;
};

console.log('workerController in helper', workerController);

// Save action results to database
const saveActionResultsToDB = (actionsResults, job) => {
  console.log('called to save Actions results to DB');
  for (let i = 0; i < actionsResults.length; i++) {
    const actionData = {
      statusCode: actionsResults[i].statusCode,
      elapsedTime: actionsResults[i].elapsedTime,
      id_scenario: job.scenarioID,
      dataSizeInBytes: actionsResults[i].dataSizeInBytes,
      httpVerb: actionsResults[i].httpVerb,
    };
    const newAction = new Action(actionData);
    newAction.save()
      .then(() => {
        console.log('Successfully saved');
      })
      .catch(err => {
        console.error(err);
      });
  }
};

const saveSpawnsToDB = (runresults, job) => {
  console.log('called to save Spawn results to DB');
  const spawnData = {
    totalTime: runresults.scenarioTime,
    id_scenario: job.scenarioID,
  };
  const newSpawn = new Spawn(spawnData);
  newSpawn.save()
    .then(() => {
      console.log('Successfully saved');
    })
    .catch(err => {
      console.error(err);
    });
};

module.exports = { saveActionResultsToDB, saveSpawnsToDB };
