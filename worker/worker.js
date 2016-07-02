// All master logic incl. Communication between web server and worker, worker spin up and wind down

// Dependencies
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const environment = require('dotenv');

// Set environment variables file
if (process.env.NODE_ENV === 'development') {
  environment.config({ path: './env/development.env' });
} else if (process.env.NODE_ENV === 'production') {
  environment.config({ path: '../env/production.env' });
}

// Modules
const workerController = require('./worker_controller');

// Global Variables: Need to update with correct port number
const port = process.env.WORKER_PORT || 5000;

let masterUrl = '';

if (process.env.NODE_ENV === 'development') {
  masterUrl = 'http://127.0.0.1:2000';
} else if (process.env.NODE_ENV === 'production') {
  masterUrl = process.env.PROTOCOL + process.env.MASTERHOST_PORT_2000_TCP_ADDR + ':' + process.env.MASTER_PORT;
}

const requestUrl = masterUrl + '/api/requestJob';
const resultUrl = masterUrl + '/api/complete';

// Start Express Server
const app = express();
app.set('port', port);

// Middleware
app.use(bodyParser.json());

// Server listens at specified port
app.listen(app.get('port'), () => {
  console.log(`Worker server listening to port ${app.get('port')}`);
  console.log('This is the IP Address I will post to', requestUrl);
  request.post(requestUrl, (error, response, body) => {
    if (error) {
      console.log(error);
    }
    console.log('body', body);
    if (body === 'done') {
      console.log('No jobs received from server');
      process.exit();
    } else if (body === undefined) {
      console.log('Body from master server is undefined');
    } else {
      workerController.handleJob(JSON.parse(body).job, masterUrl);
    }
  });
});
