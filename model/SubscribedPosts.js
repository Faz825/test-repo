/**
 * Notification Model will communicate with notifications collection
 */

'use strict'
var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

/**
 * Notification
 */
var SubscribedPostSchema = new Schema({
    user_id:{
        type: Schema.ObjectId,
        ref: 'User',
        default:null
    },
    post_id:{ // the post that origin user comment / share / like ...
        type: Schema.ObjectId,
        ref: 'Post',
        default:null
    },

},{collection:"subscribed_posts"});

/**
 * Save subscription
 * @param callBack
 */
SubscribedPostSchema.statics.saveSubscribe = function(new_subscription,callBack){

    var subscription = new this();
    subscription.user_id = Util.toObjectId(new_subscription.user_id);
    subscription.post_id = Util.toObjectId(new_subscription.post_id);

    var criteria = {
        user_id:Util.toObjectId(new_subscription.user_id),
        post_id:Util.toObjectId(new_subscription.post_id)
    }

    this.find(criteria).exec(function(err,resultSet){
        if(!err && resultSet.length == 0){
            subscription.save(function(err, result){
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

        }else{
            console.log("Server Error --------")
            callBack({status:400,error:err});
        }
    })




};

/**
 * Get notifications based on criteria
 * @param criteria
 * @param callBack
 */
SubscribedPostSchema.statics.getSubscribedUsers = function(criteria,callBack){

    this.find(criteria).exec(function(err,resultSet){
        if(!err){
            callBack({
                status:200,
                users:resultSet
            });
        }else{
            console.log("Server Error --------")
            callBack({status:400,error:err});
        }
    })


};




mongoose.model('SubscribedPost',SubscribedPostSchema);
