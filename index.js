#!/usr/bin/env node
var fs = require('fs');
var logger = require('loglevel');
logger.setLevel("info");
var http = require('http');
var https = require('https');
var app = require('./app');

const options = {
  cert: fs.readFileSync("/u01/ssl/certificate.fullchain.crt").toString(),
  key: fs.readFileSync("/u01/ssl/certificate.key").toString()
};

var server = http.createServer(app);
var serverssl = https.createServer(options, app);

server.listen(3005, function() {
    logger.info('Express server listening on port 3005');
});


serverssl.listen(3006, function() {
    logger.info('Express SSL server listening on port 3006');
});

/**
server.listen(process.env.PORT || 3005, function() {
    logger.info('Express server listening on port 3005');
});
**/

