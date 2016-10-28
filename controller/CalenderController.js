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
        var _async = require('async'),
            CalenderEvent = require('mongoose').model('CalenderEvent'),
            UserId = Util.getCurrentSession(req).id,
            Notification = require('mongoose').model('Notification'),
            NotificationRecipient = require('mongoose').model('NotificationRecipient'),
            // notifyUsers = req.params.sharedUserd; //this should be an array
            notifyUsers = []; // TODO: this will be removed after mentions issue will be fixed
        _async.waterfall([

            function addNewToDb(callBack){
                var eventData = {
                    user_id : UserId,
                    description : req.body.description,
                    type: req.body.type == "TODO" ? CalenderTypes.TODO : CalenderTypes.EVENT,
                    start_date: req.body.apply_date,
                    event_time: req.body.event_time,
                    event_timezone: req.body.event_timezone
                }

                CalenderEvent.addNew(eventData, function(event) {
                    callBack(null, event);
                });
            },
            function addNotification(event, callBack) {

                if(typeof notifyUsers != 'undefined' && notifyUsers.length > 0){
                    var _data = {
                        sender:UserId,
                        notification_type:Notifications.SHARE_CALENDER,
                    }
                    Notification.saveNotification(_data, function(res){
                        if(res.status == 200){
                            callBack(null, res.result._id, event);
                        }

                    });

                } else {
                    callBack(null, null, event);
                }
            },
            function notifyingUsers(notification_id, event, callBack) {

                if(typeof notification_id != 'undefined' && notifyUsers.length > 0){
                    var _data = {
                        notification_id:notification_id,
                        recipients:notifyUsers
                    };
                    NotificationRecipient.saveRecipients(_data, function(res){
                        callBack(null, event);
                    })

                } else{
                    callBack(null, event);
                }
            }

        ], function(err, resultSet){

            var outPut ={};
            if(err) {
                outPut['status'] = ApiHelper.getMessage(400, Alert.COMMENT_POST_ID_EMPTY, Alert.ERROR);
                res.status(400).send(outPut);
            } else {
                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['events'] = resultSet.event;
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
        var day = req.body.day;
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
     * Update events for a given id
     * @param req
     * @param res
     * @return Json
     */
    updateEvent: function(req,res) {

        var CurrentSession = Util.getCurrentSession(req);
        var CalenderEvent = require('mongoose').model('CalenderEvent');
        var moment = require('moment');
        var _async = require('async');

        var event_id = req.query.id;
        event_id = Util.toObjectId(event_id);
        var user_id = Util.toObjectId(CurrentSession.id);

        _async.waterfall([
            function getEvents(callBack){
                CalenderEvent.getEventById(event_id,function(resultSet){
                    callBack(null, resultSet);
                });
            },
            function updateEvent(resultSet, callBack){
                var criteria={
                    _id:event_id
                };
                var updateData = {
                    start_date_time:moment(resultSet.start_date_time).add(1,"day").format('YYYY-MM-DD')
                };
                console.log(updateData);
                CalenderEvent.updateEvent(criteria, updateData,function(res) {
                    callBack(null,res);
                });
            }
        ],function(err, resultSet){
            var outPut ={};
            if(err) {
                outPut['status'] = ApiHelper.getMessage(400, err);
                res.status(400).send(outPut);
            } else {
                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['event'] = resultSet.event;
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
