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

        var _async = require('async'),
            CalenderEvent = require('mongoose').model('CalenderEvent'),
            UserId = Util.getCurrentSession(req).id,
            Notification = require('mongoose').model('Notification'),
            NotificationRecipient = require('mongoose').model('NotificationRecipient'),
            notifyUsers = req.params.sharedUserd; //this should be an array

        _async.waterfall([

            function addNewToDb(callBack){
                var eventData = {
                    user_id:UserId,
                    description : req.params.description,
                    type: req.params.type,
                    startDate: req.params.apply_date,
                    event_time: req.params.event_time
                }

                CalenderEvent.addNew(eventData, function(err, result) {
                    callBack(null,result);
                });
            },
            function addNotification(callBack) {

                if(notifyUsers.length > 0){

                    var _data = {
                        sender:UserId,
                        notification_type:Notifications.SHARE_CALENDER,
                    }
                    Notification.saveNotification(_data, function(res){
                        if(res.status == 200){
                            callBack(null,res.result._id);
                        }

                    });

                } else{
                    callBack(null);
                }
            },
            function notifyingUsers(notification_id, callBack) {

                if(typeof notification_id != 'undefined' && notifyUsers.length > 0){

                    var _data = {
                        notification_id:notification_id,
                        recipients:notifyUsers
                    };
                    NotificationRecipient.saveRecipients(_data, function(res){
                        callBack(null);
                    })

                } else{
                    callBack(null);
                }
            }

        ], function(err, resultSet){

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
        var moment = require('moment');

        var day = req.query.day;
        var user_id = Util.toObjectId(CurrentSession.id);
        var startTimeOfDay = moment(day).format('YYYY-MM-DD'); //format the given date as mongo date object
        var endTimeOfDay = moment(day).add(1,"day").format('YYYY-MM-DD'); //get the next day of given date

        var criteria =  { start_date_time: {$gte: startTimeOfDay, $lt: endTimeOfDay }, status: 1, user_id: user_id};

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
