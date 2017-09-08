const chai = require('chai'),
  chaiHttp = require('chai-http'),
  expect = chai.expect,
  parseXml = require('xml2js').parseString;

chai.use(chaiHttp);

var exp = {};

/**
 * @param agent Chai agent instance, for dialog
 * @param messageText Message body of mock SMS message
 * @param extraInfo Other content of mock SMS message
 */
exp.sendSMS = (agent, messageText, extraInfo) => {
  var body = Object.assign({
    Body: messageText
  }, extraInfo);

  return agent.post('/api/v1/twilio/message')
    .type('form')
    .send(body);
};

/**
 * @param res Chai http response object
 * @param messageText Regex to match expected response
 */
exp.checkSMSResponseBody = (res, messageText) => {
  expect(res, 'response status').to.have.status(200);
  expect(res.text, 'response text').not.to.be.empty;
  return parseXml(res.text, (err, result) => {
    expect(result.Response.Message[0].Body[0]).to.match(messageText);
  });
}


module.exports = exp;
