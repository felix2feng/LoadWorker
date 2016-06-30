// Dependencies
const request = require('request');
const scenariorunner = require('./scripts/scenario');
const Action = require('../models/ActionsModel');
const Spawn = require('../models/SpawnsModel');

// Global Variable
let jobsCompleted = 0;

const handleJob = (jobs, masterUrl) => {
  /* Jobs input
  [
    {
      scenarioID: req.body.scenarioID,
      scenario: req.body.scenarioName,
      user: req.body.id_user,
      targetUrl: req.body.targetUrl,
      script: req.body.script,
    },
    ...
  ]
  */
  const requestUrl = masterUrl + '/api/requestJob';
  const resultUrl = masterUrl + '/api/complete';

  console.log('Got some work from the server', jobs);
  const results = [];
  jobs.forEach(job => {
    scenariorunner.run(job.targetUrl, job.script)
    .then((runresults) => {
    /*
    runresults: {
      scenarioTime: timeToRunScenarioInMilliseconds,
      transactionTimes: [
        [path, statusCode, elapsedTime, dataSizeInBytes, 'GET'],
      ]
    }
    */
      // For each job result, save actions to the actions database
      const actionsResults = runresults.transactionTimes;
      for (let i = 0; i < actionsResults.length; i++) {
        const actionData = {
          statusCode: actionsResults[i].statusCode,
          elapsedTime: actionsResults[i].elapsedTime,
          id_scenario: job.scenarioID,
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

      // Save to spawn database
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
      results.push(runresults);
      jobsCompleted++;
    });
  });

  // Post results to master server
  request.post({
    url: resultUrl,
    json: true,
    body: results,
  });

  // Request more work from master
  request.post(requestUrl, (error, response, body) => {
    if (error) {
      console.error(error);
    } else if (body === 'done') {
      console.log('Jobs completed is ', jobsCompleted);
      process.exit();
    } else {
      // Recursively ask for more work if available
      handleJob(JSON.parse(body).job);
    }
  });
};

module.exports = { handleJob };
