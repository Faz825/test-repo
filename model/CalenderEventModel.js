/**
 * Calender Event model for communicate calender_events collection in Database
 * Both Events and Todos are stored  in this collection.
 */

'use strict'
var  mongoose = require('mongoose'),
     Schema   = mongoose.Schema;

GLOBAL.CalenderEventsConfig={
    CACHE_PREFIX :"shared_events:"
};

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
    shared_users:[],
    created_at : {
        type : Date
    },

    updated_at: {
        type : Date
    }

},{collection:"calender_events"});


CalenderEventSchema.pre('save', function(next){
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
CalenderEventSchema.statics.addNew = function (eventData,callBack) {

    var calenderEvent = new this();
    var type = (eventData.type ? eventData.type : 'EVENT');
    console.log(eventData);
    calenderEvent.user_id = eventData.user_id;
    calenderEvent.description = (eventData.description ? eventData.description : 'No title');
    calenderEvent.status = CalenderStatus.PENDING;
    calenderEvent.type = (CalenderTypes.hasOwnProperty(type) ? CalenderTypes.type : 1);
    calenderEvent.start_date_time = eventData.start_date;
    calenderEvent.event_time = eventData.event_time;
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
CalenderEventSchema.statics.updateEvent = function (filter, value, callBack) {

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
CalenderEventSchema.statics.getEventById = function(id,callBack){

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
 * Share Event | DB
 */
CalenderEventSchema.statics.shareEvent = function(eventId,sharedCriteria,callBack){

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
CalenderEventSchema.statics.updateSharedEvent = function(criteria, data, callBack){

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
CalenderEventSchema.statics.getSortedCalenderItems = function(criteria,callBack){

    var _this = this;

    _this.find(criteria).sort({created_at:-1}).exec(function(err,resultSet){

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

mongoose.model('CalenderEvent', CalenderEventSchema);
