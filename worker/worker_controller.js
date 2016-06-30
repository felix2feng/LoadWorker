// Dependencies
const request = require('request');
const scenariorunner = require('./scripts/scenario');
const helpers = require('./helper');

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
        {path, statusCode, elapsedTime, dataSizeInBytes, 'GET'},
      ]
    }
    */
      console.log('runresults', runresults);
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
  console.log('after job execution');

  // Post results to master server
  request.post({
    url: resultUrl,
    json: true,
    body: results,
  });

  // Request more work from master
  request.post(requestUrl, helpers.responseFromMasterCallback);
};

module.exports = { handleJob, jobsCompleted };
