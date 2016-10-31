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
        var moment = require('moment');
        var user_id = Util.toObjectId(CurrentSession.id);

        var week = req.query.week;
        var month = req.query.month;
        var year = req.query.year;
        return CalenderController.getDefaultWeekEvent(req,res,week,month,year,user_id);
    },

    /**
     * Return all events todos tasks for default week
     * @param req
     * @param res
     * @return Json
     */
    getAllForDefaultWeek: function(req,res) {
        var moment = require('moment');
        var CurrentSession = Util.getCurrentSession(req);
        var user_id = Util.toObjectId(CurrentSession.id);

        var week = Math.ceil(moment().format('DD')/7);
        var month = moment().format('MM');
        var year = moment().format('YYYY');

        return CalenderController.getDefaultWeekEvent(req,res,week,month,year,user_id);
    },

    /**
     * process and return all even for a week provided week from database
     * @param req
     * @param res
     * @param week
     * @param month
     * @param year
     * @param user_id
     */
    getDefaultWeekEvent: function(req,res,week,month,year,user_id) {

        var CalenderEvent = require('mongoose').model('CalenderEvent');
        var moment = require('moment');


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
                CalenderEvent.updateEvent(criteria, updateData, function (res) {
                    callBack(null, res);
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
     * Share an event within users
     * @param req
     * @param res
     */
    shareEvent: function (req, res) {

        var _async = require('async'),
            CalenderEvent = require('mongoose').model('CalenderEvent'),
            CurrentSession = Util.getCurrentSession(req),
            Notification = require('mongoose').model('Notification'),
            NotificationRecipient = require('mongoose').model('NotificationRecipient');

        var eventId = req.body.eventId;
        var event_Id = Util.toObjectId(req.body.eventId);
        var notifyUsers = req.body.userId;

        _async.waterfall([
            function getEvent(callBack) {
                var event = CalenderEvent.getEventById(event_Id, function (resultSet) {
                    callBack(null, resultSet);
                });
            },
            function shareEvent(resultSet, callBack) {
                var sharedUsers = resultSet.shared_users;
                _async.waterfall([
                    function saveDB(callBack) {
                        _async.each(notifyUsers, function (notifyUser, callBack) {
                            var _sharingUser = {
                                user_id: notifyUser,
                                shared_status: CalenderStatus.PENDING
                            };
                            sharedUsers.push(_sharingUser);
                            var _sharedUsers = {
                                shared_users: sharedUsers
                            }
                            CalenderEvent.shareEvent(event_Id, _sharedUsers, function (resultS) {
                                callBack(null);
                            });


                        }, function (err) {
                            callBack(null);
                        });
                    },
                    function addNotification(callBack) {

                        if (typeof notifyUsers != 'undefined' && notifyUsers.length > 0) {

                            var _data = {
                                sender: CurrentSession.id,
                                notification_type: Notifications.SHARE_CALENDER,
                                notified_event: event_Id
                            };
                            Notification.saveNotification(_data, function (results) {
                                if (results.status == 200) {
                                    callBack(null, results.result._id);
                                } else {
                                    callBack(null);
                                }
                            });

                        } else {
                            callBack(null);
                        }
                    },
                    function notifyingUsers(notification_id, callBack) {

                        if (typeof notification_id != 'undefined' && notifyUsers.length > 0) {

                            var _data = {
                                notification_id: notification_id,
                                recipients: notifyUsers
                            };
                            NotificationRecipient.saveRecipients(_data, function (res) {
                                callBack(null);
                            })

                        } else {
                            callBack(null);
                        }
                    }
                ], function (err, resultSet) {
                    callBack(null,null);
                });
            },
        ], function (err, resultSet) {
            if (err) {
                status: ApiHelper.getMessage(400, err)
            }
            var outPut = {
                status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                events: resultSet
            }
            res.status(200).json(outPut);
        });

    },

    /**
     * get shared users for a event
     * @param req
     * @param res
     */
    getEventSharedUsers:function(req,res){

        var _async = require('async'),
            CalenderEvent = require('mongoose').model('CalenderEvent'),
            User = require('mongoose').model('User'),
            CurrentSession = Util.getCurrentSession(req),
            eventId = req.query.eventId;

        var event_Id = Util.toObjectId(req.query.eventId);
        var dataArray = [];

        _async.waterfall([
            function getEevent(callBack){
                CalenderEvent.getEventById(event_Id,function(resultSet){
                    callBack(null,resultSet);
                });
            },
            function getSharedUsers(resultSet, callBack) {
                if (typeof resultSet.shared_users != 'undefined' && resultSet.shared_users.length > 0) {
                    var sharedUsers = resultSet.shared_users;
                    _async.each(sharedUsers, function(sharedUser, callBack){

                        if(sharedUser.shared_status == CalenderStatus.PENDING || sharedUser.shared_status == CalenderStatus.COMPLETED) {
                            var usrObj = {};
                            _async.waterfall([

                                function getEsSharedUsers(callBack){
                                    var query={
                                        q:"user_id:"+sharedUser.user_id.toString(),
                                        index:'idx_usr'
                                    };
                                    //Find User from Elastic search
                                    ES.search(query,function(csResultSet){
                                            if(typeof csResultSet.result != 'undefined' && csResultSet.result_count > 0){
                                                usrObj.user_name = csResultSet.result[0]['first_name']+" "+csResultSet.result[0]['last_name'];
                                                usrObj.profile_image = csResultSet.result[0]['images']['profile_image']['http_url'];
                                            }else{
                                                usrObj.user_name = null;
                                                usrObj.profile_image = null;
                                            }

                                        callBack(null);
                                    });

                                },
                                function getSharedUserMoreDetails(callBack) {
                                    var criteria = {_id:sharedUser.user_id.toString()},
                                        showOptions ={
                                            w_exp:true,
                                            edu:true
                                        };

                                    User.getUser(criteria,showOptions,function(resultSet){

                                        usrObj.country = resultSet.user.country;
                                        if(typeof resultSet.user.education_details[0] != 'undefined' && resultSet.user.education_details.length > 0){
                                            usrObj.school = resultSet.user.education_details[0].school;
                                            usrObj.degree = resultSet.user.education_details[0].degree;
                                        }
                                        if(typeof resultSet.user.working_experiences[0] != 'undefined' && resultSet.user.working_experiences.length > 0){
                                            usrObj.company_name = resultSet.user.working_experiences[0].company_name;
                                            usrObj.company_location = resultSet.user.working_experiences[0].location;
                                        }
                                        callBack(null);
                                    })
                                },
                                function finalFunction(callBack) {

                                    usrObj.user_id = sharedUser.user_id;
                                    usrObj.event_id = eventId;
                                    usrObj.shared_status = sharedUser.shared_status;

                                    dataArray.push(usrObj);
                                    callBack(null);
                                }

                            ], function(err) {
                                callBack(null);
                            });

                        }else{
                            callBack(null);
                        }

                    },function(err){
                        callBack(null);
                    });
                }else{
                    callBack(null);
                }
            }
        ],function(err){
            var outPut ={
                status:ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                results: dataArray
            };
            res.status(200).json(outPut);
        })
    },

    /**
     * event owner can remove shared users from db
     * @param req
     * @param res
     */
    removeSharedEventUser:function(req,res){

        var  CalenderEvent = require('mongoose').model('CalenderEvent'),
            _async = require('async'),
            own_user_id = Util.getCurrentSession(req).id,
            _arrIndex = require('array-index-of-property');


        var event_id = Util.toObjectId(req.body.eventId),
            shared_user_id = req.body.userId;
        var sharedUsers = [];
        var oldSharedUserList = [];

        _async.waterfall([
            function getEvent(callBack) {
                var event = CalenderEvent.getEventById(event_id, function (resultSet) {
                    callBack(null, resultSet);
                });
            },
            function updateInDB(resultSet,callBack){
                sharedUsers = resultSet.shared_users;
                oldSharedUserList = resultSet.shared_users;
                var index = sharedUsers.indexOfProperty('user_id', shared_user_id);

                if(index != -1) {
                    sharedUsers.splice(index, 1);
                }
                var _udata = {
                    'shared_users':sharedUsers
                };
                var criteria = {
                    _id:event_id,
                    user_id:Util.toObjectId(own_user_id),
                    'shared_users.user_id':shared_user_id
                };
                CalenderEvent.updateSharedEvent(criteria, _udata, function(err,result){
                    if (result.status == 200) {
                        callBack(null, result);
                    } else {
                        callBack(null);
                    }
                });
            }
        ],function(err, result){
            var outPut ={
                status:ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                update_status:result
            };
            res.status(200).json(outPut);
        })


    },

    /**
     * accept shared event by shared user
     * @param req
     * @param res
     */
    updateEventSharedStatus:function(req,res){

        var  CalenderEvent = require('mongoose').model('CalenderEvent'),
            _async = require('async'),
            user_id = Util.getCurrentSession(req).id;

        var shared_status = req.body.shared_status,
            event_id = req.body.eventId;

        var _udata = {
            'shared_users.$.shared_status':shared_status
        };
        var criteria = {
            _id:Util.toObjectId(event_id),
            'shared_users.user_id':user_id
        };

        CalenderEvent.updateSharedEvent(criteria, _udata, function(result){
            var outPut ={
                status:ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                result: result
            };
            res.status(200).json(outPut);
        });
    },

    /**
     * Return all events of the loggedin user.
     * @param req
     * @param res
     * @return Json
     */
    getUserSuggestion: function (req, res) {

        var CurrentSession = Util.getCurrentSession(req);
        var User = require('mongoose').model('User');
        var UserId = CurrentSession.id;
        var criteria = {
            user_id: UserId,
            status: 3
        };

        User.getConnectionUsers(criteria, function (err, result) {

            var outPut = {};
            if (err) {
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
