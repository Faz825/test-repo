var express = require('express');
var router = express.Router(),
    TestController   = require('../controller/TestController');

/* GET users listing. */
router.get('/uploads', TestController.uploadTest);
router.get('/get-uploaded-images', TestController.getImageTest);
router.get('/send-mail', TestController.sendMailTest);

module.exports = router;
