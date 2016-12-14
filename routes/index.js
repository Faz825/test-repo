var express = require('express');
var router = express.Router();

var UserControler = require('../controller/UserController');
router.get('/auth/*', UserControler.doSignup);

/* Load Default Routes  */
router.get('/*', function(req, res, next) {
  res.render('index');
});


module.exports = router;
