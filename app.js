const winston = require('winston'),
    express = require('express'),
    expressWinston = require('express-winston'),
    bodyParser = require('body-parser');
const app = express()

app.use(bodyParser.urlencoded({ extended: false }))

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



app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.post('*', function(req,res){
  console.log("Test: ", req.body)
  res.end()
})






app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
