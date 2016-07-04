const Action = require('../models/ActionsModel');
const Spawn = require('../models/SpawnsModel');

// Save action results to database
const saveActionResultsToDB = (actionsResults, job) => {
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
        console.log('Successfully saved to Action DB');
      })
      .catch(err => {
        console.error(err);
      });
  }
};

const saveSpawnsToDB = (runresults, job) => {
  const spawnData = {
    totalTime: runresults.scenarioTime,
    id_scenario: job.scenarioID,
  };
  const newSpawn = new Spawn(spawnData);
  newSpawn.save()
    .then(() => {
      console.log('Successfully saved to Spawns DB');
    })
    .catch(err => {
      console.error(err);
    });
};

module.exports = { saveActionResultsToDB, saveSpawnsToDB };
