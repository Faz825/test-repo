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

require('../model/PostModel');
require('../model/NewsModel');
require('../model/SavedArticleModel');
require('../model/NotificationModel');
require('../model/NotificationRecipientModel');
require('../model/CommentModel');
/** Load  Controllers
 */
var DefaultController   = require('../controller/DefaultController'),
	UserController      = require('../controller/UserController'),
	SecretaryController = require('../controller/SecretaryController'),
    TestController      = require('../controller/TestController'),
    SkillController     = require('../controller/SkillController'),
    NewsController      = require('../controller/NewsController'),
    PostController      = require('../controller/PostController'),
    CommentController   = require('../controller/CommentController') ;



var TestPostController          = require('../test/TestPostController'),
    TestConnectionController    = require('../test/TestConnectionController'),
    TestCommentController    = require('../test/TestCommentController');
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
    '/profile-image','/done','/cache-check','/collage-and-job','/profile','/test/:id','/forgot-password'

];


/** 
 * Actual Routes Implementation without Authentication
 */
router.post('/doSignup',UserController.doSignup);
router.get('/secretaries',SecretaryController.getSeretaries);

router.get('/cache-check/:key',SecretaryController.cacheCheck);

router.post('/doSignin', UserController.doSignin);
//For testing purpose all are set as get request
router.post('/forgot-password/request/', UserController.forgotPassword);
//router.post('/forgot-password/validate/:token', UserController.validateToken);
//router.post('/forgot-password/reset/:token', UserController.resetPassword);




/**
 * Implement All Test Routs from there
 */

router.get('/test/uploads', TestController.uploadTest);
router.get('/test/get-uploaded-images/:id', TestController.getImageTest);
router.get('/test/send-mail', TestController.sendMailTest);
router.get('/test/get-profile/:id', TestController.getProfile);
router.get('/test/get-education/:uname', TestController.retrieveEducationDetail);
router.get('/test/get-workexp/:uname', TestController.retrieveWorkExperience);

router.post('/test/add-post/:id', TestPostController.addPost);
router.get('/test/get-post/:id/:page', TestPostController.ch_getPost);

router.get('/test/es/create-index/:id', TestController.esCreateIndex);
router.get('/test/es/search', TestController.esSearch);

router.get('/test/get-connections/:id', TestConnectionController.getConnection);



router.get('/test/my-connections/:id',TestConnectionController.myConnections);

router.get('/test/save-notification', TestController.saveNotification);
router.get('/test/get-notifications', TestController.getNotifications);
router.get('/test/update-notification', TestController.updateNotification);


router.post('/test/comment/add/:id', TestCommentController.addComment);
router.get('/test/comment/get/:id', TestCommentController.getComment);

router.get('/education-info/save', UserController.addEducationDetail);
router.get('/educations/:uname',UserController.retrieveEducationDetail);
router.get('/education-info/delete', UserController.deleteEducationDetail);


router.get('/work-experiences/:uname', UserController.retrieveWorkExperience);

// Skills CRUD
router.get('/skills/save', SkillController.addSkills);
router.get('/skills', SkillController.getSkills);
router.get('/skill/:id', SkillController.getSkillById);
router.get('/skills/update', SkillController.updateSkill);
router.get('/skills/delete', SkillController.deleteSkill);



//User's skill add / delete
router.get('/skill-info/save', UserController.saveSkillInfo);

router.post('/collage-and-job/save',UserController.addCollageAndJob);


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


router.get('/news-info/save-article', UserController.saveArticle);
router.get('/news-info/get-saved-articles', UserController.getSavedArticles);
router.get('/news-info/delete-saved-articles', UserController.deleteSavedArticle);



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

router.post('/education/update', UserController.updateEducationDetail);


router.post('/work-experience/update', UserController.updateWorkExperience);


router.post('/post/composer', PostController.addPost);
router.get('/pull/posts', PostController.ch_getPost);


router.post('/comment/composer', CommentController.addComment);
router.get('/pull/comments', CommentController.getComment);




module.exports = router;