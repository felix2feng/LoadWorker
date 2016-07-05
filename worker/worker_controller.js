// Dependencies
const request = require('request');
const scenariorunner = require('./scripts/scenario');
const helpers = require('./helper');
const Promise = require('bluebird');

// Global Variable
let jobsCompleted = 0;

const handleJob = (jobs, masterUrl) => {
  const requestUrl = `${masterUrl}/api/requestJob`;
  const results = [];

  Promise.mapSeries(jobs, (job =>
    scenariorunner.run(job.targetUrl, job.script)
      .then((runresults) => {
        // For each job result, save actions to the actions database
        const actionsResults = runresults.transactionTimes;
        helpers.saveActionResultsToDB(actionsResults, job);

        // Save to spawn database
        helpers.saveSpawnsToDB(runresults, job);

        // Add to results
        results.push(runresults);
        jobsCompleted++;
      })
      .catch((e) => console.log('err:', e))
  ))
  .then(() => {
    const responseFromMasterCallback = (error, response, body) => {
      if (error) {
        console.error(error);
      } else if (body === 'done') {
        // Shut off if no jobs are available
        console.log('Jobs completed is ', jobsCompleted);
        process.exit();
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
