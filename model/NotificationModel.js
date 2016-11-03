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
    notified_notebook:{ // if a notebook request then notebook id
        type: Schema.ObjectId,
        ref: 'NoteBook',
        default:null
    },
    notified_event:{ // if a event request then event id
        type: Schema.ObjectId,
        ref: 'CalenderEvent',
        default:null
    },
    notified_folder:{
        type: Schema.ObjectId,
        ref: 'Folders',
        default:null
    },
    notification_status:{ // Accept / Reject the invitation ...
        type:String,
        trim:true,
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
    if(new_notification.notification_type == Notifications.SHARE_CALENDER ) {
        notification.notified_event = (new_notification.notified_event);
        notification.notification_status = "";

    }else if(new_notification.notification_type != Notifications.SHARE_NOTEBOOK
        && new_notification.notification_type != Notifications.SHARE_NOTEBOOK_RESPONSE){

    } else {
        notification.notified_notebook = Util.toObjectId(new_notification.notified_notebook);
        notification.notification_status = new_notification.notification_status;
    }
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


/**
 * Get notifications based on criteria
 * @param criteria
 * @param callBack
 */
NotificationSchema.statics.getFirstNotification = function(criteria,callBack){
    console.log("NotificationSchema.statics.getFirstNotification")

    this.findOne(criteria).sort({created_at:1}).exec(function(err,resultSet){

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

/**
 * delete notifications based on criteria
 * @param criteria
 * @param callBack
 */
NotificationSchema.statics.deleteNotification = function(criteria,callBack){
    console.log("NotificationSchema.statics.deleteNotification")

    this.remove(criteria).exec(function(err,resultSet){

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
