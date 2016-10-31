'use strict';

/**
 * The Calender Controller
 */
var CalenderController = {

    /**
     * Return all events of the loggedin user.
     * @param req
     * @param res
     * @return Json
     */
    getEvents: function(req,res) {

        var CurrentSession = Util.getCurrentSession(req);
        var UserId = CurrentSession.id;
        var outPut = {
            status : ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
            news : null
        }
        res.status(200).json(outPut);
    }
};

module.exports = NewsController;
