/**
 * TimeLinePostHandler is middle ware class that perform Time line post operations
 */


var TimeLinePostHandler ={

    /**
     * Add new post is collection of sub tasks.
     * 1) Get Post owner friend list. This will help to retrieve data fast based on the friends
     * 2) Save Post in to the data base
     * 3) If attachment exist copy from temp location to the CDN
     * 4) Update Elastic Search
     * 5) Return Formatted Dataset to the front end
     * @param postData
     * @param callBack
     */
    addNewPost:function(postData,callBack){
        var _async = require('async'),
            Post = require('mongoose').model('Post'),
            _post = postData;
        _async.waterfall([
            //GET FRIEND LIST BASED ON POST OWNER
            function getPostVisibleUsers(callBack){
                // Add to Cache when it is public or Friend only
                // TODO:: think for Friend only algorithm separately
                if(parseInt(_post.post_visible_mode) == PostVisibleMode.PUBLIC ||
                    parseInt(_post.post_visible_mode) == PostVisibleMode.FRIEND_ONLY ){
                    var Connection = require('mongoose').model('Connection'),
                        status =[ConnectionStatus.REQUEST_ACCEPTED];
                    Connection.getFriends(_post.created_by,status,function(myFriendIds){
                        _post.visible_users = myFriendIds.friends_ids;
                        _post.visible_users.push(_post.created_by);
                        callBack(null)
                    });
                }
                //Add to list it is Friend only for me
                else if(parseInt(_post.post_visible_mode) == PostVisibleMode.ONLY_MY){
                    _post.visible_users.push(_post.created_by);
                    callBack(null)
                }

                else if(parseInt(_post.post_visible_mode) == PostVisibleMode.SELECTED_USERS){
                    _post.visible_users= _post.visible_users;
                    callBack(null)
                }
            },
            function savePostInDb(callBack){

                Post.addNew(_post,function(postData){

                    if(postData.status ==200){
                        _post.post_id       = postData.post._id
                        _post['created_at'] = postData.post.created_at;
                    }
                    callBack(null)
                });

            },
            //COPY CONTENT TO CDN
            function copyToCDN(callBack){

                _post['upload'] = [];
                if(_post.has_attachment){
                    var payLoad ={
                       entity_id:_post.upload_id,
                       entity_tag:UploadMeta.TIME_LINE_IMAGE,
                       post_id: _post.post_id
                    };
                    ContentUploader.copyFromTempToDb(payLoad,function(uploadData){
                        _post['upload']= uploadData;
                        callBack(null)
                    })
                }else{
                    callBack(null)
                }

            },
            function saveInCache(callBack){

                Post.addToCache(_post.visible_users,_post,function(chData){ });
                callBack(null)
            },
            function finalizedPost(callBack){

                var query={
                    q:_post.created_by.toString(),
                    index:'idx_usr'
                };

                _post['date'] = DateTime.explainDate(_post.created_at)
                //Find User from Elastic search
                ES.search(query,function(csResultSet){
                    delete _post['created_by'];
                    _post['created_by'] = csResultSet.result[0];
                    callBack(null);

                });
            }

        ],function(err,resultSet){
            callBack(_post)
        });


    },

    /**
     * Share Post
     * 1) Get Post owner friend list. This will help to retrieve data fast based on the friends
     * 2) Save Post in to the data base
     * 3) Get Shared Post detail from ES
     * 4) Update Elastic Search
     * 5) Return Formatted Dataset to the front end
     * @param data
     * @param callBack
     */
    sharePost:function(postData,callBack){
        var _async = require('async'),
            Post = require('mongoose').model('Post'),
            _post = postData;
        _async.waterfall([
            //GET FRIEND LIST BASED ON POST OWNER
            function getPostVisibleUsers(callBack){
                // Add to Cache when it is public or Friend only
                // TODO:: think for Friend only algorithm separately
                if(parseInt(_post.post_visible_mode) == PostVisibleMode.PUBLIC ||
                    parseInt(_post.post_visible_mode) == PostVisibleMode.FRIEND_ONLY ){
                    var Connection = require('mongoose').model('Connection'),
                        status =[ConnectionStatus.REQUEST_ACCEPTED];
                    Connection.getFriends(_post.created_by,status,function(myFriendIds){
                        _post.visible_users = myFriendIds.friends_ids;
                        _post.visible_users.push(_post.created_by);
                        callBack(null)
                    });
                }
                //Add to list it is Friend only for me
                else if(parseInt(_post.post_visible_mode) == PostVisibleMode.ONLY_MY){
                    _post.visible_users.push(_post.created_by);
                    callBack(null)
                }

                else if(parseInt(_post.post_visible_mode) == PostVisibleMode.SELECTED_USERS){
                    _post.visible_users= _post.visible_users;
                    callBack(null)
                }
            },
            function savePostInDb(callBack){



                Post.addNew(_post,function(postData){


                    if(postData.status ==200){
                        _post.post_id       = postData.post._id
                        _post['created_at'] = postData.post.created_at;
                    }
                    callBack(null)
                });

            },
            //GET SHARED POST FROM CACHE
            function getPostFromCache(callBack){


                var _pay_load = {
                    q:"post_id:"+_post.shared_post_id,
                }
                Post.ch_getPost(_post.post_owner,_pay_load,function(csResultSet){
                    if(csResultSet.length >0){
                        var selected_post = csResultSet[0];
                        delete selected_post.date;
                        delete selected_post.comment_count;
                        delete selected_post.like_count;
                        delete selected_post.liked_user;
                        delete selected_post.is_i_liked;
                        delete selected_post.is_i_liked;
                        delete selected_post.shared_post;


                        _post.shared_post =selected_post;
                        _post.upload = [];

                    }
                    callBack(null);
                });

            },
            function saveInCache(callBack){

               Post.addToCache(_post.visible_users,_post,function(chData){ });
                callBack(null)
            },
            function finalizedPost(callBack){
                var query={
                    q:"user_id:"+_post.created_by.toString(),
                    index:'idx_usr'
                };
                _post['date'] = DateTime.explainDate(_post.created_at)
                //Find User from Elastic search
                ES.search(query,function(csResultSet){
                    delete _post['created_by'];
                    _post['created_by'] = csResultSet.result[0];
                    callBack(null);

                });
            }

        ],function(err,resultSet){

            callBack(_post)
        });
    },


    /**
     * Profile image post is collection of sub tasks.
     * 1) Get Post owner friend list. This will help to retrieve data fast based on the friends
     * 2) Save Post in to the data base
     * 3) Profile picture already in CDN. Only need to add another record in Upload table.
     * 4) Update Elastic Search
     * 5) Return Formatted Dataset to the front end
     * @param postData
     * @param callBack
     */
    profileImagePost:function(postData,callBack){
        console.log("profileImagePost");
        var _async = require('async'),
            Post = require('mongoose').model('Post'),
            _post = postData;
        _async.waterfall([
            //GET FRIEND LIST BASED ON POST OWNER
            function getPostVisibleUsers(callBack){
                console.log("getPostVisibleUsers");
                // Add to Cache when it is public or Friend only
                // TODO:: think for Friend only algorithm separately
                if(parseInt(_post.post_visible_mode) == PostVisibleMode.PUBLIC ||
                    parseInt(_post.post_visible_mode) == PostVisibleMode.FRIEND_ONLY ){
                    var Connection = require('mongoose').model('Connection'),
                        status =[ConnectionStatus.REQUEST_ACCEPTED];
                    Connection.getFriends(_post.created_by,status,function(myFriendIds){
                        _post.visible_users = myFriendIds.friends_ids;
                        _post.visible_users.push(_post.created_by);
                        callBack(null)
                    });
                }
                //Add to list it is Friend only for me
                else if(parseInt(_post.post_visible_mode) == PostVisibleMode.ONLY_MY){
                    _post.visible_users.push(_post.created_by);
                    callBack(null)
                }

                else if(parseInt(_post.post_visible_mode) == PostVisibleMode.SELECTED_USERS){
                    _post.visible_users= _post.visible_users;
                    callBack(null)
                }
            },
            function savePostInDb(callBack){
                console.log("savePostInDb");

                Post.addNew(_post,function(postData){

                    if(postData.status ==200){
                        _post.post_id       = postData.post._id
                        _post['created_at'] = postData.post.created_at;
                    }
                    callBack(null)
                });

            },
            //Add to Uploads
            function saveUploads(callBack){
                console.log("saveUploads");

                var Upload = require('mongoose').model('Upload'),
                    upload_data = [],
                    upload = [];
                _post['upload'] = [];
                if(_post.has_attachment){
                    console.log("_post.has_attachment");

                    upload['file_name'] = _post['profile_picture_data']['file_name'];
                    upload['file_type'] = _post['profile_picture_data']['file_type'];
                    upload['is_default'] = _post['profile_picture_data']['is_default'];
                    upload['entity_id'] = _post['post_id'];
                    upload['entity_tag'] = _post['profile_picture_data']['entity_tag'];
                    upload['content_title'] = _post['profile_picture_data']['title'];
                    console.log(upload);

                    Upload.saveOnDb(upload,function(dbResultSet){
                        console.log("Upload.saveOnDb");
                        upload_data.push({
                            entity_id:upload.entity_id,
                            file_name:upload.file_name,
                            file_type:upload.file_type,
                            http_url:_post['profile_picture_data']['http_url']
                        });

                        console.log(upload_data);

                        _post['upload']= upload_data;
                        callBack(null)
                    });

                }else{
                    callBack(null)
                }

            },
            function saveInCache(callBack){
                console.log("saveInCache");

                Post.addToCache(_post.visible_users,_post,function(chData){ });
                callBack(null)
            },
            function finalizedPost(callBack){
                console.log("finalizedPost");

                var query={
                    q:_post.created_by.toString(),
                    index:'idx_usr'
                };

                _post['date'] = DateTime.explainDate(_post.created_at)
                //Find User from Elastic search
                ES.search(query,function(csResultSet){
                    delete _post['created_by'];
                    _post['created_by'] = csResultSet.result[0];
                    callBack(null);

                });
            }

        ],function(err,resultSet){
            console.log(_post);
            callBack(_post)
        });


    },

};

module.exports = TimeLinePostHandler;