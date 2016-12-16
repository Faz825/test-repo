/**
 * Calender Event model for communicate callcenter collection in Database
 */
'use strict'
var  mongoose = require('mongoose'),
    Schema   = mongoose.Schema;


GLOBAL.CallStatus = {
    MISSED: 1,
    ANSWERED: 2,
    REJECTED: 3,
    CANCELLED: 4
};

GLOBAL.ContactType = {
    INDIVIDUAL: 1,
    GROUP: 2,
    MULTI: 3
};

GLOBAL.CallType = {
    VIDEO: 1,
    AUDIO: 2
};

var ReceiversListSchema = new Schema({
    name:{
        type:String,
        default:null
    },
    user_id:{
        type : Schema.ObjectId,
        ref : 'User',
        default : null
    },
    call_status:{
        type : Number,
        default : null /* 1 - missed | 2 - answered | 3 - rejected, 4 - cancelled */
    }
});


var CallSchema = new Schema({

    user_id : {
        type : Schema.ObjectId,
        ref : 'User',
        default : null
    },

    call_status : {
        type : Number,
        default : null /* 1 - missed | 2 - answered | 3 - rejected, 4 - cancelled */
    },

    contact_type : {
        type : Number, /* 1 - individual | 2 - group | 3 - multi*/
        default : null
    },

    call_type : {
        type : Number, /* 1 - video | 2 - audio*/
        default : null
    },

    call_started_at : {
        type : Date,
        default : null
    },

    call_ended_at : {
        type : Date,
        default : null
    },

    call_duration : {
        type : String,
        default : null
    },

    receivers_list: [ReceiversListSchema],

    created_at : {
        type : Date
    },

    updated_at: {
        type : Date
    }

},{collection:"call_center"});


CallSchema.pre('save', function(next){
    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }
    next();
});


/**
 * Add Call Center records
 * @param eventData
 * @param callBack
 */
CallSchema.statics.addNew = function (eventData, callBack) {

    var callCenter = new this();
    callCenter.user_id = eventData.user_id;
    callCenter.call_status = eventData.call_status;
    callCenter.contact_type = eventData.contact_type;
    callCenter.call_type = eventData.call_type;
    callCenter.call_started_at = new Date();
    callCenter.receivers_list = eventData.receivers_list;

    callCenter.save(function(err,resultSet){
        if(err){
            console.log(err);
            callBack({status:400,error:err});
        }else{
            callBack({status:200, event:resultSet});
        }
    });
};

/**
 * Get Call Record By Id
 * @param id
 * @param callBack
 */
CallSchema.statics.getRecordById = function(id, callBack){

    var _this = this;

    _this.findOne({_id: id}).lean().exec(function (err, resultSet) {
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
 * Get records by given filer
 * @param filter
 * @param fields
 * @param callBack
 */
CallSchema.statics.get = function (filter, fields, callBack) {

    var callCenter = new this();
    var options = { multi: true };
    var _this = this;

    _this.find(filter, fields, options).lean().exec(function (err, records) {
        if (err){
            callBack({status:400,error:err},null);
        } else {
            callBack(null,{status:200,records:records});
        }
    });
};

/**
 * Update Call Record
 * @param filter
 * @param value
 * @param callBack
 */
CallSchema.statics.updateCallRecord = function (filter, value, callBack) {

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


mongoose.model('Call', CallSchema);