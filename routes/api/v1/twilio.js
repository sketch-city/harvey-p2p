const express = require('express'),
  router = express.Router(),
  MessagingResponse = require('twilio').twiml.MessagingResponse;




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
  if (req.body.Body.toUpperCase() !== "NEED"){
    res.end()
    return
  }
  reply(req,res,{
    nextStep:"step1",
    message:"What do you need?"
  })
}

function step1(req, res){
  reply(req,res,{
    nextStep:"step2",
    message:`Can we contact you at ${req.body.From}? Reply "YES" or provide alternate number.`,
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
    message:"What is your current zipcode?",
    key:"step2info",
    value: phoneNumber
  })
}

function step3(req,res){
  var zipcode = req.body.Body
  var phoneNumber = req.cookies.step2info
  var needs = req.cookies.step1info
  console.log({zipcode,phoneNumber,needs})
  reply(req,res,{
    nextStep: null,
    message:"Heard, loud and clear."
  })
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
