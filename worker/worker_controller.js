// Dependencies
const request = require('request');
const scenariorunner = require('./scripts/scenario');
const helpers = require('./helper');

// Global Variable
let jobsCompleted = 0;

// TODO: CURRENTLY HARD CODED
const resultAddress = 'http://localhost:8000/api/complete';
const requestJob = 'http://localhost:8000/api/requestJob';

const handleJob = jobs => {
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
      helpers.saveActionResultsToDB(actionsResults, job);

      // Save to spawn database
      helpers.saveSpawnsToDB(runresults, job);

      // Add to results
      results.push(runresults);
      jobsCompleted++;
    });
  });

  // Post results to master server
  request.post({
    url: resultAddress,
    json: true,
    body: results,
  });

  // Request more work from master
  request.post(requestJob, helpers.responseFromMasterCallback);
};

module.exports = { handleJob, jobsCompleted };
