const express = require('express'),
  router = express.Router(),
  MessagingResponse = require('twilio').twiml.MessagingResponse;




//TODO: DOCUMENT THOSE ARGUEMENTS
function reply(req,res,opts){
  if (opts.key !== undefined){
    res.cookie(opts.key, opts.value,{"path":""})
  }
  res.cookie("step", opts.nextStep,{"path":""})
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
  //save text to cookie:"step1info:<"info">"
  //set cookie to "step:step2"
  //send next message : "can we contact you at req.body.from(phone number text came from)? Reply "YES" or provide alternate number."
}

function step2(req,res){
  //If "YES" : Save req.body.from to "step2info:<"info">"
  //else: Save contact info to "step2info:<"info">"
  //send next message : "What is your current zipcode?"
}

function step3(req,res){
  //log to console, in separate lines, the info of <needtxt>, <contactnumber>, <zip>
  //send "we hear your needs, and will be in contact soon-ish" ?????????????
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
