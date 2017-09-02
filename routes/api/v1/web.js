const express = require('express'),
  router = express.Router(),
  { addNeedByWeb } = require('../../../helpers/sheeter');

router.post('/needs', function(req,res, next){
  return addNeedByWeb(req.body)
    .then(function(body){
      res.send(body);
      next();
    })
    .catch(function(error){
      // TODO global error handling middleware.
      next(error);
    });
});

module.exports = router;
