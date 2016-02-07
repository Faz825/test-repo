var express = require('express');
var router = express.Router();

var oAuth = require('../middleware/Authentication');

/**
 * Load Models
 */
require('../model/UserModel');
require('../model/SecretaryModel');
/** Load  Controllers
 */
var DefualtController = require('../controller/DefualtController'),
	UserControler = require('../controller/UserController'),
	SecretaryController = require('../controller/SecretaryController');

/**
 * Define Public URLs
 * this public urls will load without authentication component.
 * Basically those URLs will be site assets.
 * This URL can be image, Stylesheet, Javascript file
 */
GLOBAL.publicURLs = ['/images','/css','/web','/fonts'];

/**
 *This URLs will be normal URL that execute out side the authentication component.
 * this URL can be accessed through web browser without login
 */
GLOBAL.AccessAllow = [
    '/','/signup','/choose-secretary','/doSignup','/secretaries'
];


/** 
 * Actual Routes Implementation without Authentication
 */
router.post('/doSignup',UserControler.doSignup);
router.get('/secretaries',SecretaryController.getSeretaries);


/**
 * Push All Rqurst through oAuth
 */
router.all('/*',oAuth.Authentication);

/** 
 * Implement Actual Routes that need to Authenticate
 */
 
module.exports = router;