'use strict';

/**
 * The Calender Controller
 */
var CalendarController = {

    /**
     * Return all events of the loggedin user.
     * @param req
     * @param res
     * @return Json
     */
    getEvents: function(req,res) {

        var CurrentSession = Util.getCurrentSession(req);
        var CalendarEvent = require('mongoose').model('CalendarEvent');
        var UserId = CurrentSession.id;

        CalendarEvent.get({},{},{},function(err, result) {
            
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
            CalendarEvent = require('mongoose').model('CalendarEvent'),
            UserId = Util.getCurrentSession(req).id,
            Notification = require('mongoose').model('Notification'),
            NotificationRecipient = require('mongoose').model('NotificationRecipient'),
            notifyUsers = (typeof req.body.shared_users != 'undefined' ? req.body.shared_users : []); //this should be an array
        _async.waterfall([

            function addNewToDb(callBack){

                var sharedUserList = [];

                if(typeof notifyUsers != 'undefined' && notifyUsers.length > 0) {
                    for (var i = 0; notifyUsers.length > i; i++) {
                        var obj = {
                            user_id:notifyUsers[i],
                            share_type:CalendarSharedStatus.REQUEST_PENDING
                        }
                        sharedUserList.push(obj);
                    }
                }

                var eventData = {
                    user_id : UserId,
                    description : req.body.description,
                    type: (req.body.type == "todo" ? CalendarTypes.TODO : CalendarTypes.EVENT),
                    start_date: req.body.apply_date,
                    event_time: req.body.event_time,
                    event_timezone: req.body.event_timezone,
                    shared_users: sharedUserList
                };

                CalendarEvent.addNew(eventData, function(event) {
                    callBack(null, event);
                });
            },
            function addNotification(event, callBack) {

                if(typeof notifyUsers != 'undefined' && notifyUsers.length > 0){
                    var _data = {
                        sender:UserId,
                        notification_type:Notifications.SHARE_CALENDAR,
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
        var CalendarEvent = require('mongoose').model('CalendarEvent');
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

        CalendarEvent.getSortedCalenderItems(criteria,function(err,result) {

            var outPut ={};
            if(err) {
                outPut['status'] = ApiHelper.getMessage(400, Alert.CALENDAR_MONTH_EMPTY, Alert.ERROR);
                res.status(400).send(outPut);
            } else {
                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['events'] = result.events;
                res.status(200).send(outPut);
            }
        });
    },

    /**
     * Return all events todos tasks for given date range
     * @param req
     * @param res
     * @return Json
     */
    getAllForDateRange: function(req,res) {

        var CurrentSession = Util.getCurrentSession(req);
        var CalendarEvent = require('mongoose').model('CalendarEvent');
        var UserId = CurrentSession.id;
        var moment = require('moment');

        var start_date = req.query.start_date;
        var end_date = req.query.end_date;
        var user_id = Util.toObjectId(UserId);

        // month in moment is 0 based, so 9 is actually october, subtract 1 to compensate
        // array is 'year', 'month', 'day', etc
        var startDate = moment(start_date).format('YYYY-MM-DD');

        // Clone the value before .endOf()
        var endDate = moment(end_date).format('YYYY-MM-DD');

        var criteria =  { start_date_time: {$gte: startDate, $lt: endDate}, status: 1, user_id: user_id};

        CalendarEvent.getSortedCalenderItems(criteria,function(err,result) {

            var outPut ={};
            if(err) {
                outPut['status'] = ApiHelper.getMessage(400, Alert.CALENDAR_MONTH_EMPTY, Alert.ERROR);
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
        var CalendarEvent = require('mongoose').model('CalendarEvent');

        var data ={};
        data['week'] = req.query.week;
        data['month'] = req.query.month;
        data['year'] = req.query.year;
        data['user_id'] = Util.toObjectId(CurrentSession.id);

        CalendarEvent.getWeeklyCalenderEvens(data,function(err, result) {
            var outPut ={};
            if(err) {
                outPut['status'] = ApiHelper.getMessage(400, Alert.CALENDAR_WEEK_EMPTY, Alert.ERROR);
                res.status(400).send(outPut);
            } else {
                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['events'] = result.events;
                outPut['week'] = result.week;
                outPut['days'] = result.days;
                res.status(200).send(outPut);
            }
        });
    },

    /**
     * Return all events todos tasks for current week
     * @param req
     * @param res
     * @return Json
     */
    getAllEventForCurrentWeek: function(req,res) {
        var moment = require('moment');
        var CurrentSession = Util.getCurrentSession(req);
        var CalendarEvent = require('mongoose').model('CalendarEvent');

        var data ={};
        data['week'] = Math.ceil(moment().format('DD')/7);
        data['month'] = moment().format('MM');
        data['year'] = moment().format('YYYY');
        data['user_id'] = Util.toObjectId(CurrentSession.id);

        CalendarEvent.getWeeklyCalenderEvens(data,function(err, result) {
            var outPut ={};
            if(err) {
                outPut['status'] = ApiHelper.getMessage(400, Alert.CALENDAR_WEEK_EMPTY, Alert.ERROR);
                res.status(400).send(outPut);
            } else {
                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['events'] = result.events;
                outPut['week'] = result.week;
                outPut['days'] = result.days;
                res.status(200).send(outPut);
            }
        });
    },

    /**
     * Return all events todos tasks for next or previous week
     * @param req
     * @param res
     * @return Json
     */
    getAllEventForNextOrPrevWeek: function(req,res) {
        var moment = require('moment');
        var CurrentSession = Util.getCurrentSession(req);
        var CalendarEvent = require('mongoose').model('CalendarEvent');

        var data ={}, startDateOfWeek,endDateOfWeek;
        data['date'] = req.query.date;
        data['action'] = req.query.action;
        data['user_id'] = Util.toObjectId(CurrentSession.id);
        data['current_month'] = moment(data['date'], 'YYYY-MM-DD').format('MM');
        data['current_year'] = moment(data['date'], 'YYYY-MM-DD').format('YYYY');

        if(data['action'] == 'next'){
            startDateOfWeek = moment(data['date'], 'YYYY-MM-DD').add(7,'day').format('YYYY-MM-DD');
        }else{
            startDateOfWeek = moment(data['date'], 'YYYY-MM-DD').subtract(7,'day').format('YYYY-MM-DD');
        }

        data['week'] = Math.ceil(moment(startDateOfWeek).format('DD')/7);
        data['month'] = moment(startDateOfWeek).format('MM');
        data['year'] = moment(startDateOfWeek).format('YYYY');

        if(data['current_month'] != data['month'] || data['current_year'] != data['year']){
            if(data['current_year'] != data['year']){
                if(data['current_year'] > data['year']){
                    data['week'] = Math.ceil(moment(startDateOfWeek).endOf('month').format('DD')/7);
                }else{
                    data['week'] = Math.ceil(moment(startDateOfWeek).startOf('month').format('DD')/7);
                }
            }else{
                if(data['current_month'] > data['month']){
                    data['week'] = Math.ceil(moment(startDateOfWeek).endOf('month').format('DD')/7);
                }else{
                    data['week'] = Math.ceil(moment(startDateOfWeek).startOf('month').format('DD')/7);
                }
            }

        }

            CalendarEvent.getWeeklyCalenderEvens(data,function(err, result) {
            var outPut ={};
            if(err) {
                outPut['status'] = ApiHelper.getMessage(400, Alert.CALENDAR_WEEK_EMPTY, Alert.ERROR);
                res.status(400).send(outPut);
            } else {
                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['events'] = result.events;
                outPut['week'] = result.week;
                outPut['days'] = result.days;
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
        var CalendarEvent = require('mongoose').model('CalendarEvent');
        var moment = require('moment');
        var day = req.body.day;

        var user_id = Util.toObjectId(CurrentSession.id);
        var startTimeOfDay = moment(day, 'YYYY-MM-DD').format('YYYY-MM-DD'); //format the given date as mongo date object
        var endTimeOfDay = moment(day, 'YYYY-MM-DD').add(1,"day").format('YYYY-MM-DD'); //get the next day of given date
        var _async = require('async');

        var criteria =  { start_date_time: {$gte: startTimeOfDay, $lt: endTimeOfDay }, user_id: user_id};
        _async.waterfall([

            function getSortedCalenderItems(callback){
                CalendarEvent.getSortedCalenderItems(criteria, function(err, result) {
                    
                    var events = [];
                    if(err) {
                        callback(err, null)
                    } else {
                        events = result.events;
                        callback(null, events)
                    }
                });
            },

            function getUsers(events, callback) {
                
                var criteria = {
                    user_id: user_id,
                    status: 3
                };
                var User = require('mongoose').model('User');
                User.getConnectionUsers(criteria, function (result) {
                    var friends = result.friends;
                    callback(null, events, friends);
                });
            },

            function composeUsers(events, users, callback) {
                
                if(events.length == 0) {
                    callback(null, []);
                }

                for (var e = 0; e < events.length; e++) {
                    
                    var event = events[e];  
                    var sharedUsers = event.shared_users;

                    if(sharedUsers.length == 0) {
                        if(e+1 == (events.length)) {
                            callback(null, events)

                        }
                    }

                    var arrUsers = [];
                    for (var u = 0; u < sharedUsers.length ; u++) {
                        var userId = sharedUsers[u].user_id;


                        var filterObj = users.filter(function(e) {
                          return e.user_id == userId;
                        });

                        var user = {
                            'id' : userId,
                            'name' : 'Unknown'
                        };

                        if(filterObj) {
                            user.name = filterObj[0].first_name+" "+filterObj[0].last_name; 
                        }

                        arrUsers.push(user);
                        events[e].shared_users = arrUsers;

                        if(u+1 == sharedUsers.length && e+1 == events.length) {
                            callback(null, events);
                        }
                    }
                }
            }
        ],function(err, events){
            var outPut = {};
            outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
            outPut['events'] = events;
            res.status(200).send(outPut);
            return;
        });
    },

    /**
     * Update events for a given id
     * @param req
     * @param res
     * @return Json
     */
    updateEvent: function(req,res) {

        var CalendarEvent = require('mongoose').model('CalendarEvent'),
            Notification = require('mongoose').model('Notification'),
            NotificationRecipient = require('mongoose').model('NotificationRecipient');
        var moment = require('moment');
        var _async = require('async');

        var event_id = req.query.id;
        event_id = Util.toObjectId(event_id);

        var user_id = Util.getCurrentSession(req).id,
            shareUsers = (typeof req.body.shared_users != 'undefined' ? req.body.shared_users : []), //this should be an array
            isTimeChanged=(typeof req.body.time_changed != 'undefined' ? req.body.time_changed : false),
            _description = req.body.description,
            _start_date_time= req.body.apply_date,
            _event_time= req.body.event_time;

        var sharedUserList = [], notifyUsers = [];

        _async.waterfall([
            function getEvents(callBack){
                CalendarEvent.getEventById(event_id,function(resultSet){
                    callBack(null, resultSet);
                });
            },
            function compareSharedUsers(resultSet, callBack) {

                if(typeof resultSet != 'undefined') {

                    if(typeof shareUsers != 'undefined' && shareUsers.length > 0) {

                        /*
                         * If time changed then all user should be requested again
                         * So all user request set as PENDING again
                         */
                        if(isTimeChanged == true) {
                            for (var i = 0; shareUsers.length > i; i++) {
                                var obj = {
                                    user_id:shareUsers[i],
                                    share_type:CalendarSharedStatus.REQUEST_PENDING
                                };
                                sharedUserList.push(obj);
                                notifyUsers.push(shareUsers[i]);
                            }

                        } else {

                            /*
                             * There might be shared users, so their request status kept as it is.
                             * For new shared users request will save as PENDING
                             */
                            for (var i = 0; shareUsers.length > i; i++) {

                                if(typeof resultSet.shared_users != 'undefined' && resultSet.shared_users.length > 0) {

                                    var filterObj = resultSet.shared_users.filter(function(e) {
                                        return e.user_id.toString() == shareUsers[i].toString();
                                    });
                                    if(typeof filterObj != 'undefined' && filterObj.user_id) {
                                        sharedUserList.push(filterObj);
                                    } else {
                                        var obj = {
                                            user_id:shareUsers[i],
                                            share_type:CalendarSharedStatus.REQUEST_PENDING
                                        };
                                        sharedUserList.push(obj);
                                        notifyUsers.push(shareUsers[i]);
                                    }

                                } else {
                                    var obj = {
                                        user_id:shareUsers[i],
                                        share_type:CalendarSharedStatus.REQUEST_PENDING
                                    };
                                    sharedUserList.push(obj);
                                    notifyUsers.push(shareUsers[i]);
                                }
                            }
                        }
                    }

                    var updateData = {
                        description : _description,
                        start_date_time: _start_date_time,
                        event_time: _event_time,
                        shared_users: sharedUserList
                    };

                    callBack(null, updateData);

                } else {
                    callBack(null, null);
                }
            },
            function updateDbEvent(updateData, callBack){
                var criteria={
                    _id:event_id
                };

                CalendarEvent.updateEvent(criteria, updateData, function (res) {
                    callBack(null, res.status);
                });
            },
            function addNotification(stt, callBack) {

                if(typeof notifyUsers != 'undefined' && notifyUsers.length > 0 && stt != 200){
                    var _data = {
                        sender:user_id,
                        notification_type: isTimeChanged == true ? Notifications.SHARE_CALENDAR_TIME_CHANGED : Notifications.SHARE_CALENDAR_UPDATED,
                    }
                    Notification.saveNotification(_data, function(res){
                        if(res.status == 200){
                            callBack(null, res.result._id);
                        }

                    });

                } else {
                    callBack(null, null);
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
        ], function(err) {
            var outPut ={};
            if(err) {
                outPut['status'] = ApiHelper.getMessage(400, err);
                res.status(400).send(outPut);
            } else {
                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
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
            CalendarEvent = require('mongoose').model('CalendarEvent'),
            CurrentSession = Util.getCurrentSession(req),
            Notification = require('mongoose').model('Notification'),
            NotificationRecipient = require('mongoose').model('NotificationRecipient');

        var eventId = req.body.eventId;
        var event_Id = Util.toObjectId(req.body.eventId);
        var notifyUsers = req.body.userId;

        _async.waterfall([
            function getEvent(callBack) {
                var event = CalendarEvent.getEventById(event_Id, function (resultSet) {
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
                                shared_status: CalendarStatus.PENDING
                            };
                            sharedUsers.push(_sharingUser);
                            var _sharedUsers = {
                                shared_users: sharedUsers
                            }
                            CalendarEvent.shareEvent(event_Id, _sharedUsers, function (resultS) {
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
                                notification_type: Notifications.SHARE_CALENDAR,
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
            CalendarEvent = require('mongoose').model('CalendarEvent'),
            User = require('mongoose').model('User'),
            CurrentSession = Util.getCurrentSession(req),
            eventId = req.query.eventId;

        var event_Id = Util.toObjectId(req.query.eventId);
        var dataArray = [];

        _async.waterfall([
            function getEevent(callBack){
                CalendarEvent.getEventById(event_Id,function(resultSet){
                    callBack(null,resultSet);
                });
            },
            function getSharedUsers(resultSet, callBack) {
                if (typeof resultSet.shared_users != 'undefined' && resultSet.shared_users.length > 0) {
                    var sharedUsers = resultSet.shared_users;
                    _async.each(sharedUsers, function(sharedUser, callBack){

                        if(sharedUser.shared_status == CalendarStatus.PENDING || sharedUser.shared_status == CalendarStatus.COMPLETED) {
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

        var  CalendarEvent = require('mongoose').model('CalendarEvent'),
            _async = require('async'),
            own_user_id = Util.getCurrentSession(req).id,
            _arrIndex = require('array-index-of-property');


        var event_id = Util.toObjectId(req.body.eventId),
            shared_user_id = req.body.userId;
        var sharedUsers = [];
        var oldSharedUserList = [];

        _async.waterfall([
            function getEvent(callBack) {
                var event = CalendarEvent.getEventById(event_id, function (resultSet) {
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
                CalendarEvent.updateSharedEvent(criteria, _udata, function(err,result){
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

        var  CalendarEvent = require('mongoose').model('CalendarEvent'),
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

        CalendarEvent.updateSharedEvent(criteria, _udata, function(result){
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
    },

    /**
     * Update events for a given id
     * @param req
     * @param res
     * @return Json
     */
    updateEventCompletion: function(req,res) {
        
        var CurrentSession = Util.getCurrentSession(req);
        var CalendarEvent = require('mongoose').model('CalendarEvent');
        var moment = require('moment');
        var _async = require('async');

        var event_id = req.body.id;
        var status = req.body.status;
        event_id = Util.toObjectId(event_id);
        var user_id = Util.toObjectId(CurrentSession.id);

        _async.waterfall([
            function getEvents(callBack){
                CalendarEvent.getEventById(event_id,function(resultSet){
                    callBack(null, resultSet);
                });
            },
            function updateEvent(resultSet, callBack){
                var criteria={
                    _id:event_id
                };
                var updateData = {
                    status:status
                };
                CalendarEvent.updateEvent(criteria, updateData, function (res) {
                    callBack(null);
                });
            }
        ],function(err){
            var outPut ={};
            if(err) {
                outPut['status'] = ApiHelper.getMessage(400, err);
                res.status(400).send(outPut);
            } else {
                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                res.status(200).send(outPut);
            }
        });
    },
};

module.exports = CalendarController;
