/**
 * Handle Saved Articles
 */
'use strict';

var  mongoose = require('mongoose'),
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
        ref: 'Channels',
        default:null
    },
    article:{
        type: Schema.ObjectId,
        ref: 'Articles',
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
 * Add news category
 * @param userId
 * @param criteria
 * @param callBack
 */
SavedArticleSchema.statics.saveArticle =function(req_news_categories,callBack){

    var news_categories = [],
        now = new Date();

    for (var i = 0; req_news_categories.length > i; i++) {
        news_categories.push({
            user_id: CurrentSession.id.toObjectId(),
            category: req_news_categories[i].toObjectId(),
            created_at: now
        });
    }

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
SavedArticleSchema.statics.findSavedArticle = function(criteria,callBack){

    var _this = this;

    _this.find(criteria.search).populate(criteria.populate, criteria.populate_field).exec(function(err,resultSet){

        if(!err){
            callBack({
                status:200,
                news:resultSet

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




mongoose.model('SavedArticle',SavedArticleSchema);
