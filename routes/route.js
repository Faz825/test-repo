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
require('../model/NotificationSMSModel');
require('../model/CommentModel');
require('../model/LifeEventModel');
require('../model/LifeEventCategoryModel');
require('../model/LikeModel');
require('../model/NotesModel');
require('../model/NoteBookModel');
require('../model/UsersSavedArticle');
require('../model/SubscribedPosts');
require('../model/NewsChannelsModel');
require('../model/FolderModel');
require('../model/FolderDocsModel');
require('../model/GroupFolderModel');
require('../model/GroupFolderDocsModel');
require('../model/CalendarEventModel');
require('../model/CallModel');
require('../model/GroupsModel');

/** Load  Controllers
 */
var DefaultController   = require('../controller/DefaultController'),
    UserController      = require('../controller/UserController'),
    NewsChannelController      = require('../controller/NewsChannelController'),
    NewsController      = require('../controller/NewsController'),
    PostController      = require('../controller/PostController'),
    CommentController   = require('../controller/CommentController'),
    UploadController    = require('../controller/UploadController'),
    ConnectionController = require('../controller/ConnectionController'),
    LikeController      =  require('../controller/LikeController'),
    NotesController     = require('../controller/NotesController'),
    NotificationController     = require('../controller/NotificationController'),
    NotificationSMSController     = require('../controller/NotificationSMSController'),
    FolderController     = require('../controller/FolderController'),
    GroupFolderController     = require('../controller/GroupFolderController'),
    CalendarController     = require('../controller/CalendarController'),
    CallCenterController     = require('../controller/CallCenterController');
    GroupsController    = require('../controller/GroupsController');


/**
 * Define Public URLs
 * this public urls will load without authentication component.
 * Basically those URLs will be site assets.
 * This URL can be image, Stylesheet, Javascript file
 */
GLOBAL.publicURLs = ['/images','/css','/web','/fonts','/js'];


/**
 * This urls should be outside login. if user logged-in can't see these pages
 */
GLOBAL.notAuthURLs = ['/sign-up','/forgot-password','/change-password-invalid','/changed-password']



/**
 * This urls are related to api and will be authenticated separately
 */
GLOBAL.mobileApiUrls = ['/api/connections/get'];


/**
 *This URLs will be normal URL that execute out side the authentication component.
 * this URL can be accessed through web browser without login
 */
GLOBAL.AccessAllow = [
    '/','/choose-secretary','/doSignup','/doSignin/mob/','/secretaries','/about-you','/establish-connections','/news-categories',
    '/profile-image','/done','/cache-check','/collage-and-job','/test/:id','/news-feed','/news','/chat','/chat/:chatWith','/notes','/notifications','/notes/new-note/:notebook_id',
    '/notes/edit-note/:note_id','/connections', '/connections/mutual/:uname','/profile/:name','/profile/:name/:post','/folders','/doc', '/get-connected-users/', '/work-mode',
    '/get-connected-users/:notebook/:name','/filter-shared-users/:notebook/:name', '/news/channels/:category_id', '/news/channels/:category_id/:channel_name',
    '/calendar','/callcenter'
];

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
router.get('/connections/get',UserController.getConnections);
router.get('/connection/count',UserController.connectionCount);
router.post('/upload/cover-image',UserController.uploadCoverImage);





router.post('/education/update', UserController.updateEducationDetail);


router.post('/work-experience/update', UserController.updateWorkExperience);

router.post('/post/composer', PostController.addPost);
router.post('/post/share', PostController.sharePost);
router.post('/post/profile-image-post', PostController.profileImagePost);
router.post('/post/delete', PostController.deletePost);


router.post('/comment/composer', CommentController.addComment);
router.get('/pull/comments', CommentController.getComment);
router.post('/comment/delete', CommentController.deleteComment);


router.post('/skill-info/save', UserController.saveSkillInfo);

router.post('/ajax/upload/image', UploadController.uploadTimeLinePhoto);
router.post('/ajax/upload/folderDoc', UploadController.uploadFolderDocument);


//CONNECTIONS
router.get('/connection/requests', ConnectionController.getRequestedConnections);
router.get('/connection/me', ConnectionController.getMyConnections);
router.get('/connection/search/:q', ConnectionController.searchConnection);
router.get('/connection/get/:q', ConnectionController.getConnections);
router.get('/connection/me/sort/:option', ConnectionController.getMySortedConnections);
router.get('/connection/me/unfriend', ConnectionController.getMyConnectionsBindUnfriendConnections);
router.get('/connection/get-mutual/:uid', ConnectionController.getMutualConnections);
router.post('/connection/accept', ConnectionController.acceptFriendRequest);
router.post('/connection/unfriend', ConnectionController.unfriendUser);

router.get('/connection/suggestion', ConnectionController.getFriendSuggestion);
router.post('/connection/send-request', ConnectionController.sendFriendRequest);
router.post('/connection/skip-request', ConnectionController.getUniqueFriendRequest);

//NEWS
router.get('/news/get-channels/:category', NewsController.getNewsChannels);
router.get('/news/get-categories', NewsController.getNewsCategories);
router.post('/user/news/add-category', NewsController.addToFavourite);

router.get('/news-info/get-saved-articles', UserController.getSavedArticles);
router.get('/news/get/my/news-articles', NewsController.getMyNews);
router.post('/news/articles/save', NewsController.saveMyNews);

router.get('/news/saved/articles', NewsController.getSavedArticles);

router.post('/news/user-channel/composer', NewsController.addChannelByUser);
router.post('/news/user-channel/remove', NewsController.removeChannelByUser);
router.get('/news/channels/:category_id', NewsChannelController.getChannelByCategory);
router.get('/news/channels/:category_id/:channel_name', NewsChannelController.searchChannelForCategory);

router.post('/like/composer', LikeController.doLike);

router.post('/notes/add-notebook', NotesController.addNoteBook);
router.post('/notes/share-notebook', NotesController.shareNoteBook);
router.post('/notes/add-note', NotesController.addNote);
router.get('/notes/get-notes', NotesController.getNotes);
router.get('/notes/get-note/:note_id', NotesController.getNote);
router.post('/notebook/shared-users', NotesController.getNoteBookSharedUsers);
router.post('/notebook/shared-permission/change', NotesController.updateNoteBookSharedPermissions);
router.post('/notebook/shared-user/remove', NotesController.removeSharedNoteBookUser);
router.post('/notebook/update/shared-users/color', NotesController.updateSharedUsersListColor);
router.post('/notes/update-note', NotesController.updateNote);
router.post('/notes/delete-note', NotesController.deleteNote);
router.post('/introduction/update', UserController.updateIntroduction);
router.get('/introduction/:uname',UserController.retrieveIntroduction);
router.get('/notifications/get-notifications',NotificationController.getNotifications);
router.get('/notifications/get-notifications-list',NotificationController.getNotificationsList);
router.post('/notifications/update-notifications',NotificationController.updateNotifications);
router.post('/notifications/notebook-update',NotificationController.updateNotebookNotifications);
router.post('/notifications/set-notification-sms',NotificationSMSController.setNotificationSMS);
router.get('/notifications/get-details',NotificationController.getDetails);
router.get('/notifications/get-notification-count',NotificationController.getNotificationCount);
router.get('/folders/get-count', FolderController.getCount);
router.post('/folders/add-new', FolderController.addNewFolder);
router.get('/folders/get-all', FolderController.getFolders);
router.post('/group-folders/add-new', GroupFolderController.addNewFolder);
router.get('/group-folders/get-all', GroupFolderController.getFolders);
router.post('/folders/shared-users', FolderController.getSharedUsers);
router.post('/folders/share-folder', FolderController.shareFolder);
router.post('/folder/shared-user/remove', FolderController.removeSharedFolderUser);
router.get('/get-folder-users/:folder/:name', UserController.getFolderUsers);
router.get('/get-folder-users/:folder', UserController.getFolderUsers);
router.post('/folder/shared-permission/change', FolderController.updateFolderSharedPermission);
router.get('/filter-folder-shared-users/:folder/:name', UserController.filterFolderSharedUsers);
router.post('/notifications/folder-update',NotificationController.updateFolderNotifications);
router.post('/document/remove',FolderController.deleteDocument);
router.get('/folder/search/:q', FolderController.searchFolder);
router.get('/folder/get-folder/:folder_id', FolderController.getAFolder);
router.get('/folder/get-document/:folder_id/:document_id', FolderController.getAFolder);

router.post('/calendar/event/add', CalendarController.addEvent);
router.get('/calendar/month/all', CalendarController.getAllForSpecificMonth);
//router.get('/calendar/week/all', CalendarController.getAllForSpecificWeek);
//router.get('/calendar/week/current', CalendarController.getAllEventForCurrentWeek);
//router.get('/calendar/week/next_prev', CalendarController.getAllEventForNextOrPrevWeek);
router.post('/calendar/day/all', CalendarController.getEventsForSpecificDay);
router.post('/calendar/update', CalendarController.updateEvent);
//router.post('/calendar/event/share', CalendarController.shareEvent);
router.post('/calendar/remove/share_user', CalendarController.removeSharedEventUser);
router.post('/calendar/update/event_status', CalendarController.updateEventSharedStatus);
router.get('/calendar/shared_users', CalendarController.getEventSharedUsers);

router.get('/calendar/events/date_range', CalendarController.getAllForDateRange);
router.post('/calendar/event/completion', CalendarController.updateEventCompletion);
router.post('/calendar/event/get', CalendarController.getEvent);

router.get('/user/get-user-suggestions/:name', UserController.getUserSuggestions);

router.get('/call-records', CallCenterController.getCallRecords);


module.exports = router;
