// All master logic incl. Communication between web server and worker, worker spin up and wind down

// Dependencies
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

// Modules
const workerController = require('./worker_controller.js');
const environment = require('dotenv');

// Set environment variables file
if (process.env.NODE_ENV === 'development') {
  environment.config({ path: './env/development.env' });
} else if (process.env.NODE_ENV === 'production') {
  environment.config({ path: './env/production.env' });
}

// Global Variables: Need to update with correct port number
const port = process.env.PORT || 8001;

// TODO - To figure out correct IP Address to master
console.log('masterhost', process.env.MASTER_HOST);

let masterUrl = '';

if (process.env.MASTER_HOST === '') {
  masterUrl = 'http://localhost:8000/api/requestJob';
} else {
  masterUrl = process.env.MASTER_HOST + ':' + process.env.MASTER_PORT + '/api/requestJob';
}

// Start Express Server
const app = express();
app.set('port', port);

// Middleware
app.use(bodyParser.json());

// Respond to POST request from Master
// app.post('/api/worker', workerController);

// Respond to cancellation POST request from Master
// app.post('/api/cancel', workerController.cancel);

// Respond to wind down POST request from Master
// app.post('/api/shutDown', workerController.shutDown);

// Server listens at specified port
app.listen(app.get('port'), () => {
  console.log(`Worker server listening to port ${app.get('port')}`);
  console.log('This is the IP Address I will post to', masterUrl);
  request.post(masterUrl, (error, response, body) => {
    if (error) {
      console.log(error);
    }
    console.log('body', body);
    if (body === 'done') {
      console.log('No jobs received from server');
      process.exit();
    } else {
      workerController.handleJob(JSON.parse(body).job);
    }
  });
});
