const express = require('express'),
  router = express.Router(),
  MessagingResponse = require('twilio').twiml.MessagingResponse,
  { need } = require('../../../helpers/sheeter')
  jsonQuery = require('json-query')

const smsText = [{
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
    messages : {
      step1: "¿Qué necesitas?",
      step2: `¿Podemos ponernos en contacto con usted en PhoneNumberPlaceholder? Responda "SÍ" o proporcione un número alternativo.`,
      yes: "SÍ",
      step3: "¿Cuál es su código postal actual?",
      stepDone: "¡Gracias! Alguien estará en contacto con usted para ayudar a llenar su necesidad."
    }
  }];

//TODO: DOCUMENT THOSE ARGUEMENTS
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

function step0(req, res){
  var initmsg = req.body.Body.toUpperCase()
  var result = jsonQuery(`smsText[trigger=${initmsg}].language`, {
    data: {smsText}
  })
  res.cookie("language", result.value,{"path":""})
  if (req.body.Body.toUpperCase() !== result.parents[result.parents.length - 1].value.trigger){
    res.end()
    return
  }
  reply(req,res,{
    nextStep:"step1",
    message: result.parents[result.parents.length - 1].value.messages.step1,
  })
}

function step1(req, res){
  reply(req,res,{
    nextStep:"step2",
    message: result.parents[result.parents.length - 1].value.messages.step2,
    key:"step1info",
    value:req.body.Body
  })
}

function step2(req,res){
  var phoneNumber
  if (req.body.Body.toUpperCase() == "YES"){
    phoneNumber = req.body.From
  } else {
    phoneNumber = req.body.Body
  }
  reply(req,res,{
    nextStep:"step3",
    message:result.parents[result.parents.length - 1].value.messages.step3,
    key:"step2info",
    value: phoneNumber
  })
}

function step3(req,res){
  var zipcode = req.body.Body
  var phoneNumber = req.cookies.step2info
  var needs = req.cookies.step1info

  need.addByPhone({
    Text_Input:   needs,
    Phone:        phoneNumber,
    Zip:          zipcode
  })
  .then(function(){
    reply(req,res,{
      nextStep: null,
      message: result.parents[result.parents.length - 1].value.messages.stepDone
    })
  })
  .catch(function(error){
    // TODO error handling
    next(error);
  });

}

router.post('/message', function(req,res){
  console.log("body: ", req.body)
  console.log("RequestCookies: ", req.cookies)
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
