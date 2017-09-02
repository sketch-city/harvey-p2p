const express = require('express'),
  router = express.Router(),
  { need, offer } = require('../../../helpers/sheeter');

function setRoute(route, handler){
  return router.post(route, function(req, res, next){
    return handler(req.body)
      .then(function(body){
        res.send(body);
        next();
      })
      .catch(function(error){
        // TODO global error handling middleware.
        next(error);
      });
  });
}

setRoute('/needs', need.addByWeb);
setRoute('/offers', offer.addByWeb);

module.exports = router;
