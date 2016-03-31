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
    ALBUM_POST:"AP",
    SHARED_POST:"SP"
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
    shared_post_id:{
        type: Schema.ObjectId,
        default:null
    },
    location:{
        type:String,
        trim:true,
        default:null
    },
    life_event:{
        type: String,
        trim:true
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
    _post.post_mode = post.post_mode;
    _post.location = post.location;
    _post.life_event = post.life_event;
    _post.shared_post_id = (typeof post.shared_post_id != "undefined")?post.shared_post_id:null;
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

}

/**
 * Add Post data to the cache
 * @param users
 * @param data
 */
PostSchema.statics.addToCache=function(users,data,callBack){

    for(var i=0;i<users.length;i++){
        var _cache_key = "idx_post:"+PostConfig.CACHE_PREFIX+users[i];

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
console.log("ch_getPost -- >",_cache_key);
    var query={
        q:payload.q,
        index:_cache_key
    };

    //Find User from Elastic search
    ES.search(query,function(csResultSet){


        if(csResultSet == null){
            callBack(null);
        }else{
            _this.postList(userId,csResultSet.result,function(lpData){
                callBack(lpData);
            });
        }

    });

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

                //Find User from ElasticSearch
                ES.search(query,function(csResultSet){

                    var _postData = {
                        post_id:postData._id.toString(),
                        has_attachment :postData.has_attachment,
                        content : postData.content,
                        created_at:postData.created_at,
                        page_link : postData.page_link,
                        post_visible_mode : postData.post_visible_mode,
                        location:postData.location,
                        post_mode:postData.post_mode,
                        life_event:postData.life_event,
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
PostSchema.statics.postList=function(userId,posts,callBack){
    var _tmp =[],_out_put =[],_tmp_created_date=[],data_by_date ={};


    var _this = this,
        _async = require('async'),
        Comment = require('mongoose').model('Comment'),
        Like =require('mongoose').model('Like');

    var a =0;

    var q = _async.queue(function(post, callBack) {
        var _post = _this.formatPost(post),
            _created_date = _post.date.time_stamp;

        if(_tmp_created_date.indexOf(_created_date) == -1){
            _tmp_created_date.push(_created_date);
        }



        if( typeof data_by_date[_created_date] == 'undefined' ){
            data_by_date[_created_date] = [];
        }


        //GET COMMENT COUNT
        Comment.getCommentCount(_post.post_id,function(commentCount){
            _post['comment_count'] = commentCount;

            var query={
                q:"user_id:"+post.created_by.toString(),
                index:'idx_usr'
            };
            //Find User from Elastic search
            ES.search(query,function(csResultSet){
                _post['created_by'] = csResultSet.result[0];


                Like.getLikedUsers(_post.post_id,0,function(likedUsers,likedUserIds){
                    _post['like_count'] = likedUsers.length;
                    _post['liked_user'] = likedUsers;
                    _post['is_i_liked'] = (likedUserIds.indexOf(userId) == -1)?0:1;

                    data_by_date[_created_date].push(_post) ;

                    callBack();
                })


            });

        });

    }, 1);

    q.drain = function() {
        console.log(data_by_date);
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

    };

    q.push(posts);

    /*_async.each(posts,
        function(post,callBack){
            var _post = _this.formatPost(post),
            _created_date = _post.date.time_stamp;

            if(_tmp_created_date.indexOf(_created_date) == -1){
                _tmp_created_date.push(_created_date);
            }



            if( typeof data_by_date[_created_date] == 'undefined' ){
                data_by_date[_created_date] = [];
            }


            //GET COMMENT COUNT
            Comment.getCommentCount(_post.post_id,function(commentCount){
                _post['comment_count'] = commentCount;

                var query={
                    q:"user_id:"+post.created_by.toString(),
                    index:'idx_usr'
                };
                //Find User from Elastic search
                ES.search(query,function(csResultSet){
                    _post['created_by'] = csResultSet.result[0];


                    Like.getLikedUsers(_post.post_id,0,function(likedUsers,likedUserIds){
                        _post['like_count'] = likedUsers.length;
                        _post['liked_user'] = likedUsers;
                        _post['is_i_liked'] = (likedUserIds.indexOf(userId) == -1)?0:1;

                        data_by_date[_created_date].push(_post) ;

                        callBack(data_by_date);
                    })


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
            console.log("postList");
            console.log(data_by_date);
            callBack(_out_put)

        }
    );*/





}







/**
 * Format Post object
 * @param postData
 */
PostSchema.statics.formatPost=function(postData){

    var outPut = {
        post_id:postData.post_id,
        has_attachment:(postData.has_attachment)?postData.has_attachment:false,
        post_mode:postData.post_mode,
        content:(postData.content)?postData.content:"",
        created_by:postData.created_by,
        post_visible_mode:postData.post_visible_mode,
        date:DateTime.explainDate(postData.created_at),
        location:(postData.location)?postData.location:"",
        life_event:(postData.life_event)?postData.life_event:"",
        upload:(postData.has_attachment)?postData.upload:[],
        shared_post:(postData.shared_post)?postData.shared_post:""

    }

    return outPut;
}
mongoose.model('Post',PostSchema);