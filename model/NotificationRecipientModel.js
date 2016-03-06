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
            notification_id: data.notification_id,
            recipient: data.recipients[i].recipient.toObjectId()
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
NotificationRecipientSchema.statics.getRecipientNotifications = function(criteria,callBack){

    var _this = this;

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
        {$unwind: '$notificationData'},
        {
            $project:{
                _id:1,
                notification_id:1,
                sender_id:"$notificationData.sender",
                recipient_id:"$recipient",
                post_id:"$notificationData.notified_post",
                notification_type:"$notificationData.notification_type",
                read_status:1,
                created_at:"$notificationData.created_at"

            }
        },
        { $sort:{ "created_at":-1}}
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



mongoose.model('NotificationRecipient',NotificationRecipientSchema);
