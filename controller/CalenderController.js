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
        var CalenderEvent = require('mongoose').model('CalenderEvent');
        var UserId = CurrentSession.id;

        CalenderEvent.get({},{},{},function(err, result) {
            
            var outPut ={};
            if(err) {
                outPut['status'] = ApiHelper.getMessage(400, Alert.COMMENT_POST_ID_EMPTY, Alert.ERROR);
                res.status(400).send(outPut);
            } else {
                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['events'] = result.events;
                res.status(200).send(outPut);
            }
        });
    },

    /**
     * This action creates a Event based on the parameters we are sending.
     * @param req
     * @param res
     * @return Json
     */
    add: function(req,res) {

        var CurrentSession = Util.getCurrentSession(req);
        var CalenderEvent = require('mongoose').model('CalenderEvent');
        var UserId = CurrentSession.id;

        var eventData = {
            description : req.params.description,
            type: req.params.type
        }

        CalenderEvent.add(eventData, function(err, result) {
            
            var outPut ={};
            if(err) {
                outPut['status'] = ApiHelper.getMessage(400, Alert.COMMENT_POST_ID_EMPTY, Alert.ERROR);
                res.status(400).send(outPut);
            } else {
                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['events'] = result.life_events;
                res.status(200).send(outPut);
            }
        });
    }
};

module.exports = CalenderController;
