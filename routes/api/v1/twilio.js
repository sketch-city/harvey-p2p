'use strict';

const express = require('express'),
  router = express.Router(),
  MessagingResponse = require('twilio').twiml.MessagingResponse,
  jsonQuery = require('json-query'),
  debug = require('debug')('sms'),
  handlebars = require('handlebars'),
  _ = require('underscore');

const { need } = require(__basedir + '/helpers/sheeter');

const smsText = [
  {
    language : "English",
    trigger : "NEED",
    yes: "YES",
    messages : {
      step1: "Thank you for contacting Harvey Needs Matching. We are very sorry for the loss you have experienced. What are your immediate needs? Please be specific.",
      step2: handlebars.compile('Can we contact you at {{ phone }}? ' +
        'Reply "{{ yes }}" or provide alternate contact info.'),
      step3: "What is your current zip code?",
      stepDone: "Thank you! Someone will soon be in contact with you to help."
    }
  },{
    language : "Spanish",
    trigger : "NECESIDAD",
    //triggers : ["NECESITAR", "NECESITO"],
    yes: ["SÍ", "SI"],
    messages : {
      step1: "Gracias por contactar Harvey Necesidades. Lamentamos mucho la pérdida que ha experimentado. ¿Cuáles son sus necesidades inmediatas? Por favor sea especifico.",
      step2: handlebars.compile('¿Podemos ponernos en contacto con usted en ' +
        '{{ phone }}? Responda "{{ yes }}" o proporcione un número alternativo.'),
      step3: "¿Cuál es su código postal actual?",
      stepDone: "¡Gracias! Alguien estará en contacto con ti pronto para ayudar."
    }
  }
]

function formatPhoneNumber(input) {
  var num = input.replace(/[^0-9]/g, '');

  num = num.slice(-10);

  return num.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
}

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
  if (opts.data !== undefined){
    Object.keys(opts.data).forEach(key => {
      res.cookie(key, opts.data[key], {"path": ""})
    });
  }
  if (opts.nextStep === null){
    res.clearCookie("step")
  } else if (opts.nextStep !== undefined) {
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
function getLanguageInit(req) {
  var initmsg = req.body.Body.toUpperCase().trim()
  var result = jsonQuery(['smsText[trigger=?]', initmsg], {
    data: {smsText}
  });

  if (result.value === null) {
    return null;
  }

  return result.value.language;
}

/**
 * List all valid initial trigger words
 */
function getLanguageTriggers() {
  var result = jsonQuery('smsText[*].trigger', {
    data: {smsText}
  });
  return result.value;
}

/**
 * Return the word for "yes" in the given language
 */
function getLanguageYes(language, returnAll) {
  var result = jsonQuery(['smsText[language=?]', language], {
    data: {smsText}
  });

  if (result.value === null) {
    return null;
  }

  var yes = result.value.yes;

  if (_.isArray(yes) && returnAll !== true) {
    return yes[0];
  }

  return yes;
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
function getLanguageString(language, title, data) {
  var strings = getLanguageStrings(language)

  debug('getLanguageString(' + language + ', ' + title + '):', strings[title]);

  if (strings === null) {
    return null;
  }

  var message = strings[title];

  if (typeof message === 'function') {
    return message(data);
  }

  return message;
}

/**
 *  Determine whether the input is an affirmative response in the given language
 */
function matchYes(req, language) {
  var input = req.body.Body.toUpperCase().trim();
  var yes = getLanguageYes(language, true);
  debug('matchYes, input:', input);
  if (_.isArray(yes)) {
    return _.contains(yes, input);
  } else {
    return input === yes;
  }
}

/******************************************************************************/
// Begin steps in message dialog

function step0(req, res){
  var language = getLanguageInit(req)

  if (language === null) {
    reply(req, res, {
      message: 'Accepted inputs: ' + getLanguageTriggers().join(', ')
    });
    return;
  }

  reply(req,res,{
    data: {
      language
    },
    nextStep: "step1",
    message: getLanguageString(language, 'step1')
  });
}

function step1(req, res){
  var language = req.cookies.language
  var sourceNumber = formatPhoneNumber(req.body.From);

  reply(req,res,{
    data: {
      step1info: req.body.Body
    },
    nextStep: "step2",
    message: getLanguageString(language, 'step2', {
      phone: sourceNumber,
      yes: getLanguageYes(language)
    }),
  })
}

function step2(req,res){
  var language = req.cookies.language;
  var sourceNumber = formatPhoneNumber(req.body.From);
  var primaryNumber = sourceNumber;
  var notes = '';
  var input = req.body.Body.trim();

  // if answer is just YES, store the formatted source number.
  // Otherwise, if answer contains a proper phone number, store it as Phone
  //   and store the original source in Notes field
  //  If answer contains more than a phone number, then also store the extra text
  //    in the Notes field

  if (!matchYes(req, language)){
    let match = input.match(/^[\(]*\d{3}[-\) ]*\d{3}[- ]*\d{4}$/);
    if (match !== null && match[0] === input) {
      // Single, seemingly valid number provided.
      // Use it as primary number, and append source number to Notes
      primaryNumber = formatPhoneNumber(input);
      notes += 'SMS source number: ' + sourceNumber;
    } else {
      // Keep source number as primary, and store this response in notes
      notes += "SMS response to phone prompt: \"" + input + "\"";
    }
  }

  reply(req,res,{
    data: {
      step2info: primaryNumber,
      notes
    },
    nextStep: "step3",
    message: getLanguageString(language, 'step3'),
  })
}

function step3(req,res){
  var zipcode = req.body.Body;
  var phoneNumber = req.cookies.step2info;
  var needs = req.cookies.step1info;
  var language = req.cookies.language;
  var notes = req.cookies.notes;

  need.addByPhone({
    Text_Input:   needs,
    Phone:        phoneNumber,
    Zip:          zipcode,
    Language:     language,
    Notes:        notes
  })
  .then(function(){
    reply(req,res,{
      nextStep: null,
      message: getLanguageString(language, 'stepDone')
    })
  })
  /*
  .catch(function(error){
    // TODO error handling
    next(error);
  });
  */
}

// End steps in message dialog
/******************************************************************************/

router.post('/message', function(req,res){
  // Check for conversation re-initialization
  var language = getLanguageInit(req)
  if (language !== null) {
    return step0(req, res);
  }

  // Check for CLEAR command
  // This may be useful for testing
  // if (req.body.Body.toUpperCase().trim() === 'CLEAR') {
  //   reply(req, res, {
  //     nextStep: null,
  //     message: 'This dialog has been reset',
  //   });
  //   return;
  // }
  //
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
