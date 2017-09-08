const express = require('express'),
  bodyParser = require('body-parser'),
  EventEmitter = require('events'),
  multer = require('multer');

const upload = multer();

const app = express();

var sheetEv = new EventEmitter();

app.use(bodyParser.urlencoded({ extended: false }))

app.post('/', upload.array(), (req, res) => {
  sheetEv.emit('req', req);
  res.end();
});

module.exports = {
  ev: sheetEv,
  app
};
