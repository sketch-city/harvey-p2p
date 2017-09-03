const express = require('express'),
  router = express.Router(),
  MessagingResponse = require('twilio').twiml.MessagingResponse,
  { need } = require('../../../helpers/sheeter'),
  jsonQuery = require('json-query'),
  debug = require('debug')('sms')

const smsText = [
  {
    language : "english",
    trigger : "NEED",
    messages : {
      step1: "What do you need?",
      step2: `Can we contact you at PhoneNumberPlaceholder? Reply "YES" or provide alternate number.`,
      step3: "What is your current zipcode?",
      stepDone: "Thank you! Someone will be in contact with you to help fill your need."
    }
  },{
    language : "spanish",
    trigger : "NECESITAR",
    //triggers : ["NECESITAR", "NECESITO"],
    messages : {
      step1: "¿Qué necesitas?",
      step2: `¿Podemos ponernos en contacto con usted en PhoneNumberPlaceholder? Responda "SÍ" o proporcione un número alternativo.`,
      yes: "SÍ",
      step3: "¿Cuál es su código postal actual?",
      stepDone: "¡Gracias! Alguien estará en contacto con usted para ayudar a llenar su necesidad."
    }
  }
]

/**
 * Send an SMS reply, including storing some data in a cookie, if provided
 * req Express request object
 * res Express response object
 * opts Object
 * opts.message Message body to send as SMS
 * opts.nextStep Name of next step. Will be stored as 'step' cookie. Set to null
 *   to clear this cookie, resetting the conversation
 * opts.key (optional) Cookie name to store
 * opts.value Cookie value to store
 */
function reply(req,res,opts){
  if (opts.key !== undefined){
    res.cookie(opts.key, opts.value,{"path":""})
  }
  if (opts.nextStep === null){
    res.clearCookie("step")
  } else {
    res.cookie("step", opts.nextStep,{"path":""})
  }
  const response = new MessagingResponse();
  const message = response.message();
  message.body(opts.message);
  res.send(response.toString())
}

/**
 * Given a trigger word, select the appropriate language.
 * Return null if no match found.
 */
function getLanguage(initmsg) {
  var result = jsonQuery(['smsText[trigger=?]', initmsg], {
    data: {smsText}
  });

  if (result.value === null) {
    return null;
  }

  return result.value.language;
}

/**
 * Given a language, return the dictionary of strings stored for that language.
 * Return null if no match found.
 */
function getLanguageStrings(language) {
  var result = jsonQuery(['smsText[language=?]', language], {
    data: {smsText}
  });

  debug('getLanguageStrings(' + language + '):', result.value);

  if (result.value === null) {
    return null;
  }

  return result.value.messages;
}

/**
 * Given a language and a string title, return the string in the requested
 * language.
 * Return null if language or string not found.
 */
function getLanguageString(language, title) {
  var strings = getLanguageStrings(language)

  debug('getLanguageString(' + language + ', ' + title + '):', strings[title]);

  if (strings === null) {
    return null;
  }
  return strings[title];
}

/******************************************************************************/
// Begin steps in message dialog

function step0(req, res){
  var initmsg = req.body.Body.toUpperCase()
  var language = getLanguage(initmsg)
  debug('language:', language);
  reply(req,res,{
    nextStep:"step1",
    key: 'language',
    value: language,
    message: getLanguageString(language, 'step1')
  });
}

function step1(req, res){
  var language = req.cookies.language
  reply(req,res,{
    nextStep:"step2",
    message: getLanguageString(language, 'step2'),
    key:"step1info",
    value:req.body.Body
  })
}

function step2(req,res){
  var language = req.cookies.language
  var phoneNumber
  if (req.body.Body.toUpperCase() == "YES"){
    phoneNumber = req.body.From
  } else {
    phoneNumber = req.body.Body
  }
  reply(req,res,{
    nextStep:"step3",
    message: getLanguageString(language, 'step3'),
    key:"step2info",
    value: phoneNumber
  })
}

function step3(req,res){
  var zipcode = req.body.Body
  var phoneNumber = req.cookies.step2info
  var needs = req.cookies.step1info
  var language = req.cookies.language.

  need.addByPhone({
    Text_Input:   needs,
    Phone:        phoneNumber,
    Zip:          zipcode,
    Language:     language
  })
  .then(function(){
    reply(req,res,{
      nextStep: null,
      message: getLanguageString(language, 'stepDone')
    })
  })
  .catch(function(error){
    // TODO error handling
    next(error);
  });
}

// End steps in message dialog
/******************************************************************************/

router.post('/message', function(req,res){
  switch (req.cookies.step){
    case undefined:
      return step0(req,res)
      break;
    case "step1":
      return step1(req,res)
      break;
    case "step2":
      return step2(req,res)
      break;
    case "step3":
      return step3(req,res)
      break;
  }
})

module.exports = router;
