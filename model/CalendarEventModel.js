/**
 * Calender Event model for communicate calender_events collection in Database
 * Both Events and Todos are stored  in this collection.
 */

'use strict'
var  mongoose = require('mongoose'),
     Schema   = mongoose.Schema;

GLOBAL.CalendarEventsConfig={
    CACHE_PREFIX :"shared_events:"
};

GLOBAL.CalendarTypes = {
    EVENT: 1,
    TODO: 2,
    TASK: 3
};

GLOBAL.CalendarStatus = {
    PENDING: 1,
    COMPLETED: 2,
    EXPIRED: 3,
    CANCELLED: 4
};

GLOBAL.CalendarSharedStatus = {
    REQUEST_PENDING: 1,
    REQUEST_REJECTED: 2,
    REQUEST_ACCEPTED: 3
};

/**
 * CalenderEvent Basic information
 */
var CalendarEventSchema = new Schema({

    user_id : {
        type : Schema.ObjectId,
        ref : 'User',
        default : null
    },

    description : {
        type : Schema.Types.Mixed,
        default : null
    },

    status : {
        type : Number,
        default : 1 /* 1 - pending | 2 - completed | 3 - expired, 4 - cancelled */
    },

    type : {
        type : Number,
        default : null
    },

    start_date_time : {
        type : Date
    },

    event_time : {
        type : String,
        default : null
    },

    event_timezone : {
        type : String,
        default : null
    },

    shared_users: {
        type: Array,
        default: []
    },

    moved_nextday: {
        type : Boolean,
        default : false
    },

    moved_nextday_count: {
        type : Number,
        default : 0
    },

    created_at : {
        type : Date
    },

    updated_at: {
        type : Date
    }

},{collection:"calender_events"});


CalendarEventSchema.pre('save', function(next){
    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }
    next();
});

/**
 * Add CalenderEvent to the system
 * @param EventData
 * @param callBack
 * @return Json
 */
CalendarEventSchema.statics.addNew = function (eventData,callBack) {

    var calenderEvent = new this();
    calenderEvent.user_id = eventData.user_id;
    calenderEvent.description = (eventData.description ? eventData.description : 'No title');
    calenderEvent.status = CalendarStatus.PENDING;
    calenderEvent.type = (eventData.type ? eventData.type : 1);
    calenderEvent.start_date_time = eventData.start_date;
    calenderEvent.event_time = eventData.event_time;
    calenderEvent.event_timezone = eventData.event_timezone;
    calenderEvent.shared_users = eventData.shared_users;
    calenderEvent.save(function(err,resultSet){
        
        if(err){
            console.log(err);
            callBack({status:400,error:err});
        }else{
            callBack({status:200, event:resultSet});
        }
    });
};

/**
 * Update a given CalenderEvent
 * @param Json filter
 * @param Json value
 * @param callBack
 * @return Json
 */
CalendarEventSchema.statics.updateEvent = function (filter, value, callBack) {

    var _this = this;
    var options = { multi: true };

    _this.update(filter, value, options, function(err, update) {
        if(err){
            console.log(err);
            callBack({status:400,error:err});
        }else{
            callBack({status:200,event:update});
        }
    });
};

/**
 * Get Event By Id
 * @param Json filter
 * @param Json value
 * @param callBack
 * @return Json
 */
CalendarEventSchema.statics.getEventById = function(id,callBack){

    var _this = this;

    _this.findOne({_id: id}).exec(function (err, resultSet) {
        if (!err) {
            if (resultSet == null) {
                callBack(null);
                return;
            }

            callBack(resultSet);
        } else {
            console.log(err)
            callBack({status: 400, error: err})
        }
    });

};

/**
 * Get single object under a given criteria
 * @param Json filter
 * @param String fields - required fields to be fetched space sparated
 * @param callBack
 * @return Json
 */
CalendarEventSchema.statics.getOne = function (filter, fields, callBack) {

    var calenderEvent = new this();

    calenderEvent.findOne(filter, fields, function (err, event ) {
        if (err){
            console.log(err);
            callBack({status:400,error:err});
        } else {
            callBack({status:200,event:event});
        }
    })
};

/**
 * Get calander events by a given fiter
 * @param Json filter
 * @param String fields - required fields to be fetched space sparated
 * @param Json options - options matching to the query builder
 * @param callBack
 * @return Json
 */
CalendarEventSchema.statics.get = function (filter, fields, options, callBack) {

    var calenderEvent = new this();
    var options = { multi: true };

    calenderEvent.find(filter, fields, options, function (err, events) {
        if (err){
            console.log(err);
            callBack({status:400,error:err});
        } else {
            callBack({status:200,events:events});
        }
    });
};

/**
 * Share Event | DB
 */
CalendarEventSchema.statics.shareEvent = function(eventId,sharedCriteria,callBack){

    var _this = this;
    _this.update({_id:eventId},
        {$set:sharedCriteria},function(err,resultSet){

            if(!err){
                callBack({
                    status:200
                });
            }else{
                console.log("Server Error --------")
                callBack({status:400,error:err});
            }
        });

};

/**
 * Update Shared Events
 * @param criteria
 * @param data
 * @param callBack
 */
CalendarEventSchema.statics.updateSharedEvent = function(criteria, data, callBack){

    var _this = this;

    _this.update(criteria, data, {multi:true}, function(err,resultSet){
        if(!err){
            callBack(null,{
                status:200,
                result:resultSet
            });
        }else{
            console.log("Server Error --------")
            console.log(err)
            callBack({status:400,error:err},null);
        }
    });
};


/**
 *
 * Get Calender events, todos, Tasks for the given period sorted by created date
 * @param criteria
 * @param callBack
 */
CalendarEventSchema.statics.getSortedCalenderItems = function(criteria,callBack){

    var _this = this;

    _this.find(criteria).or([{status: 1}, {status: 2}]).sort({created_at:-1}).exec(function(err,resultSet){

        if(!err){
            callBack(null, {
                status:200,
                events:resultSet
            });
        } else {
            console.log("Server error while getSortedCalenderItems --------");
            callBack({status:400,error:err}, null);
        }
    });

};

/**
 *
 * Get Calender events, for the given week
 * @param data object
 *
 */
CalendarEventSchema.statics.getWeeklyCalenderEvens = function(data,callBack){

    var _this = this;
    var moment = require('moment');
    var week = data['week'],month = (data['month'] -1),year = data['year'];

    var startDateOfWeek = moment([year, month]).add((week-1)*7,"days");
    var endDateOfWeek = moment([year,month]).add((week*7)+1,"days").subtract(1,"millisecond");

    if(week == 5){
        endDateOfWeek =  moment([year, month]).endOf('month').subtract(1,"millisecond");
    }

    //get days betweek the week
    var dateArray = [];
    var currentDate = startDateOfWeek;
    while (currentDate <= endDateOfWeek) {
        dateArray.push(currentDate);
        currentDate = moment(currentDate).add(1, 'days');
    }

    var criteria =  { start_date_time: {$gte: startDateOfWeek, $lt: endDateOfWeek }, status: 1, user_id: data['user_id']};

    _this.find(criteria).sort({created_at:-1}).exec(function(err,resultSet){
        if(!err){
            callBack(null, {
                status:200,
                events:resultSet,
                week:week,
                days:dateArray
            });
        } else {
            console.log("Server error while getSortedCalenderItems --------");
            callBack({status:400,error:err}, null);
        }
    });

};

mongoose.model('CalendarEvent', CalendarEventSchema);
