const chai = require('chai'),
  chaiHttp = require('chai-http'),
  expect = chai.expect;

const parseXml = require('xml2js').parseString;

chai.use(chaiHttp);

require('dotenv').config({path: __basedir + '/test/.env'});

const app = require(__basedir + '/app');

function checkResponseBody(res, messageText) {
  return parseXml(res.text, (err, result) => {
    expect(result.Response.Message[0].Body[0]).to.equal(messageText);
  });
}


describe('language selection', () => {
  // Send NEED, expect "What do you need?"
  it('english: NEED', () => {
    return chai.request(app)
      .post('/api/v1/twilio/message')
      .type('form')
      .send({
        Body: "Need",
      })
      .then(res => {
        expect(res, 'response status').to.have.status(200);
        expect(res.text, 'response text').not.to.be.empty;
        return checkResponseBody(res, 'What do you need?');
      });
  });

  it('spanish: NECESITAR', () => {
    return chai.request(app)
      .post('/api/v1/twilio/message')
      .type('form')
      .send({
        Body: "Necesitar",
      })
      .then(res => {
        expect(res, 'response status').to.have.status(200);
        expect(res.text, 'response text').not.to.be.empty;
        return checkResponseBody(res, '¿Qué necesitas?');
      });
  });
});
