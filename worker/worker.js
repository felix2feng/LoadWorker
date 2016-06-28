// All master logic incl. Communication between web server and worker, worker spin up and wind down

// Dependencies
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

// Modules
const workerController = require('./worker_controller.js');

// Global Variables: Need to update with correct port number
const port = process.env.port || 8001;
// TODO - To figure out correct IP Address to master
const masterIPAddress = '127.0.0.1'; //To update with master host

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
  console.log('This is the IP Address I will post to', masterIPAddress);
  request.post(masterIPAddress, (error, response, body) => {
    if (error) {
      console.log(error);
    }
    workerController.handleJob(JSON.parse(body).job);
  });
});
