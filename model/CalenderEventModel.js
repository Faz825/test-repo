/**
 * Calender Event model for communicate calender_events collection in Database
 * Both Events and Todos are stored  in this collection.
 */

'use strict'
var  mongoose = require('mongoose'),
     Schema   = mongoose.Schema;

GLOBAL.CalenderTypes = {
    EVENT: 1,
    TODO: 2,
    TASK: 3
};

GLOBAL.CalenderStatus = {
    PENDING: 1,
    COMPLETED: 2,
    EXPIRED: 3,
    CANCELLED: 4
};

/**
 * CalenderEvent Basic information
 */
var CalenderEventSchema = new Schema({

    user_id : {
        type : Schema.ObjectId,
        ref : 'User',
        default : null
    },

    description : {
        type : String,
        default : null,
        trim : true
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

    end_date_time : {
        type : Date
    },    

    created_at : {
        type : Date
    },

    updated_at: {
        type : Date
    }

},{collection:"calender_events"});

/**
 * Add CalenderEvent to the system
 * @param EventData
 * @param callBack
 * @return Json
 */
CalenderEventSchema.statics.add = function (eventData,callBack) {

    var calenderEvent = new this();
    calenderEvent.type = (eventData.description ? eventData.description : 'No title');
    calenderEvent.type = (eventData.type ? eventData.type : 'event');
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
CalenderEventSchema.statics.update = function (filter, value, callBack) {

    var calenderEvent = new this();
    var options = { multi: true };

    calenderEvent.update(filter, value, options, function(err, update) {
        if(err){
            console.log(err);
            callBack({status:400,error:err});
        }else{
            callBack({status:200,count:update});
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
CalenderEventSchema.statics.getOne = function (filter, fields, callBack) {

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
CalenderEventSchema.statics.get = function (filter, fields, options, callBack) {

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
 * Get Calender events, todos, Tasks for the given period sorted by created date
 * @param criteria
 * @param callBack
 */
CalenderEventSchema.statics.getSortedCalenderItems = function(criteria,callBack){

    var _this = this;

    _this.find(criteria).sort({created_at:-1}).exec(function(err,resultSet){
        if(!err){
            callBack({
                status:200,
                notebooks:resultSet
            });
        } else {
            console.log("Server error while getSortedCalenderItems --------");
            callBack({status:400,error:err});
        }
    });

};

mongoose.model('CalenderEvent', CalenderEventSchema);
