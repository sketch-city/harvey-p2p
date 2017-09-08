const chai = require('chai'),
  chaiHttp = require('chai-http'),
  expect = chai.expect;

chai.use(chaiHttp);

require('dotenv').config({path: __basedir + '/test/.env'});

const app = require(__basedir + '/app'),
  helper = require(__basedir + '/test/helper');

var agent;

describe('language selection', () => {
  beforeEach(() => {
    agent = chai.request.agent(app);
  });
  it('english', () => {
    return helper.sendSMS(agent, "Need")
      .then(res => {
        return helper.checkSMSResponseBody(res, 
          /What are your immediate needs/);
      });
  });

  it('spanish', () => {
    return helper.sendSMS(agent, "Necesidad")
      .then(res => {
        return helper.checkSMSResponseBody(res, 
          /¿Cuáles son sus necesidades inmediatas?/);
      });
  });
});
