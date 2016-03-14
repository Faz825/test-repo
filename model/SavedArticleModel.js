/**
 * Handle Saved Articles
 */
'use strict';

var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;



var SavedArticleSchema = new Schema({
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
    channel:{
        type: Schema.ObjectId,
        default:null
    },
    article:{
        type: Schema.ObjectId,
        default:null
    },
    created_at:{
        type:Date
    },
    updated_at:{
        type:Date
    }
},{collection:"saved_articles"});



SavedArticleSchema.pre('save', function(next){
    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }
    next();
});

/**
 * Save article to a user
 * @param userId
 * @param criteria
 * @param callBack
 */
SavedArticleSchema.statics.saveArticle =function(req_saved_articles,callBack){

    var articles = [],
        now = new Date(),
        user = "56c6aeaa6e1ac13e18b2400d";

    for (var i = 0; req_saved_articles.length > i; i++) {
        articles.push({
            user_id:user.toObjectId(),
            category:req_saved_articles[i].category.toObjectId(),
            channel:req_saved_articles[i].channel.toObjectId(),
            article:req_saved_articles[i].article.toObjectId(),
            created_at: now
        });
    }

    this.collection.insert(articles,function(err,resultSet){
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
 * Get saved articles to a user
 * @param criteria
 * @param callBack
 */
SavedArticleSchema.statics.findSavedArticle = function(criteria,callBack){

    var _this = this;

    _this.aggregate([
        { $match:criteria.search },
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
        { $unwind: '$channelsData.channels.articles'},
        {
            $project: {
                _id:1,
                user_id:1,
                category_id:"$category",
                category:"$channelsData.category",
                channel_id:"$channel",
                channel_name:"$channelsData.channels.name",
                article_id:"$article",
                article_heading:"$channelsData.channels.articles.heading",
                isEqual: {$eq:["$article", "$channelsData.channels.articles._id"]}
            }
        },
        { $match:{ "isEqual":true}}
    ], function(err, resultSet){
        if(!err){

            callBack({
                status:200,
                articles:resultSet

            });
        }else {
            console.log("Server Error --------")
            callBack({status: 400, error: err});
        }
    });

};


/**
 * delete a News Category
 * @param categoryId
 * @param callBack
 */
SavedArticleSchema.statics.deleteSavedArticle=function(criteria, callBack){

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

String.prototype.toObjectId = function() {
    var ObjectId = (require('mongoose').Types.ObjectId);
    return new ObjectId(this.toString());
};




mongoose.model('SavedArticle',SavedArticleSchema);
