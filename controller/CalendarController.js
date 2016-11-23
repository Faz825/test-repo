'use strict';

/**
 * The Calender Controller
 */
var CalendarController = {

    /**
     * Return a specific event by a given ID
     * @param req
     * @param res
     * @return Json
    */
    getEvent: function(req,res) {

        var eventId = req.body.eventId;
        var CalendarEvent = require('mongoose').model('CalendarEvent');
        var User = require('mongoose').model('User');
        var _async = require('async');
        _async.waterfall([
            function getEvent(callBack){
                CalendarEvent.getEventById(eventId, function(result) {
                    if(result.error) {
                        callBack(result.error, null);
                    }
                    callBack(null, result);
                });
            },

            function getUser(event, callBack) {
                event.sharedWithNames = [];
                event.sharedWithIds = [];
                var arrUsers = event.shared_users;
                var arrNames = [];
                var arrIds = [];

                if(arrUsers.length == 0) {
                    callBack(null, event);
                }

                var fetched = 0;
                for (var i = 0; i < arrUsers.length; i++) {
                    var objUser = arrUsers[i];
                    var name = "";
                    User.findUser({_id: objUser.user_id}, function (userResult) {
                        if(userResult.error) {
                            callBack(userResult.error, null);
                        }

                        name = userResult.user.first_name + " " + userResult.user.last_name;
                        arrNames.push(name);
                        arrIds.push(userResult.user._id);


                        if(++fetched == arrUsers.length) {
                            event.sharedWithNames = arrNames;
                            event.sharedWithIds = arrIds;
                            callBack(null, event);
                        }
                    });
                }
            }
        ], function (err, event) {
            var outPut = {};
            outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
            outPut['event'] = event;
            res.status(200).send(outPut);
            return;
        });
    },

    /**
     * Return all events of the loggedin user.
     * @param req
     * @param res
     * @return Json
     */
    getEvents: function (req, res) {

        var CurrentSession = Util.getCurrentSession(req);
        var CalendarEvent = require('mongoose').model('CalendarEvent');
        var UserId = CurrentSession.id;

        CalendarEvent.get({}, {}, {}, function (err, result) {

            var outPut = {};
            if (err) {
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
    addEvent: function (req, res) {
        var CurrentSession = Util.getCurrentSession(req);
        var _async = require('async'),
            CalendarEvent = require('mongoose').model('CalendarEvent'),
            UserId = Util.getCurrentSession(req).id,
            Notification = require('mongoose').model('Notification'),
            NotificationRecipient = require('mongoose').model('NotificationRecipient'),
            notifyUsers = (typeof req.body.shared_users != 'undefined' ? req.body.shared_users : []); //this should be an array

        _async.waterfall([

            function addNewToDb(callBack) {

                var sharedUserList = [];

                if (typeof notifyUsers != 'undefined' && notifyUsers.length > 0) {
                    for (var i = 0; notifyUsers.length > i; i++) {
                        var obj = {
                            user_id: notifyUsers[i],
                            shared_status: CalendarSharedStatus.REQUEST_PENDING
                        }
                        sharedUserList.push(obj);
                    }
                }

                var eventData = {
                    user_id: UserId,
                    description: req.body.description,
                    plain_text: req.body.plain_text,
                    type: (req.body.type == "todo" ? CalendarTypes.TODO : CalendarTypes.EVENT),
                    start_date: req.body.apply_date,
                    event_time: req.body.event_time,
                    event_timezone: req.body.event_timezone,
                    shared_users: sharedUserList
                };

                CalendarEvent.addNew(eventData, function (event) {

                    var sharedUsers = event.event.shared_users;
                    if (typeof sharedUsers != 'undefined' && sharedUsers.length > 0) {
                        _async.each(sharedUsers, function (sharedUser, callBack) {
                            _async.waterfall([
                                function isESIndexExists(callBack) {
                                    var _cache_key = "idx_user:" + CalendarEventsConfig.CACHE_PREFIX + sharedUser.user_id.toString();
                                    var query = {
                                        index: _cache_key,
                                        id: sharedUser.user_id.toString(),
                                        type: 'shared_events',
                                    };
                                    ES.isIndexExists(query, function (esResultSet) {
                                        callBack(null, esResultSet);
                                    });
                                },
                                function getSharedEvents(resultSet, callBack) {
                                    if (resultSet) {
                                        var query = {
                                            q: "_id:" + sharedUser.user_id.toString()
                                        };
                                        CalendarEvent.ch_getSharedEvents(sharedUser.user_id, query, function (esResultSet) {
                                            callBack(null, esResultSet);
                                        });
                                    } else {
                                        callBack(null, null);
                                    }
                                },
                                function ch_shareEvent(resultSet, callBack) {
                                    if (resultSet != null) {
                                        var event_list = resultSet.result[0].events;
                                        var index_a = event_list.indexOf(event.event._id);
                                        if (index_a == -1) { //in any case if the event id exists in the shared list not adding it again
                                            event_list.push(event.event._id);
                                            var query = {
                                                    q: "user_id:" + sharedUser.user_id.toString()
                                                },
                                                data = {
                                                    user_id: sharedUser.user_id,
                                                    events: event_list
                                                };

                                            CalendarEvent.ch_shareEventUpdateIndex(sharedUser.user_id, data, function (esResultSet) {
                                                callBack(null);
                                            });
                                        } else {
                                            callBack(null);
                                        }
                                    } else {
                                        var query = {
                                                q: "user_id:" + sharedUser.user_id.toString()
                                            },
                                            data = {
                                                user_id: sharedUser.user_id,
                                                events: [event.event._id]
                                            };
                                        CalendarEvent.ch_shareEventCreateIndex(sharedUser.user_id, data, function (esResultSet) {
                                            callBack(null, event);
                                        });
                                    }
                                }
                            ], function (err, resultSet) {
                                callBack(null, event);
                            });
                        }, function (err, resultSet) {
                            callBack(null, event);
                        });
                    } else {
                        callBack(null, event);
                    }
                });
            },
            function addNotification(calEvent, callBack) {

                if (typeof notifyUsers != 'undefined' && notifyUsers.length > 0) {
                    var _data = {
                        sender: UserId,
                        notification_type: Notifications.SHARE_CALENDAR,
                        notified_calendar: calEvent.event._id
                    }
                    Notification.saveNotification(_data, function (res) {
                        if (res.status == 200) {
                            callBack(null, res.result._id, calEvent);
                        }

                    });

                } else {
                    callBack(null, null, calEvent);
                }
            },
            function notifyingUsers(notification_id, calEvent, callBack) {

                if (typeof notification_id != 'undefined' && notifyUsers.length > 0) {
                    var _data = {
                        notification_id: notification_id,
                        recipients: notifyUsers
                    };
                    NotificationRecipient.saveRecipients(_data, function (res) {
                        callBack(null, calEvent);
                    })

                } else {
                    callBack(null, calEvent);
                }
            }

        ], function (err, resultSet) {

            var outPut = {};
            if (err) {
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
    getAllForSpecificMonth: function (req, res) {

        var CurrentSession = Util.getCurrentSession(req);
        var CalendarEvent = require('mongoose').model('CalendarEvent');
        var _async = require('async');
        var UserId = CurrentSession.id;
        var moment = require('moment');

        var month = req.query.month;
        var year = req.query.year;
        var user_id = Util.toObjectId(UserId);
        var _Events = [];

        // month in moment is 0 based, so 9 is actually october, subtract 1 to compensate
        // array is 'year', 'month', 'day', etc
        var startDate = moment([year, month]).add(-1, "month").format('YYYY-MM-DD');

        // Clone the value before .endOf()
        var endDate = moment(startDate).endOf('month').format('YYYY-MM-DD');

        var criteria = {start_date_time: {$gte: startDate, $lt: endDate}, status: 1, user_id: user_id};

        _async.waterfall([
            function getEventsFromDB(callBack) {
                CalendarEvent.getSortedCalenderItems(criteria, function (err, resultSet) {

                    _Events = resultSet.events;
                    callBack(null, resultSet.events);
                });
            },
            function getSharedEvents(resultSet, callBack) {
                if (resultSet) {
                    var user_id = CurrentSession.id;

                    var query = {
                        q: "_id:" + user_id.toString()
                    };
                    CalendarEvent.ch_getSharedEvents(user_id, query, function (esResultSet) {

                        var sharedEvents = esResultSet.result[0].events;

                        _async.each(sharedEvents, function (sharedEvent, callBack) {

                            var condition = {start_date_time: {$gte: startDate, $lt: endDate}, _id: sharedEvent};

                            CalendarEvent.getSortedCalenderItems(condition, function (err, result) {

                                if (result.events[0] != null && typeof result.events[0] != 'undefined') {
                                    var _Shared_users = result.events[0].shared_users;

                                    if(_Shared_users != null && typeof _Shared_users != 'undefined'){

                                        for(var inc = 0; inc < _Shared_users.length; inc++){

                                            if(_Shared_users[inc].user_id == user_id && (_Shared_users[inc].shared_status == 1 || _Shared_users[inc].shared_status == 2)){
                                                _Events.push(result.events[0]);
                                            }
                                        }
                                    }
                                }
                                callBack(null);
                            });
                        }, function (err) {
                            callBack(null, _Events);
                        });
                    });
                } else {
                    callBack(null, _Events);
                }

            }
        ], function (err, _Events) {

            var outPut = {};
            if (err) {
                outPut['status'] = ApiHelper.getMessage(400, Alert.CALENDAR_MONTH_EMPTY, Alert.ERROR);
                res.status(400).send(outPut);
            } else {
                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['events'] = _Events;
                outPut['event_count'] = _Events.length;
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
    getAllForDateRange: function (req, res) {

        var CurrentSession = Util.getCurrentSession(req);
        var CalendarEvent = require('mongoose').model('CalendarEvent');
        var UserId = CurrentSession.id;
        var moment = require('moment');
        var _async = require('async');

        var start_date = req.query.start_date;
        var end_date = req.query.end_date;
        var user_id = Util.toObjectId(UserId);
        var _Events = [];

        // month in moment is 0 based, so 9 is actually october, subtract 1 to compensate
        // array is 'year', 'month', 'day', etc
        var startDate = moment(start_date).format('YYYY-MM-DD');

        // Clone the value before .endOf()
        var endDate = moment(end_date).format('YYYY-MM-DD');

        var criteria = {start_date_time: {$gte: startDate, $lt: endDate}, status: 1, user_id: user_id};

        _async.waterfall([
            function getEventsFromDB(callBack) {
                CalendarEvent.getSortedCalenderItems(criteria, function (err, resultSet) {

                    _Events = resultSet.events;
                    callBack(null, resultSet.events);
                });
            },
            function getSharedEvents(resultSet, callBack) {
                if (resultSet) {
                    var user_id = CurrentSession.id;

                    var query = {
                        q: "_id:" + user_id.toString()
                    };
                    CalendarEvent.ch_getSharedEvents(user_id, query, function (esResultSet) {

                        var sharedEvents = esResultSet.result[0].events;

                        _async.each(sharedEvents, function (sharedEvent, callBack) {

                            var condition = {start_date_time: {$gte: startDate, $lt: endDate}, _id: sharedEvent};

                            CalendarEvent.getSortedCalenderItems(condition, function (err, result) {

                                if (result.events[0] != null && typeof result.events[0] != 'undefined') {
                                    var _Shared_users = result.events[0].shared_users;

                                    if(_Shared_users != null && typeof _Shared_users != 'undefined'){

                                        for(var inc = 0; inc < _Shared_users.length; inc++){

                                            if(_Shared_users[inc].user_id == user_id && (_Shared_users[inc].shared_status == 1 || _Shared_users[inc].shared_status == 2)){
                                                _Events.push(result.events[0]);
                                            }
                                        }
                                    }
                                }
                                callBack(null);
                            });
                        }, function (err) {
                            callBack(null, _Events);
                        });
                    });
                } else {
                    callBack(null, _Events);
                }

            }
        ], function (err, _Events) {

            var outPut = {};
            if (err) {
                outPut['status'] = ApiHelper.getMessage(400, Alert.CALENDAR_MONTH_EMPTY, Alert.ERROR);
                res.status(400).send(outPut);
            } else {
                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['events'] = _Events;
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
    getAllForSpecificWeek: function (req, res) {

        var CurrentSession = Util.getCurrentSession(req);
        var CalendarEvent = require('mongoose').model('CalendarEvent');
        var _async = require('async');

        var _Events = [];
        var _Week = [];
        var _Days = [];
        var data = {};
        data['week'] = req.query.week;
        data['month'] = req.query.month;
        data['year'] = req.query.year;
        data['user_id'] = Util.toObjectId(CurrentSession.id);

        _async.waterfall([
            function getWeeklyCalenderEvens(callBack) {
                CalendarEvent.getWeeklyCalenderEvens(data, function (err, resultSet) {

                    _Events = resultSet.events;
                    callBack(null, resultSet.events);
                });
            },
            function isESIndexExists(resultSet, callBack) {
                var user_id = CurrentSession.id;
                var _cache_key = "idx_user:" + CalendarEventsConfig.CACHE_PREFIX + user_id;
                var query = {
                    index: _cache_key,
                    id: user_id,
                    type: 'shared_events',
                };
                ES.isIndexExists(query, function (esResultSet) {
                    callBack(null, {
                        eventsDb: resultSet,
                        isExists: esResultSet
                    });
                });
            },
            function getSharedEvents(resultSet, callBack) {
                if (resultSet.isExists) {
                    var user_id = CurrentSession.id;

                    var query = {
                        q: "_id:" + user_id.toString()
                    };
                    CalendarEvent.ch_getSharedEvents(user_id, query, function (esResultSet) {

                        var sharedEvents = esResultSet.result[0].events;

                        _async.each(sharedEvents, function (sharedEvent, callBack) {

                            var dataVal = {};
                            dataVal['week'] = req.query.week;
                            dataVal['month'] = req.query.month;
                            dataVal['year'] = req.query.year;
                            dataVal['_id'] = sharedEvent;

                            CalendarEvent.getWeeklyCalenderEvensForSharedUser(dataVal, function (err, result) {

                                if (result.events[0] != null && typeof result.events[0] != 'undefined') {
                                    _Events.push(result.events[0]);
                                    _Week = result.week;
                                    _Days = result.days;
                                }
                                callBack(null);
                            });
                        }, function (err) {
                            callBack(null, _Events);
                        });
                    });
                } else {
                    callBack(null, _Events);
                }

            }
        ], function (err, _Events) {

            var outPut = {};
            if (err) {
                outPut['status'] = ApiHelper.getMessage(400, Alert.CALENDAR_MONTH_EMPTY, Alert.ERROR);
                res.status(400).send(outPut);
            } else {
                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['events'] = _Events;
                outPut['week'] = _Week;
                outPut['days'] = _Days;
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
    getAllEventForCurrentWeek: function (req, res) {
        var moment = require('moment');
        var CurrentSession = Util.getCurrentSession(req);
        var CalendarEvent = require('mongoose').model('CalendarEvent');
        var _async = require('async');

        var _Events = [];
        var _Week = [];
        var _Days = [];

        var data = {};
        data['week'] = Math.ceil(moment().format('DD') / 7);
        data['month'] = moment().format('MM');
        data['year'] = moment().format('YYYY');
        data['user_id'] = Util.toObjectId(CurrentSession.id);

        _async.waterfall([
            function getWeeklyCalenderEvens(callBack) {
                CalendarEvent.getWeeklyCalenderEvens(data, function (err, resultSet) {

                    _Events = resultSet.events;
                    callBack(null, resultSet.events);
                });
            },
            function isESIndexExists(resultSet, callBack) {
                var user_id = CurrentSession.id;
                var _cache_key = "idx_user:" + CalendarEventsConfig.CACHE_PREFIX + user_id;
                var query = {
                    index: _cache_key,
                    id: user_id,
                    type: 'shared_events',
                };
                ES.isIndexExists(query, function (esResultSet) {
                    callBack(null, {
                        eventsDb: resultSet,
                        isExists: esResultSet
                    });
                });
            },
            function getSharedEvents(resultSet, callBack) {
                if (resultSet.isExists) {
                    var user_id = CurrentSession.id;

                    var query = {
                        q: "_id:" + user_id.toString()
                    };
                    CalendarEvent.ch_getSharedEvents(user_id, query, function (esResultSet) {

                        var sharedEvents = esResultSet.result[0].events;

                        _async.each(sharedEvents, function (sharedEvent, callBack) {

                            var dataVal = {};
                            dataVal['week'] = Math.ceil(moment().format('DD') / 7);
                            dataVal['month'] = moment().format('MM');
                            dataVal['year'] = moment().format('YYYY');
                            dataVal['_id'] = sharedEvent;

                            CalendarEvent.getWeeklyCalenderEvensForSharedUser(dataVal, function (err, result) {
                                //console.log(result);
                                if (result.events[0] != null && typeof result.events[0] != 'undefined') {
                                    _Events.push(result.events[0]);
                                    _Week = result.week;
                                    _Days = result.days;
                                }
                                callBack(null);
                            });
                        }, function (err) {
                            callBack(null, _Events);
                        });
                    });
                } else {
                    callBack(null, _Events);
                }

            }
        ], function (err, _Events) {

            var outPut = {};
            if (err) {
                outPut['status'] = ApiHelper.getMessage(400, Alert.CALENDAR_MONTH_EMPTY, Alert.ERROR);
                res.status(400).send(outPut);
            } else {
                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['events'] = _Events;
                outPut['week'] = _Week;
                outPut['days'] = _Days;
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
    getAllEventForNextOrPrevWeek: function (req, res) {
        var moment = require('moment');
        var CurrentSession = Util.getCurrentSession(req);
        var CalendarEvent = require('mongoose').model('CalendarEvent');

        var data = {}, startDateOfWeek, endDateOfWeek;
        data['date'] = req.query.date;
        data['action'] = req.query.action;
        data['user_id'] = Util.toObjectId(CurrentSession.id);
        data['current_month'] = moment(data['date'], 'YYYY-MM-DD').format('MM');
        data['current_year'] = moment(data['date'], 'YYYY-MM-DD').format('YYYY');

        if (data['action'] == 'next') {
            startDateOfWeek = moment(data['date'], 'YYYY-MM-DD').add(7, 'day').format('YYYY-MM-DD');
        } else {
            startDateOfWeek = moment(data['date'], 'YYYY-MM-DD').subtract(7, 'day').format('YYYY-MM-DD');
        }

        data['week'] = Math.ceil(moment(startDateOfWeek).format('DD') / 7);
        data['month'] = moment(startDateOfWeek).format('MM');
        data['year'] = moment(startDateOfWeek).format('YYYY');

        if (data['current_month'] != data['month'] || data['current_year'] != data['year']) {
            if (data['current_year'] != data['year']) {
                if (data['current_year'] > data['year']) {
                    data['week'] = Math.ceil(moment(startDateOfWeek).endOf('month').format('DD') / 7);
                } else {
                    data['week'] = Math.ceil(moment(startDateOfWeek).startOf('month').format('DD') / 7);
                }
            } else {
                if (data['current_month'] > data['month']) {
                    data['week'] = Math.ceil(moment(startDateOfWeek).endOf('month').format('DD') / 7);
                } else {
                    data['week'] = Math.ceil(moment(startDateOfWeek).startOf('month').format('DD') / 7);
                }
            }

        }

        CalendarEvent.getWeeklyCalenderEvens(data, function (err, result) {
            var outPut = {};
            if (err) {
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
    getEventsForSpecificDay: function (req, res) {

        var CurrentSession = Util.getCurrentSession(req);
        var CalendarEvent = require('mongoose').model('CalendarEvent');
        var moment = require('moment');
        var day = req.body.day;
        var _Events = [];

        var user_id = Util.toObjectId(CurrentSession.id);
        var startTimeOfDay = moment(day, 'YYYY-MM-DD').format('YYYY-MM-DD'); //format the given date as mongo date object
        var endTimeOfDay = moment(day, 'YYYY-MM-DD').add(1, "day").format('YYYY-MM-DD'); //get the next day of given date
        var _async = require('async');
        var criteria =  { start_date_time: {$gte: startTimeOfDay, $lt: endTimeOfDay }, user_id: user_id};

        _async.waterfall([

            function getSortedCalenderItems(callBack) {
                console.log("getSortedCalenderItems -->>");
                _async.waterfall([
                    function getEventsFromDB(callBack) {
                        console.log("getEventsFromDB -->>");
                        CalendarEvent.getSortedCalenderItems(criteria, function (err, resultSet) {

                            if(err) {
                                callBack(null, null);
                            } else {
                                _Events = resultSet.events;
                                callBack(null, resultSet.events);
                            }

                        });
                    },
                    function getSharedEvents(resultSet, callBack) {
                        console.log("getSharedEvents -->>");
                        if (typeof resultSet != 'undefined' && resultSet) {

                            console.log("11111 -->>");

                            var user_id = CurrentSession.id;

                            var query = {
                                q: "_id:" + user_id.toString()
                            };
                            CalendarEvent.ch_getSharedEvents(user_id, query, function (esResultSet) {

                                console.log("22222 -->>");
                                if(typeof esResultSet != 'undefined' && esResultSet) {
                                    console.log("33333 -->>");
                                    var sharedEvents = esResultSet.result[0].events;
                                    console.log(sharedEvents);
                                    _async.each(sharedEvents, function (sharedEvent, callBack) {
                                        console.log("44444 -->>");
                                        var condition = {
                                            start_date_time: {$gte: startTimeOfDay, $lt: endTimeOfDay},
                                            _id: sharedEvent,
                                        };

                                        CalendarEvent.getSortedCalenderItems(condition, function (err, result) {
                                            console.log("55555 -->>");
                                            if(typeof result != 'undefined' && result) {
                                                console.log("66666 -->>");
                                                if (result.events[0] != null && typeof result.events[0] != 'undefined') {
                                                    var _Shared_users = result.events[0].shared_users;

                                                    if(_Shared_users != null && typeof _Shared_users != 'undefined'){

                                                        for(var inc = 0; inc < _Shared_users.length; inc++){

                                                            if(_Shared_users[inc].user_id == user_id && (_Shared_users[inc].shared_status == 1 || _Shared_users[inc].shared_status == 2)){
                                                                _Events.push(result.events[0]);
                                                            }
                                                        }
                                                    }

                                                }
                                            }
                                            callBack(null);

                                        });
                                    }, function (err) {
                                        callBack(null, _Events);
                                    });
                                } else {
                                    callBack(null, _Events);
                                }

                            });
                        } else {
                            callBack(null, _Events);
                        }

                    }
                ], function (err, _Events) {
                    callBack(null, _Events);

                });
            },

            function getUsers(events, callBack) {
                console.log("getUsers -->>");
                var criteria = {
                    user_id: user_id,
                    status: 3
                };
                var User = require('mongoose').model('User');
                User.getConnectionUsers(criteria, function (result) {
                    var friends = result.friends;
                    callBack(null, events, friends);
                });
            },

            function composeUsers(events, users, callBack) {
                console.log("composeUsers -->>");
                if (events.length == 0) {
                    callBack(null, []);
                }

                for (var e = 0; e < events.length; e++) {

                    var event = events[e];
                    var sharedUsers = event.shared_users;

                    if (sharedUsers.length == 0) {
                        if (e + 1 == (events.length)) {
                            callBack(null, events)

                        }
                    }

                    var arrUsers = [];
                    for (var u = 0; u < sharedUsers.length; u++) {
                        var userId = sharedUsers[u].user_id;


                        var filterObj = users.filter(function (e) {
                            return e.user_id == userId;
                        });

                        var user = {
                            'shared_status': sharedUsers[u].shared_status,
                            'id': userId,
                            'name': 'Unknown'
                        };

                        if (filterObj) {
                            user.name = filterObj[0].first_name + " " + filterObj[0].last_name;
                        }

                        arrUsers.push(user);
                        events[e].shared_users = arrUsers;

                        if (u + 1 == sharedUsers.length && e + 1 == events.length) {
                            callBack(null, events);
                        }
                    }
                }
            }
        ], function (err, events) {
            console.log("finally -->>");
            var outPut = {};
            if(err){
                outPut['error'] = err;
                res.status(400).send(outPut);
            }else{
                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['events'] = events;
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

        var CalendarEvent = require('mongoose').model('CalendarEvent'),
            Notification = require('mongoose').model('Notification'),
            NotificationRecipient = require('mongoose').model('NotificationRecipient');
        var moment = require('moment');
        var _async = require('async');

        var event_id = req.body.id;
        event_id = Util.toObjectId(event_id);

        var user_id = Util.getCurrentSession(req).id,
            shareUsers = (typeof req.body.shared_users != 'undefined' ? req.body.shared_users : []), //this should be an array
            isTimeChanged = false,
            _description = req.body.description,
            _plain_text = req.body.plain_text,
            _start_date_time = req.body.apply_date,
            _event_time = req.body.event_time,
            _passed_event_time = req.body.event_time;


        var sharedUserList = [], notifyUsers = [];
        _async.waterfall([
            function getEvents(callBack) {
                CalendarEvent.getEventById(event_id, function (resultSet) {
                    callBack(null, resultSet);
                });
            },
            function compareSharedUsers(resultSet, callBack) {

                if (typeof resultSet != 'undefined') {

                    if(_event_time != resultSet.event_time){
                        isTimeChanged = true;
                        _passed_event_time = resultSet.event_time;
                    }

                    if (typeof shareUsers != 'undefined' && shareUsers.length > 0) {

                        /*
                         * If time changed then all user should be requested again
                         * So all user request set as PENDING again
                         */
                        if (isTimeChanged == true) {
                            for (var i = 0; shareUsers.length > i; i++) {
                                var obj = {
                                    user_id: shareUsers[i],
                                    share_type: CalendarSharedStatus.REQUEST_PENDING
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

                                if (typeof resultSet.shared_users != 'undefined' && resultSet.shared_users.length > 0) {

                                    var filterObj = resultSet.shared_users.filter(function (e) {
                                        return e.user_id.toString() == shareUsers[i].toString();
                                    });
                                    console.log(filterObj);
                                    if (typeof filterObj != 'undefined' && filterObj.user_id) {
                                        sharedUserList.push(filterObj);
                                    } else {
                                        var obj = {
                                            user_id: shareUsers[i],
                                            share_type: CalendarSharedStatus.REQUEST_PENDING
                                        };
                                        sharedUserList.push(obj);
                                        notifyUsers.push(shareUsers[i]);
                                    }

                                } else {
                                    var obj = {
                                        user_id: shareUsers[i],
                                        share_type: CalendarSharedStatus.REQUEST_PENDING
                                    };
                                    sharedUserList.push(obj);
                                    notifyUsers.push(shareUsers[i]);
                                }
                            }
                        }
                    }

                    var updateData = {
                        description: _description,
                        plain_text: _plain_text,
                        start_date_time: _start_date_time,
                        event_time: _event_time,
                        shared_users: sharedUserList
                    };

                    callBack(null, updateData);

                } else {
                    callBack(null, null);
                }
            },
            function updateDbEvent(updateData, callBack) {
                var criteria = {
                    _id: event_id
                };

                CalendarEvent.updateEvent(criteria, updateData, function (res) {
                    callBack(null, res.status);
                });
            },
            function addNotification(stt, callBack) {

                if (typeof notifyUsers != 'undefined' && notifyUsers.length > 0 && stt == 200) {
                    var _data = {
                        sender: user_id,
                        notification_type: isTimeChanged == true ? Notifications.CALENDAR_SCHEDULE_TIME_CHANGED : Notifications.CALENDAR_SCHEDULE_UPDATED,
                        notified_calendar: event_id
                    }
                    Notification.saveNotification(_data, function (res) {
                        if (res.status == 200) {
                            callBack(null, res.result._id);
                        }

                    });

                } else {
                    callBack(null, null);
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
        ], function (err) {
            var outPut = {};
            if (err) {
                outPut['status'] = ApiHelper.getMessage(400, err);
                res.status(400).send(outPut);
            } else {
                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['event_time'] = {'isTimeChanged':isTimeChanged,'event_time':_event_time,'passed_event_time':_passed_event_time};
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
                                notified_calendar: event_Id
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
                    callBack(null, null);
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
    getEventSharedUsers: function (req, res) {

        var _async = require('async'),
            CalendarEvent = require('mongoose').model('CalendarEvent'),
            User = require('mongoose').model('User'),
            CurrentSession = Util.getCurrentSession(req),
            eventId = req.query.eventId;

        var event_Id = Util.toObjectId(req.query.eventId);
        var dataArray = [];

        _async.waterfall([
            function getEevent(callBack) {
                CalendarEvent.getEventById(event_Id, function (resultSet) {
                    callBack(null, resultSet);
                });
            },
            function getSharedUsers(resultSet, callBack) {
                if (typeof resultSet.shared_users != 'undefined' && resultSet.shared_users.length > 0) {
                    var sharedUsers = resultSet.shared_users;
                    _async.each(sharedUsers, function (sharedUser, callBack) {

                        if (sharedUser.shared_status == CalendarStatus.PENDING || sharedUser.shared_status == CalendarStatus.COMPLETED) {
                            var usrObj = {};
                            _async.waterfall([

                                function getEsSharedUsers(callBack) {
                                    var query = {
                                        q: "user_id:" + sharedUser.user_id.toString(),
                                        index: 'idx_usr'
                                    };
                                    //Find User from Elastic search
                                    ES.search(query, function (csResultSet) {
                                        if (typeof csResultSet.result != 'undefined' && csResultSet.result_count > 0) {
                                            usrObj.user_name = csResultSet.result[0]['first_name'] + " " + csResultSet.result[0]['last_name'];
                                            usrObj.profile_image = csResultSet.result[0]['images']['profile_image']['http_url'];
                                        } else {
                                            usrObj.user_name = null;
                                            usrObj.profile_image = null;
                                        }

                                        callBack(null);
                                    });

                                },
                                function getSharedUserMoreDetails(callBack) {
                                    var criteria = {_id: sharedUser.user_id.toString()},
                                        showOptions = {
                                            w_exp: true,
                                            edu: true
                                        };

                                    User.getUser(criteria, showOptions, function (resultSet) {

                                        usrObj.country = resultSet.user.country;
                                        if (typeof resultSet.user.education_details[0] != 'undefined' && resultSet.user.education_details.length > 0) {
                                            usrObj.school = resultSet.user.education_details[0].school;
                                            usrObj.degree = resultSet.user.education_details[0].degree;
                                        }
                                        if (typeof resultSet.user.working_experiences[0] != 'undefined' && resultSet.user.working_experiences.length > 0) {
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

                            ], function (err) {
                                callBack(null);
                            });

                        } else {
                            callBack(null);
                        }

                    }, function (err) {
                        callBack(null);
                    });
                } else {
                    callBack(null);
                }
            }
        ], function (err) {
            var outPut = {
                status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
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
    removeSharedEventUser: function (req, res) {

        var CalendarEvent = require('mongoose').model('CalendarEvent'),
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
            function updateInDB(resultSet, callBack) {
                sharedUsers = resultSet.shared_users;
                oldSharedUserList = resultSet.shared_users;
                var index = sharedUsers.indexOfProperty('user_id', shared_user_id);

                if (index != -1) {
                    sharedUsers.splice(index, 1);
                }
                var _udata = {
                    'shared_users': sharedUsers
                };
                var criteria = {
                    _id: event_id,
                    user_id: Util.toObjectId(own_user_id),
                    'shared_users.user_id': shared_user_id
                };
                CalendarEvent.updateSharedEvent(criteria, _udata, function (err, result) {
                    if (result.status == 200) {
                        callBack(null, result);
                    } else {
                        callBack(null, null);
                    }
                });
            }
        ], function (err, result) {
            var outPut = {
                status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                update_status: result
            };
            res.status(200).json(outPut);
        })


    },

    /**
     * accept shared event by shared user
     * @param req
     * @param res
     */

    updateEventSharedStatus: function(req,res){

        var NotificationRecipient = require('mongoose').model('NotificationRecipient'),
            Notification = require('mongoose').model('Notification'),
            CalendarEvent = require('mongoose').model('CalendarEvent'),
            _async = require('async'),
            _data = {notification_status:true},
            user_id = Util.getCurrentSession(req).id;

        _async.waterfall([
            function updateSharedStatus(callBack) {
                var shared_status = req.body.status == CalendarSharedStatus.REQUEST_REJECTED ?
                    CalendarSharedStatus.REQUEST_REJECTED : CalendarSharedStatus.REQUEST_ACCEPTED;

                var _udata = {
                    'shared_users.$.status':shared_status
                };
                var criteria = {
                    _id:Util.toObjectId(req.body.event_id),
                    'shared_users.user_id':user_id
                };

                CalendarEvent.updateSharedEvent(criteria, _udata, function(res){
                    callBack(null);
                });
            },
            function updateESSharedStatus(callBack){
                if(req.body.status == 'REQUEST_REJECTED'){

                    _async.waterfall([
                        function getSharedEvents(callBack){
                            var query={
                                q:"_id:"+user_id
                            };
                            CalendarEvent.ch_getSharedEvents(user_id, query, function (esResultSet){
                                callBack(null, esResultSet);
                            });

                        },
                        function ch_shareEvent(resultSet, callBack) {
                            if(resultSet != null){
                                var event_list = resultSet.result[0].events;
                                var index = event_list.indexOf(req.body.event_id.toString());
                                event_list.splice(index, 1);

                                var query={
                                        q:"user_id:"+user_id
                                    },
                                    data = {
                                        user_id: user_id,
                                        events: event_list
                                    };

                                CalendarEvent.ch_shareEventUpdateIndex(user_id,data, function(esResultSet){
                                    callBack(null);
                                });
                            }else {
                                callBack(null);
                            }
                        }
                    ], function (err, resultSet) {
                        callBack(null);
                    });

                }else{
                    callBack(null);
                }
            },
            function addNotification(callBack){

                var _data = {
                    sender:user_id,
                    notification_type:Notifications.SHARE_CALENDAR_RESPONSE,
                    notified_event:req.body.event_id,
                    notification_status:req.body.status.toString()
                }
                Notification.saveNotification(_data, function(res){
                    if(res.status == 200) {
                        callBack(null,res.result._id);
                    }
                });

            },
            function notifyingUsers(notification_id, callBack){

                var userList = [req.body.updating_user];
                if(typeof notification_id != 'undefined' && userList.length > 0){

                    var _data = {
                        notification_id:notification_id,
                        recipients:userList
                    };

                    NotificationRecipient.saveRecipients(_data, function(res){
                        callBack(null);
                    })

                } else{
                    callBack(null);
                }
            }
        ],function(err){
            var outPut ={
                status:ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS)
            };
            res.status(200).json(outPut);
        })


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
    updateEventCompletion: function (req, res) {

        var CurrentSession = Util.getCurrentSession(req);
        var CalendarEvent = require('mongoose').model('CalendarEvent');
        var moment = require('moment');
        var _async = require('async');

        var event_id = req.body.id;
        var status = req.body.status;
        event_id = Util.toObjectId(event_id);
        var user_id = Util.toObjectId(CurrentSession.id);

        _async.waterfall([
            function getEvents(callBack) {
                CalendarEvent.getEventById(event_id, function (resultSet) {
                    callBack(null, resultSet);
                });
            },
            function updateEvent(resultSet, callBack) {
                var criteria = {
                    _id: event_id
                };
                var updateData = {
                    status: status
                };
                CalendarEvent.updateEvent(criteria, updateData, function (res) {
                    callBack(null);
                });
            }
        ], function (err) {
            var outPut = {};
            if (err) {
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
