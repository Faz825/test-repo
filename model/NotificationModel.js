/**
 * Notification Model will communicate with notifications collection
 */

'use strict'
var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

/**
 * Notification
 */
var NotificationSchema = new Schema({
    sender:{
        type: Schema.ObjectId,
        ref: 'User',
        default:null
    },
    notification_type:{ // notification for post / comment / share / like / Birthday ...
        type:String,
        trim:true,
        default:null
    },
    notified_post:{ // the post that origin user comment / share / like ...
        type: Schema.ObjectId,
        ref: 'Post',
        default:null
    },
    created_at:{
        type:Date
    }
},{collection:"notifications"});

NotificationSchema.pre('save', function(next){
    var now = new Date();

    if ( !this.created_at ) {
        this.created_at = now;
    }
    next();
});

/**
 * Save notification
 * @param userId
 * @param criteria
 * @param callBack
 */
NotificationSchema.statics.saveNotification = function(new_notification,callBack){

    var notification = new this();
    notification.sender = Util.toObjectId(new_notification.sender);
    notification.notification_type = new_notification.notification_type;
    notification.notified_post = Util.toObjectId(new_notification.notified_post);
    notification.save(function(err, result){
        if(!err){
            callBack({
                status:200,
                result:result
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
NotificationSchema.statics.getNotifications = function(criteria,callBack){

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




mongoose.model('Notification',NotificationSchema);
