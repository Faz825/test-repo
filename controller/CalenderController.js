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
    addEvent: function(req,res) {

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
    },

    /**
     * Return all events todos tasks for given month
     * @param req
     * @param res
     * @return Json
     */
    getAllForSpecificMonth: function(req,res) {

        var CurrentSession = Util.getCurrentSession(req);
        var CalenderEvent = require('mongoose').model('CalenderEvent');
        var UserId = CurrentSession.id;
        var moment = require('moment');

        var month = req.query.month;
        var year = req.query.year;

        // month in moment is 0 based, so 9 is actually october, subtract 1 to compensate
        // array is 'year', 'month', 'day', etc
        var startDate = moment([year, month]).add(-1,"month");

        // Clone the value before .endOf()
        var endDate = moment(startDate).endOf('month');

        //console.log(startDate.toDate());
        //console.log(endDate.toDate());


        var criteria =  { start_date_time: {$gte: startDate, $lt: endDate}, status: 1};

        CalenderEvent.getSortedCalenderItems(criteria,function(err, result) {

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
    }
};

module.exports = CalenderController;
