var express = require('express');
var router = express.Router();

require('../model/UserModel');

var UserControler = require('../controller/UserController');
router.get('/auth/*', UserControler.doSignup);







var UserControler = require('../controller/UserController');
/* Load Default Routes  */
router.get('/*', function(req, res, next) {
  res.render('index');
});






module.exports = router;
