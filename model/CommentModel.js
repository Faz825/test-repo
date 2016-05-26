/**
 * Handle Comments
 */

'use strict';

var  mongoose = require('mongoose'),
    Schema   = mongoose.Schema;


GLOBAL.CommentConfig ={
    CACHE_PREFIX:"post:comment:"
}

var CommentSchema = new Schema({
    post_id:{
        type: Schema.ObjectId,
        ref: 'Post',
    },
    user_id:{
        type: Schema.ObjectId,
        ref: 'User',
        default:null
    },
    comment:{
        type:String,
        default:null,
        trim:true
    },
    created_at:{
        type:Date
    },
    updated_at:{
        type:Date
    }
},{collection:"comments"});

CommentSchema.pre('save', function(next){
    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }
    next();
});



/**
 * Add Comment to the system
 * this will add to the cache too
 * @param comment
 * @param callBack
 */
CommentSchema.statics.addComment = function (comment,callBack) {

    var _comment = new this(),
        _this = this;

    _comment.post_id = Util.toObjectId(comment.post_id);
    _comment.user_id = Util.toObjectId(comment.user_id);
    _comment.comment = comment.comment;

    //ADD TO THE DATA BASE
    _comment.save(function(err,resultSet){

        if(!err){

            callBack({status:200,comment:resultSet});

        }else{
            console.log("Server Error --------");
            console.log(err);
            callBack({status:400,error:err});
        }
    })

}


/**
 * Get Comments by Post Id
 * @param postId
 * @param callBack
 */
CommentSchema.statics.getComments = function(postId,page,callBack){
    var _this = this;
    var _cache_key = CommentConfig.CACHE_PREFIX+postId;

    var _page = (page <= 1)?0 :parseInt(page)  - 1;
    var _start_index    = Config.RESULT_PER_PAGE*_page;
    var _end_index      =  (Config.RESULT_PER_PAGE*(_page+1) -1);

    CacheEngine.getList(_cache_key,_start_index,_end_index,function(chResultSet){
        callBack(_this.formatCommentList(chResultSet.result));
    });
}
/**
 * Get Comments count
 * @param postId
 * @param callBack
 */
CommentSchema.statics.getCommentCount = function(postId,callBack){
    var _this = this;
    var _cache_key = CommentConfig.CACHE_PREFIX+postId;
    CacheEngine.getListCount(_cache_key,function(chResultCount){
        callBack(chResultCount);
    });
}

/**
 * Add to Cache
 * @param postId
 * @param data
 */
CommentSchema.statics.addToCache=function(postId,data){
    var _cache_key = CommentConfig.CACHE_PREFIX+postId;
    CacheEngine.addBottomToList(_cache_key,data,function(outData){
    });

}

CommentSchema.statics.formatCommentList = function(comments){
    var temp =[]
    for(var a=0;a<comments.length;a++){
        temp.push({
            comment_id:comments[a].comment_id,
            post_id:comments[a].post_id,
            comment:comments[a].comment,
            commented_by:comments[a].commented_by,
            date:DateTime.explainDate(comments[a].created_at),
            attachment:comments[a].attachment

        })
    }

    return temp;
}



mongoose.model('Comment',CommentSchema);