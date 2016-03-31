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

    heading:{
        type:String,
        trim:true,
        default:null
    },
    article_image:{
        type:String,
        trim:true,
        default:null
    },
    content:{
        type:String,
        trim:true,
        default:null
    },
    article_date:{
        type:String,
        trim:true,
        default:null
    },
    created_at:{
        type:Date
    },
    channel:{
        type:String,
        trim:true,
        default:null
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
SavedArticleSchema.statics.saveArticle =function(articel,callBack){
    var _article =  new this();
    _article.user_id = articel.user_id;
    _article.heading = articel.heading;
    _article.article_image=articel.article_image
    _article.content=articel.content;
    _article.article_date=articel.article_date;
    _article.channel = articel.channel
    _article.save(function(err,success){
        if(!err){
            callBack({status:200});
        }else{
            console.log("Server Error --------");
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

    this.find({user_id:Util.toObjectId(criteria.user_id)}).exec(function(err,resultSet){
        if(!err){
            callBack({
                status:200,
                news_list:resultSet
            });
        }else{
            console.log("Server Error --------")
            callBack({status:400,error:err});
        }
    })
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
