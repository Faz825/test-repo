/**
 * This is post model that allows to handle all the Operations .
 */
'use strict'
var  mongoose = require('mongoose'),
     Schema   = mongoose.Schema,
     uuid = require('node-uuid');

GLOBAL.PostVisibleMode ={
    PUBLIC:1,
    FRIEND_ONLY:2,
    ONLY_MY:3,
    SELECTED_USERS:4
};

GLOBAL.PostConfig={
    CACHE_PREFIX :"user:",
    NORMAL_POST:"NP",
    LIFE_EVENT:"LE",
    VIDEO_POST:"VP",
    LOCATION_POST:"LP",
    ALBUM_POST:"AP"
};


var PostSchema = new Schema({
    has_attachment:{
        type:Boolean,
        default:false
    },
    content:{
        type:String,
        trim:true
    },
    created_by:{
        type: Schema.ObjectId,
        ref: 'User',
        default:null
    },
    page_link:{
        type:String,
        trim:true,
        default:null
    },
    post_visible_mode:{
        type:Number,
        default:1
    },
    visible_users:[],
    post_mode:{
        type:String,
        default:PostConfig.NORMAL_POST,

    },
    created_at:{
        type:Date
    },
    updated_at:{
        type:Date
    }
},{collection:'posts'});


/**
 *
 */
PostSchema.pre('save', function(next){
    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }
    next();
});

/**
 * Create new post
 * @param post
 * @param callBack
 */
PostSchema.statics.create = function(post,callBack){
    var _this = this;
    var _post = new this();
    _post.has_attachment = post.has_attachment;
    _post.content = post.content;
    _post.created_by = Util.toObjectId(post.created_by);
    _post.page_link = post.page_link;
    _post.post_visible_mode = post.post_visible_mode;
    _post.visible_users = [];
    _post.post_mode = post.post_mode
    var _async = require('async');
    _async.waterfall([

        function getPostVisibleUsers(callBack){
            // Add to Cache when it is public or Friend only
            // TODO:: think for Friend only algorithm separately
            if(parseInt(post.post_visible_mode) == PostVisibleMode.PUBLIC ||
                parseInt(post.post_visible_mode) == PostVisibleMode.FRIEND_ONLY ){
                var Connection = require('mongoose').model('Connection');
                Connection.getConnectedUserIds(post.created_by,function(connectedUserIds){
                    _post.visible_users = connectedUserIds.connected_user_ids;
                    _post.visible_users.push(post.created_by);
                    callBack(null)
                });
            }
            //Add to list it is Friend only for me
            else if(parseInt(post.post_visible_mode) == PostVisibleMode.ONLY_MY){
                _post.visible_users.push(post.created_by);
                callBack(null)
            }

            else if(parseInt(post.post_visible_mode) == PostVisibleMode.SELECTED_USERS){
                _post.visible_users= post.visible_users;
                callBack(null)
            }

        },

        function savePost(callBack){
            _post.save(function(err,postData){
                if(!err){
                    var query={
                        q:post.created_by.toString(),
                        index:'idx_usr'
                    };

                    //Find User from Elastisearch
                    ES.search(query,function(csResultSet){

                        var _postData = {
                            post_id:postData._id,
                            has_attachment :postData.has_attachment,
                            content : postData.content,
                            created_at:postData.created_at,
                            page_link : postData.page_link,
                            post_visible_mode : postData.post_visible_mode,
                            created_by : csResultSet.result[0],
                        };

                        //TODO:: Handle attachment post later


                        _this.addToCache(_post.visible_users,_postData);
                        callBack(null,_postData);

                        return 0;
                    });

                }else{
                    console.log("Server Error --------");
                    console.log(err);
                    callBack(null,err);
                }

            });
        }

    ],function(err,resultSet){

        callBack(resultSet)
    });
}

/**
 * Add Post data to the cache
 * @param users
 * @param data
 */
PostSchema.statics.addToCache=function(users,data){
    console.log(users)
    for(var i=0;i<users.length;i++){
        var _cache_key = PostConfig.CACHE_PREFIX+users[i];
        console.log(_cache_key)
        CacheEngine.addToList(_cache_key,data,function(outData){
            console.log(outData)
        });
    }
}


/**
 * 2 4 | 4 6
 * Get Post From Cache based on User
 * @param userId
 * @param callBack
 */
PostSchema.statics.getPost= function(userId,page,callBack){
    var _this = this;
    var _cache_key = PostConfig.CACHE_PREFIX+userId;

    var _page = (page <= 1)?0 :parseInt(page)  - 1;
    var _start_index    = Config.RESULT_PER_PAGE*_page;
    var _end_index      =  (Config.RESULT_PER_PAGE*(_page+1) -1);

    CacheEngine.getList(_cache_key,_start_index,_end_index,function(chResultSet){
        callBack(_this.postList(chResultSet.result));
    });

}
/**
 * Format Post list
 * @param posts
 */
PostSchema.statics.postList=function(posts){

    var _out_put =[];
    for(var a=0;a<posts.length;a++){
        var _post = this.formatPost(posts[a]);
        _out_put.push(_post);
    }
    return _out_put;
}
/**
 * Format Post object
 * @param postDate
 */
PostSchema.statics.formatPost=function(postDate){

    return {
        post_id:postDate._id,
        has_attachment:postDate.has_attachment,
        content:postDate.content,
        created_by:postDate.created_by,
        post_visible_mode:postDate.post_visible_mode,
        date:DateTime.explainDate(postDate.created_at)
    }
}
mongoose.model('Post',PostSchema);