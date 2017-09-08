const chai = require('chai'),
  chaiHttp = require('chai-http'),
  expect = chai.expect;

require('dotenv').config({path: __basedir + '/test/.env'});

const app = require(__basedir + '/app'),
  helper = require(__basedir + '/test/helper'),
  sheet = require(__basedir + '/test/helper/sheet');

sheet.app.listen(3002);

chai.use(chaiHttp);

var agent; // chai request agent

describe('dialog', () => {
  beforeEach(() => {
    agent = chai.request.agent(app);
  });

  it('simple', () => {
    var extraInfo = {
      From: "+11234567890"
    };
    var sheetPromise = new Promise((resolve, reject) => {
        sheet.ev.on('req', req => {
          resolve(req);
        });
      });
    return helper.sendSMS(agent, "Need", extraInfo)
      .then(res => {
        helper.checkSMSResponseBody(res,
          /What are your immediate needs/);
        return helper.sendSMS(agent, "Test need", extraInfo);
      })
      .then(res => {
        // Expect response to have phone number in format +10000000000
        helper.checkSMSResponseBody(res, /\(123\) 456-7890/);
        return helper.sendSMS(agent, "Yes", extraInfo);
      })
      .then(res => {
        // Expect response to have phone number in format +10000000000
        helper.checkSMSResponseBody(res, /zip code/);
        return helper.sendSMS(agent, "77001", extraInfo);
      })
      .then(res => {
        return Promise.all([
          helper.checkSMSResponseBody(res, /thank you/i),
          sheetPromise.then(req => {
            expect(req.body).to.not.be.empty;
            expect(req.body.Phone).to.equal('(123) 456-7890');
            expect(req.body.Notes).to.be.empty;
          })
        ]);
      });
  });

  var alternateValidNumbers = [
    '7894561234',
    '789-456-1234',
    '(789)456-1234',
    '(789) 456-1234',
    '(789) 456 1234',
    '(789) 456  1234',
    '(789) 456 -1234',
  ];

  alternateValidNumbers.forEach(alternateNumber => {
    it('alternate number, format: ' + alternateNumber, () => {
      var extraInfo = {
        From: "+11234567890"
      };
      var sheetPromise = new Promise((resolve, reject) => {
          sheet.ev.on('req', req => {
            resolve(req);
          });
        });
      return helper.sendSMS(agent, "Need", extraInfo)
        .then(res => {
          helper.checkSMSResponseBody(res,
            /What are your immediate needs/);
          return helper.sendSMS(agent, "Test need", extraInfo);
        })
        .then(res => {
          // Expect response to have phone number in format +10000000000
          helper.checkSMSResponseBody(res, /\(123\) 456-7890/);
          return helper.sendSMS(agent, alternateNumber, extraInfo);
        })
        .then(res => {
          // Expect response to have phone number in format +10000000000
          helper.checkSMSResponseBody(res, /zip code/);
          return helper.sendSMS(agent, "77001", extraInfo);
        })
        .then(res => {
          return Promise.all([
            helper.checkSMSResponseBody(res, /thank you/i),
            sheetPromise.then(req => {
              expect(req.body).to.not.be.empty;
              expect(req.body.Phone).to.equal('(789) 456-1234');
              expect(req.body.Notes).to.equal('SMS source number: (123) 456-7890');
            })
          ]);
        });
    });
  });

  it('alternate number, extra', () => {
    var extraInfo = {
      From: "+11234567890"
    };
    var sheetPromise = new Promise((resolve, reject) => {
        sheet.ev.on('req', req => {
          resolve(req);
        });
      });
    return helper.sendSMS(agent, "Need", extraInfo)
      .then(res => {
        helper.checkSMSResponseBody(res,
          /What are your immediate needs/);
        return helper.sendSMS(agent, "Test need", extraInfo);
      })
      .then(res => {
        // Expect response to have phone number in format +10000000000
        helper.checkSMSResponseBody(res, /\(123\) 456-7890/);
        return helper.sendSMS(agent, "yes or 789-456-1234", extraInfo);
      })
      .then(res => {
        // Expect response to have phone number in format +10000000000
        helper.checkSMSResponseBody(res, /zip code/);
        return helper.sendSMS(agent, "77001", extraInfo);
      })
      .then(res => {
        return Promise.all([
          helper.checkSMSResponseBody(res, /thank you/i),
          sheetPromise.then(req => {
            expect(req.body).to.not.be.empty;
            expect(req.body.Phone).to.equal('(123) 456-7890');
            expect(req.body.Notes).to.match(/yes or 789-456-1234/);
          })
        ]);
      });
  });
});
