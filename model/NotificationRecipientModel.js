/**
 * Notification Model will communicate with notifications collection
 */

'use strict'
var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

/**
 * Notification
 */
var NotificationRecipientSchema = new Schema({
    notification_id:{
        type: Schema.ObjectId,
        ref: 'Notification',
        default:null
    },
    recipient:{
        type: Schema.ObjectId,
        default:null
    },
    read_status:{
        type:Boolean,
        default:false
    }
},{collection:"notification_recipients"});

/**
 * Save recipients of a notification
 * @param data
 * @param callBack
 */
NotificationRecipientSchema.statics.saveRecipients = function(data,callBack){

    var recipients = [],
        now = new Date();

    for (var i = 0; data.recipients.length > i; i++) {
        recipients.push({
            notification_id: Util.toObjectId(data.notification_id),
            recipient: Util.toObjectId(data.recipients[i]),
            read_status: false
        });
    }

    this.collection.insert(recipients,function(err,resultSet){
        if(! err){
            callBack({status:200,result:resultSet});
        }else{
            console.log("Server Error --------");
            console.log(err);
            callBack({status:400,error:err});
        }

    });
};

/**
 * Get notifications based on criteria
 * @param criteria
 * @param callBack
 */
NotificationRecipientSchema.statics.getRecipientNotifications = function(criteria,days,callBack){

    var _this = this;

    console.log(criteria)

    _this.aggregate([
        { $match:criteria},
        {
            $lookup:{
                from:"notifications",
                localField:"notification_id",
                foreignField:"_id",
                as:"notificationData"
            }
        },
        { $unwind: '$notificationData'},
        {
            $match: {
                "notificationData.created_at" : {$gt:new Date(Date.now() - days*24*60*60 * 1000)}
            }
        },
        //{
        //    $lookup: {
        //        from:"posts",
        //        localField:"notificationData.notified_post",
        //        foreignField:"_id",
        //        as:"postData"
        //    }
        //},
        //{
        //    $unwind: '$postData'
        //},
        {
            $project:{
                _id:1,
                notification_id:1,
                recipient_id:"$recipient",
                read_status:1,
                created_at:"$notificationData.created_at",
                notification_type:"$notificationData.notification_type",
                sender_id:"$notificationData.sender",
                post_id:"$notificationData.notified_post"
                //post_owner:"$postData.created_by"
            }
        },
        { $sort:{ "created_at":-1}},

    ], function(err, resultSet){
        if(!err){

            callBack({
                status:200,
                notifications:resultSet

            });
        }else {
            console.log("Server Error --------")
            callBack({status: 400, error: err});
        }
    });


};

/**
 * Update Notification
 * @param criteria
 * @param data
 * @param callBack
 */
NotificationRecipientSchema.statics.updateRecipientNotification = function(criteria, data, callBack){

    var _this = this;

    _this.update(
        criteria, data, {multi:true}, function(err,resultSet){
            if(!err){
                callBack({
                    status:200
                });
            }else{
                console.log("Server Error --------")
                console.log(err)
                callBack({status:400,error:err});
            }
        });

};

/**
 * Get notifications based on criteria
 * @param criteria
 * @param callBack
 */
NotificationRecipientSchema.statics.getUnreadCount = function(criteria,callBack){

    this.find(criteria).exec(function(err,resultSet){


        if(!err){
            callBack({
                status:200,
                result:resultSet
            });
        }else{
            console.log("Server Error --------")
            console.log(err)
            callBack({status:400,error:err});
        }

    })

};



mongoose.model('NotificationRecipient',NotificationRecipientSchema);
