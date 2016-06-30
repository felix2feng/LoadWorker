const Action = require('../models/ActionsModel');
const Spawn = require('../models/SpawnsModel');
const { handleJob, jobsCompleted } = require('../worker/worker_controller');

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

const responseFromMasterCallback = (error, response, body) => {
  if (error) {
    console.error(error);
  } else if (body === 'done') {
    // Shut off if no jobs are available
    console.log('Jobs completed is ', jobsCompleted);
    process.exit();
  } else {
    // Recursively ask for more work if available
    handleJob(JSON.parse(body).job);
  }
};

module.exports = { saveActionResultsToDB, saveSpawnsToDB, responseFromMasterCallback };
