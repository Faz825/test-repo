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
require('../model/UploadModel');
require('../model/SkillModel');
require('../model/NewsModel');

/** Load  Controllers
 */
var DefaultController   = require('../controller/DefaultController'),
	UserController      = require('../controller/UserController'),
	SecretaryController = require('../controller/SecretaryController'),
    TestController      = require('../controller/TestController'),
    SkillController      = require('../controller/SkillController'),
    NewsController      = require('../controller/NewsController');


/**
 * Define Public URLs
 * this public urls will load without authentication component.
 * Basically those URLs will be site assets.
 * This URL can be image, Stylesheet, Javascript file
 */
GLOBAL.publicURLs = ['/images','/css','/web','/fonts','/js'];

/**
 *This URLs will be normal URL that execute out side the authentication component.
 * this URL can be accessed through web browser without login
 */
GLOBAL.AccessAllow = [

    '/','/sign-up','/choose-secretary','/doSignup','/secretaries','/about-you','/establish-connections','/news-categories',
    '/profile-image','/done','/cache-check','/collage-and-job','/profile','/test/:id'

];


/** 
 * Actual Routes Implementation without Authentication
 */
router.post('/doSignup',UserController.doSignup);
router.get('/secretaries',SecretaryController.getSeretaries);

router.get('/cache-check/:key',SecretaryController.cacheCheck);




/**
 * Implement All Test Routs from there
 */

router.get('/test/uploads', TestController.uploadTest);
router.get('/test/get-uploaded-images', TestController.getImageTest);
router.get('/test/send-mail', TestController.sendMailTest);
router.get('/test/get-profile/:email', TestController.getProfile);





//need to be under authentication section. testing purpose have it here. For testing purpose all are set as get request
router.get('/education-info/save', UserController.addEducationDetail);
router.get('/education-info/retrieve', UserController.retrieveEducationDetail);
router.get('/education-info/update', UserController.updateEducationDetail);
router.get('/education-info/delete', UserController.deleteEducationDetail);

// Skills CRUD
router.get('/skills/save', SkillController.addSkills);
router.get('/skills', SkillController.getSkills);
router.get('/skill/:id', SkillController.getSkillById);
router.get('/skills/update', SkillController.updateSkill);
router.get('/skills/delete', SkillController.deleteSkill);



//User's skill add / delete
router.get('/skill-info/save', UserController.saveSkillInfo);

router.post('/collage-and-job/save',UserController.addCollageAndJob);

//For testing purpose all are set as get request
router.get('/forgot-password/request/:email', UserController.forgotPassword);
router.get('/forgot-password/validate/:token', UserController.validateToken);
router.get('/forgot-password/reset/:token', UserController.resetPassword);


//News Category / Channel & News Add / Get All & Delete
router.get('/news/add-category', NewsController.addNewsCategory);
router.get('/news/get-categories', NewsController.getNewsCategories);
router.get('/news/delete-category', NewsController.deleteNewsCategory);

router.get('/news/add-channel', NewsController.addNewsChannel);
router.get('/news/get-channels/:category', NewsController.getNewsChannels);
router.get('/news/delete-channel', NewsController.deleteNewsChannel);

router.get('/news/add-news', NewsController.addNews);
router.get('/news/get-news/:category/:channel', NewsController.getNews);
router.get('/news/delete-news', NewsController.deleteNews);


router.get('/profile/:name', DefaultController.index);

router.get('/get-profile/:uname',UserController.getProfile);

router.get('/news-info/get-categories', UserController.getNewsCategories);
router.get('/news-info/delete-category', UserController.deleteNewsCategory);

router.get('/news-info/add-channel', UserController.addNewsChannel);
router.get('/news-info/get-channels/:category', UserController.getNewsChannels);
router.get('/news-info/delete-channel', UserController.deleteNewsChannel);

/**
 * Push All Rqurst through oAuth
 */
router.all('/*',oAuth.Authentication);


/** 
 * Implement Actual Routes that need to Authenticate
 */

router.post('/secretary/save',UserController.saveSecretary);
router.post('/general-info/save',UserController.saveGeneralInfo);

router.post('/connect-people',UserController.connect);
router.post('/addNewsCategory',UserController.addNewsCategory);
router.post('/upload/profile-image',UserController.uploadProfileImage);
router.get('/connections',UserController.getConnections);
router.get('/connection/count',UserController.connectionCount);



module.exports = router;