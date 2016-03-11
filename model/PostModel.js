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
    comment_count:{
        type:Number,
        default:0
    },
    like_count:{
        type:Number,
        default:0
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
PostSchema.statics.addNew = function(post,callBack){
    var _this = this;
    var _post = new this();
    _post.has_attachment = post.has_attachment;
    _post.content = post.content;
    _post.created_by = Util.toObjectId(post.created_by);
    _post.page_link = post.page_link;
    _post.post_visible_mode = post.post_visible_mode;
    _post.visible_users = [];
    _post.post_mode = post.post_mode
    _post.save(function(err,postData){

        if(!err){
            callBack({
                status:200,
                post:postData
            });
        }else{
            console.log("Server Error --------");
            console.log(err);
            callBack({status:400,error:err});
        }

    });

/*



    var _async = require('async');
    _async.waterfall([



        function savePost(callBack){
            _post.save(function(err,postData){
                if(!err){
                    var _postData = {
                        post_id:postData._id.toString(),
                        has_attachment :postData.has_attachment,
                        content : postData.content,
                        created_at:postData.created_at,
                        page_link : postData.page_link,
                        post_visible_mode : postData.post_visible_mode,
                        comment_count :postData.comment_count,
                        lik_count:postData.like_count,
                        created_by:postData.created_by,
                        post_mode:postData.post_mode

                    };

                    //TODO:: Handle attachment post later
                    _this.addToCache(_post.visible_users,_postData,function(){

                    });

                    var query={
                        q:_postData.created_by.toString(),
                        index:'idx_usr'
                    };
                    //Find User from Elastic search
                    ES.search(query,function(csResultSet){
                        _postData['created_by'] = csResultSet.result[0];
                        _postData['date'] = DateTime.explainDate(postData.created_at);
                        callBack(null,_postData);

                    });


                    return 0;
                }else{
                    console.log("Server Error --------");
                    console.log(err);
                    callBack(null,err);
                }

            });
        }


    ],function(err,resultSet){

        callBack(resultSet)
    });*/
}

/**
 * Add Post data to the cache
 * @param users
 * @param data
 */
PostSchema.statics.addToCache=function(users,data,callBack){

    for(var i=0;i<users.length;i++){
        var _cache_key = "idx_post:"+PostConfig.CACHE_PREFIX+users[i];
        console.log(_cache_key)

        var payLoad={
            index:_cache_key,
            id:data.post_id.toString(),
            type: 'posts',
            data:data,
            tag_fields:['content']
        }

        ES.createIndex(payLoad,function(resultSet){

            callBack(resultSet)
        });

    }
}


/**
 * 2 4 | 4 6
 * Get Post From Cache based on User
 * @param userId
 * @param callBack
 */
PostSchema.statics.ch_getPost= function(userId,payload,callBack){
    var _this = this;

    var _cache_key = "idx_post:"+PostConfig.CACHE_PREFIX+userId;

    var query={
        q:payload.q,
        index:_cache_key
    };

    //Find User from Elastic search
    ES.search(query,function(csResultSet){
        _this.postList(csResultSet.result,function(lpData){
            callBack(lpData);
        });
    });

}


/**
 * Update Post User data
 * this user data contain Liked users,Commented Users, sheared Users
 * @param postId
 * @param payLoad
 * @param callBack
 */
PostSchema.statics.updatePostData = function (payLoad,callBack){

    var _this = this,
        _async = require('async');

    _async.waterfall([

        function updatePost(callBack){
            var _update_param = {};

            if(payLoad.is_commented_user){
                _update_param= {
                    $set:{
                        comment_count:payLoad.comment_count
                    }
                }
            }else if( payLoad.is_liked_users){
                _update_param= {
                    $set:{
                        like_count:payLoad.like_count
                    }
                }
            }

            _this.update({_id:Util.toObjectId(payLoad.post_id)},_update_param,function(err,resultSet){
                if(!err){
                    callBack({
                        status:200
                    });
                }else{
                    console.log("Server Error --------", err);
                    callBack({status:400,error:err});
                }
            });


        },
        function getUserFromCache(callBack){
            var query={
                q:payLoad.user_id,
                index:'idx_usr'
            };
            ES.search(query,function(csResultSet){
                var formattedUser ={
                    user_id:csResultSet.result[0].user_id,
                    first_name:csResultSet.result[0].first_name,
                    last_name:csResultSet.result[0].last_name,

                }
                console.log(csResultSet.result[0])
                callBack(null,formattedUser)
            });

        },
        function updateCache(callBack){

        }

    ],function(err,dataSet){

    });








    //THIS IS NEEDED FOR UPDATE LATEST CHANGES IN POST
   /* _this.db_getPost({_id:Util.toObjectId(postId)},function(postData){

            if(postData.status == 200){


                if(typeof payLoad.commented_users != 'undefined' && payLoad.commented_users.length >0){

                }

                if(typeof payLoad.liked_users != 'undefined' && payLoad.liked_users.length > 0){

                }









            }

    })*/
}

/**
 * Get Single Post from Database
 * @param postId
 * @param callBack
 */
PostSchema.statics.db_getPost = function(criteria,callBack){
    var _this = this;
    _this.findOne(criteria)
        .exec(function(err,postData){
            if(!err){

                var query={
                    q:postData.created_by.toString(),
                    index:'idx_usr'
                };

                //Find User from Elastisearch
                ES.search(query,function(csResultSet){

                    var _postData = {
                        post_id:postData._id.toString(),
                        has_attachment :postData.has_attachment,
                        content : postData.content,
                        created_at:postData.created_at,
                        page_link : postData.page_link,
                        post_visible_mode : postData.post_visible_mode,
                        created_by : csResultSet.result[0],
                    };
                    callBack({status:200,post:_postData});

                    return 0;
                });


            }else{
                console.log("Server Error --------")
                callBack({status:400,error:err});
            }
        });
}






/**
 * DATA FORMATTER HELPER FUNCTION WILL DEFINE HERE
 */

/**
 * Format Post list
 * @param posts
 */
PostSchema.statics.postList=function(posts,callBack){
    var _tmp =[],_out_put =[],_tmp_created_date=[],data_by_date ={};


    var _this = this,
        _async = require('async'),
        Comment = require('mongoose').model('Comment');

    var a =0;
    _async.each(posts,
        function(post,callBack){
            var _post = _this.formatPost(post),
            _created_date = _post.date.time_stamp;


            if(_tmp_created_date.indexOf(_created_date) == -1)
                _tmp_created_date.push(_created_date);


            if( typeof data_by_date[_created_date] == 'undefined' )
                data_by_date[_created_date] = [];

            //GET COMMENT COUNT
            Comment.getCommentCount(_post.post_id,function(commentCount){
                _post['comment_count'] = commentCount;

                var query={
                    q:post.created_by.toString(),
                    index:'idx_usr'
                };
                //Find User from Elastic search
                ES.search(query,function(csResultSet){
                    _post['created_by'] = csResultSet.result[0];
                    data_by_date[_created_date].push(_post) ;
                    callBack()
                });

            });

        },
        function(err){
            _tmp_created_date.sort(function(a,b){
                return b - a;
            });

            for(var i = 0 ; i< _tmp_created_date.length;i++){
                var _created_date = _tmp_created_date[i];
                for(var a = 0 ; a< data_by_date[_created_date].length;a++){
                    _out_put.push(data_by_date[_created_date][a]);
                }
            }
            callBack(_out_put)

        }
    );

}







/**
 * Format Post object
 * @param postDate
 */
PostSchema.statics.formatPost=function(postDate){

    var outPut = {
        post_id:postDate.post_id,
        has_attachment:postDate.has_attachment,
        post_mode:postDate.post_mode,
        content:postDate.content,
        created_by:postDate.created_by,
        post_visible_mode:postDate.post_visible_mode,
        date:DateTime.explainDate(postDate.created_at),
        upload:(postDate.has_attachment)?postDate.upload:[]

    }

    return outPut;
}
mongoose.model('Post',PostSchema);