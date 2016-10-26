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
        var user_id = Util.toObjectId(UserId);

        // month in moment is 0 based, so 9 is actually october, subtract 1 to compensate
        // array is 'year', 'month', 'day', etc
        var startDate = moment([year, month]).add(-1,"month");

        // Clone the value before .endOf()
        var endDate = moment(startDate).endOf('month');

        var criteria =  { start_date_time: {$gte: startDate, $lt: endDate}, status: 1, user_id: user_id};

        CalenderEvent.getSortedCalenderItems(criteria,function(err,result) {

            var outPut ={};
            if(err) {
                outPut['status'] = ApiHelper.getMessage(400, Alert.CALENDER_MONTH_EMPTY, Alert.ERROR);
                res.status(400).send(outPut);
            } else {
                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['events'] = result.events;
                res.status(200).send(outPut);
            }
        });
    },

    /**
     * Return all events todos tasks for given week
     * @param req
     * @param res
     * @return Json
     */
    getAllForSpecificWeek: function(req,res) {

        var CurrentSession = Util.getCurrentSession(req);
        var CalenderEvent = require('mongoose').model('CalenderEvent');
        var UserId = CurrentSession.id;
        var moment = require('moment');
        var user_id = Util.toObjectId(UserId);

        var week = req.query.week;
        var month = req.query.month;
        var year = req.query.year;

        var startDateOfWeek = moment([year, month]).add(-1,"month").add((week-1)*7,"day");
        var endDateOfWeek = moment([year, month]).add(-1,"month").add(week*7,"day");
        endDateOfWeek = endDateOfWeek.add(1,"day").subtract(1,"millisecond");//last millisecond of the day
        // limit the 5th week within the month
        if(week == 5){
            var startDate = moment([year, month]).add(-1,"month");
            endDateOfWeek =  moment(startDate).endOf('month');
            endDateOfWeek = endDateOfWeek.subtract(1,"millisecond");//last millisecond of the day
        }

        var criteria =  { start_date_time: {$gte: startDateOfWeek, $lt: endDateOfWeek }, status: 1, user_id: user_id};

        CalenderEvent.getSortedCalenderItems(criteria,function(err, result) {

            var outPut ={};
            if(err) {
                outPut['status'] = ApiHelper.getMessage(400, Alert.CALENDER_WEEK_EMPTY, Alert.ERROR);
                res.status(400).send(outPut);
            } else {
                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['events'] = result.events;
                res.status(200).send(outPut);
            }
        });
    },

    /**
     * Return all events of a given day
     * @param req
     * @param res
     * @return Json
     */
    getEventsForSpecificDay: function(req,res) {

        var CurrentSession = Util.getCurrentSession(req);
        var CalenderEvent = require('mongoose').model('CalenderEvent');
        var UserId = CurrentSession.id;
        var moment = require('moment');

        var month = req.query.day;
        var user_id = Util.toObjectId(UserId);

        console.log(" ERAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA ");
    },

    /**
     * Return all events of the loggedin user.
     * @param req
     * @param res
     * @return Json
     */
    getUserSuggestion : function(req,res) {

        var CurrentSession = Util.getCurrentSession(req);
        var User = require('mongoose').model('User');
        var UserId = CurrentSession.id;
        var criteria = {
            user_id : UserId,
            status : 3
        };

        User.getConnectionUsers(criteria,function(err, result) {
            
            var outPut ={};
            if(err) {
                outPut['status'] = ApiHelper.getMessage(400, Alert.COMMENT_POST_ID_EMPTY, Alert.ERROR);
                res.status(400).send(outPut);
            } else {
                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['users'] = result.friends;
                res.status(200).send(outPut);
            }
        });
    }
};

module.exports = CalenderController;
