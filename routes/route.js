var express = require('express');
var router = express.Router();

var oAuth = require('../middleware/Authentication');

/**
 * Load Models
 */
require('../model/UserModel');
require('../model/SecretaryModel');
require('../model/ConnectionModel');
require('../model/FavouriteNewsCategory');
/** Load  Controllers
 */
var DefaultController   = require('../controller/DefaultController'),
	UserController       = require('../controller/UserController'),
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
    '/','/sign-up','/choose-secretary','/doSignup','/secretaries','/about-you','/establish-connections','/news-categories','/profile-image','/done'
];


/** 
 * Actual Routes Implementation without Authentication
 */
router.post('/doSignup',UserController.doSignup);
router.get('/secretaries',SecretaryController.getSeretaries);




/**
 * Push All Rqurst through oAuth
 */
router.all('/*',oAuth.Authentication);

/** 
 * Implement Actual Routes that need to Authenticate
 */

router.post('/secretary/save',UserController.saveSecretary);
router.post('/general-info/save',UserController.saveGeneralInfo);
router.get('/connections',UserController.getConnections);
router.post('/connect-people',UserController.connect);
router.post('/addNewsCategory',UserController.addNewsCategory);
router.post('/upload/profile-image',UserController.uploadProfileImage);
//

module.exports = router;