// Dependencies
const request = require('request');
const scenariorunner = require('./scripts/scenario');
const helpers = require('./helper');
const Promise = require('bluebird');

// Global Variable
let jobsCompleted = 0;

const handleJob = (jobs, masterUrl) => {
  /* Jobs input
  [
    {
      scenarioID: req.body.scenarioID,
      scenario: req.body.scenarioName,
      user: req.body.id_user,
      targetURL: req.body.targetURL,
      script: req.body.script,
    },
    ...
  ]
  */
  const requestUrl = masterUrl + '/api/requestJob';
  const resultUrl = masterUrl + '/api/complete';

  console.log('Got some work from the server', jobs);
  const results = [];

  Promise.mapSeries(jobs, (job => {
    console.log('run that job');
    return scenariorunner.run(job.targetUrl, job.script)
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
    })
    .catch((e) => console.log('err:', e));
  }))
  .then(() => {
    console.log('after job execution');

    // Post results to master server
    request.post({
      url: resultUrl,
      json: true,
      body: results,
    });

    const responseFromMasterCallback = (error, response, body) => {
      if (error) {
        console.error(error);
      } else if (body === 'done') {
        // Shut off if no jobs are available
        console.log('Jobs completed is ', jobsCompleted);
        setTimeout(() => {
          request.post({
            url: resultUrl,
          });
          process.exit();
        }, 5000);
      } else {
        // Recursively ask for more work if available
        handleJob(JSON.parse(body).job, masterUrl);
      }
    };

    // Request more work from master
    request.post(requestUrl, responseFromMasterCallback);
  });
};

module.exports = { handleJob, jobsCompleted };
