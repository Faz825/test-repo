/**
 * Handle Favourite news Categories
 */
'use strict';

var  mongoose = require('mongoose'),
    Schema   = mongoose.Schema;



var FavouriteNewsCategorySchema = new Schema({
    user_id:{
        type: Schema.ObjectId,
        ref: 'User',
        default:null
    },
    category:{
        type: Schema.ObjectId,
        ref: 'News',
        default:null
    },
    channels:[{
        type: Schema.ObjectId,
        default:null
    }],
    created_at:{
        type:Date
    },
    updated_at:{
        type:Date
    }
},{collection:"favourite_news_categories"});



FavouriteNewsCategorySchema.pre('save', function(next){
    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }
    next();
});

/**
 * Add news category
 * @param userId
 * @param criteria
 * @param callBack
 */
FavouriteNewsCategorySchema.statics.addUserNewsCategory =function(news_categories,callBack){



    this.collection.insert(news_categories,function(err,resultSet){
        if(! err){
            callBack({status:200,
                connected:resultSet.result.ok});
        }else{
            console.log("Server Error --------");
            console.log(err);
            callBack({status:400,error:err});
        }

    });
};


/**
 * Get requested fields By Search Criteria
 * @param criteria
 * @param callBack
 */
FavouriteNewsCategorySchema.statics.findFavouriteNewsCategory = function(criteria,callBack){

    var _this = this;

    _this.find(criteria.search).populate(criteria.populate, criteria.populate_field).exec(function(err,resultSet){

        if(!err){
            callBack({
                status:200,
                categories:resultSet

            });
        }else{
            console.log("Server Error --------")
            callBack({status:400,error:err});
        }
    });
};


/**
 * delete a News Category
 * @param categoryId
 * @param callBack
 */
FavouriteNewsCategorySchema.statics.deleteNewsCategory=function(criteria, callBack){

    var _this = this;

    _this.findOneAndRemove(criteria,function(err,resultSet){
        if(!err){
            callBack({status:200});
        }else{
            console.log("Server Error --------");
            callBack({status:400,error:err});
        }
    });

};


/**
 * Add user's favourite News Channel for Category
 * @param criteria
 * @param data
 * @param callBack
 */
FavouriteNewsCategorySchema.statics.addUserNewsChannel =function(criteria, data, callBack){

    var _this = this;

    _this.update(
        criteria,
        {$push:data},function(err,resultSet){
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
 * Get requested fields By Search Criteria
 * @param criteria
 * @param callBack
 */
FavouriteNewsCategorySchema.statics.findFavouriteNewsChannel = function(criteria,callBack){

    var _this = this;

    _this.aggregate([
        { $match:criteria.search},
        { $unwind: '$channels'},
        {
            $lookup:{
                from:"news",
                localField:"category",
                foreignField:"_id",
                as:"channelsData"
            }
        },
        { $unwind: '$channelsData'},
        { $unwind: '$channelsData.channels'},
        {
            $project: {
                _id:1,
                user_id:1,
                category_id:"$category",
                category:"$channelsData.category",
                channel_id:"$channelsData.channels._id",
                channel_name:"$channelsData.channels.name",
                isEqual: {$eq:["$channels", "$channelsData.channels._id"]}
            }
        },
        { $match:{ "isEqual":true}}
    ], function(err, resultSet){
        if(!err){

            callBack({
                status:200,
                channels:resultSet

            });
        }else {
            console.log("Server Error --------")
            callBack({status: 400, error: err});
        }
    });
};


/**
 * delete User's news channel of a News Category
 * @param categoryId
 * @param callBack
 */
FavouriteNewsCategorySchema.statics.deleteNewsChannel = function(criteria, pullData, callBack){

    var _this = this;

    _this.update(criteria,
        { $pull: pullData},function(err,resultSet){
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
 * Format Channel Detail
 * @param userObject
 */
FavouriteNewsCategorySchema.statics.formatFavouriteNewsChannel = function(newsObject){

    if(newsObject){

        var selectedChannels = newsObject.channels;
        var allChannels = newsObject.category.channels;

        var _channels = [];

        for(var i = 0; i < allChannels.length; i++){
            var j = selectedChannels.indexOf(allChannels[i]._id);
            if(j != -1){
                var channel = {
                    channel_id:allChannels[i]._id,
                    channel_name:allChannels[i].name
                }
                _channels.push(channel);
            }
        }

        return _channels;
    }

};


String.prototype.toObjectId = function() {
    var ObjectId = (require('mongoose').Types.ObjectId);
    return new ObjectId(this.toString());
};



mongoose.model('FavouriteNewsCategory',FavouriteNewsCategorySchema);
