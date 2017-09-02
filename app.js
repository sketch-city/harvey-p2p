const express = require('express'),
    winston = require('winston'),
    expressWinston = require('express-winston'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser')


const twilioRoutes = require('./routes/api/v1/twilio')
const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())

app.use(expressWinston.logger({
     transports: [
       new winston.transports.Console({
         json: true,
         colorize: true
       })
     ],
     meta: true, // optional: control whether you want to log the meta data about the request (default to true)
     msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
     expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
     colorize: true, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
     ignoreRoute: function (req, res) { return false; } // optional: allows to skip some log messages based on request and/or response
   }));
app.use('/api/v1/twilio', twilioRoutes)


app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
