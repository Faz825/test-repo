
var express = require('express');
var router = express.Router();

var DefaultController   = require('../controller/DefaultController');

/**
 * API Routes that need to authenticate separately
 * All below routes has /mobile part in the beginning of the route
 * Ex: /connections/get  should be  /api/test/connections/get
 */
router.post('/connections/get',DefaultController.dummy);

module.exports = router;
