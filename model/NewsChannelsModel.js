/**
 * This is Life event Model
 */


'use strict'
var  mongoose = require('mongoose'),
    Schema   = mongoose.Schema,
    uuid = require('node-uuid');


var NewsChannelsSchema = new Schema({

    user_id:{
        type: Schema.ObjectId,
        ref: 'User',
        default:null
    },
    category_id:{
        type: Schema.ObjectId,
        ref: 'news',
        default:null
    },
    channel_name:{
        type:String,
        trim:true
    },
    created_at:{
        type:Date
    }

},{collection:"news_channels"});


/**
 * Get requested fields By Search Criteria
 * @param criteria
 * @param callBack
 */
NewsChannelsSchema.statics.findNewsChannel = function(criteria,callBack){
    var _this = this;

    _this.find(criteria.search).lean().exec(function(err,resultSet){

        if(!err){

            callBack({
                status:200,
                channel_list:resultSet

            });
        }else{
            console.log("Server Error --------")
            callBack({status:400,error:err});
        }
    });

};

NewsChannelsSchema.statics.isChannelExistsForUser = function(payload,callBack){

    var _this = this;
    var criteria = {
        user_id: payload.user_id,
        channel_name: payload.channel_name
    };

    _this.findOne(criteria).exec(function (err, resultSet) {
        if (!err) {

            console.log("is exists "+resultSet);

            if(resultSet){
                callBack(true);
            }else{
                callBack(false);
            }
        } else {
            console.log(err);
            callBack({status: 400, error: err});
        }
    });

};

NewsChannelsSchema.statics.addChannelByUser = function(channelData,callBack){

    var newChannel = new this();
    newChannel.user_id 	= channelData.user_id;
    newChannel.category_id = channelData.category_id;
    newChannel.channel_name = channelData.channel_name;
    newChannel.created_at = channelData.created_at;

    newChannel.save(function(err,resultSet){

        if(!err){
            callBack({
                status:200,
                newChannel:resultSet
            });
        }else{
            console.log("Server Error --------");
            callBack({status:400,error:err});
        }

    });

};

NewsChannelsSchema.statics.getChannelsByUser = function(user_id,callBack){

    var _this = this;

    var criteria = {user_id:user_id};

    _this.find(criteria.search).lean().exec(function(err,resultSet){

        if(!err){

            callBack({
                status:200,
                channel_list:resultSet

            });
        }else{
            console.log("Server Error --------")
            callBack({status:400,error:err});
        }
    });

};


NewsChannelsSchema.statics.formatNewsChannels = function(categoryChannels, userChannels) {

    var updatedChannelsList = [];

    for(var b=0;b<categoryChannels.length;b++){

        var obj = userChannels.filter(function ( obj ) {
            return obj.channel_name === categoryChannels[b].name;
        })[0];

        if(obj) {
            updatedChannelsList.push(categoryChannels[b]);
        }
    }
    return updatedChannelsList;
},


mongoose.model('NewsChannels',NewsChannelsSchema);