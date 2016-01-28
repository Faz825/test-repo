var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/data', function(req, res, next) {
  res.json("data");
});

/* GET home page. */
router.get('/*', function(req, res, next) {
  res.render('index');
});






module.exports = router;
