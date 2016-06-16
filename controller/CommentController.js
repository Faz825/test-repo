/**
 * Handle comment related operation in the class
 */


var CommentController ={

    /**
     * Add New Comments
     * @param req
     * @param res
     * @returns {number}
     */
    addComment:function(req,res){
        var outPut ={}
        if((typeof req.body.__content == 'undefined' || typeof req.body.__content == "") && (typeof req.body.__img == 'undefined' || req.body.__img == "")){
            outPut['status']    = ApiHelper.getMessage(400, Alert.COMMENT_CONTENT_EMPTY, Alert.ERROR);
            res.status(400).send(outPut);
            return 0;
        }

        if(typeof req.body.__post_id == 'undefined' || typeof req.body.__post_id == ""){
            outPut['status']    = ApiHelper.getMessage(400, Alert.COMMENT_POST_ID_EMPTY, Alert.ERROR);
            res.status(400).send(outPut);
            return 0;
        }

        var Comment = require('mongoose').model('Comment'),
            CurrentSession = Util.getCurrentSession(req),
            _async = require('async'),
            SubscribedPost = require('mongoose').model('SubscribedPost'),
            Notification = require('mongoose').model('Notification'),
            NotificationRecipient = require('mongoose').model('NotificationRecipient');

        var _comment ={
            post_id:req.body.__post_id,
            user_id:CurrentSession.id,
            comment:req.body.__content
        };

        var _commentData = [];

        _async.waterfall([

            function saveCommentInDb(callBack){

                Comment.addComment(_comment,function(resultSet){

                    if(resultSet.status == 200){
                        _commentData = resultSet.comment;
                    }
                    callBack(null)

                });

            },
            //COPY CONTENT TO CDN
            function copyToCDN(callBack){

                _commentData['upload'] = [];
                if(typeof req.body.__img != 'undefined' && req.body.__img != ""){

                    var data ={
                        content_title:"Comment Image",
                        file_name:req.body.__img,
                        is_default:0,
                        entity_id:_commentData._id,
                        entity_tag:UploadMeta.COMMENT_IMAGE
                    }

                    ContentUploader.uploadFile(data,function (payLoad) {
                        _commentData['upload']= payLoad;
                        callBack(null)
                    });

                }else{
                    callBack(null)
                }

            },
            function saveInCache(callBack){

                //GET COMMENTED USER FROM INDEXING SERVER
                var query={
                    q:_commentData.user_id.toString(),
                    index:'idx_usr'
                };
                ES.search(query,function(csResultSet){
                    _commentData['commented_by'] = csResultSet.result[0];
                    var _formattedComment ={
                        comment_id:_commentData._id.toString(),
                        post_id:_commentData.post_id.toString(),
                        comment:_commentData.comment,
                        created_at:_commentData.created_at,
                        commented_by:csResultSet.result[0],
                        attachment:_commentData.upload
                    };

                    //ADD TO THE CACHE
                    Comment.addToCache(_formattedComment.post_id,_formattedComment);
                    callBack(null)
                });
            },
            function subscribeToPost(callBack){

                var _data = {
                    user_id:CurrentSession.id,
                    post_id:req.body.__post_id
                }
                SubscribedPost.saveSubscribe(_data, function(res){
                    callBack(null);
                })

            },
            function getOtherSubscribedUsers(callBack){

                var _data = {
                    post_id:Util.toObjectId(req.body.__post_id),
                    user_id:{$ne:Util.toObjectId(_commentData.user_id)}
                }
                SubscribedPost.getSubscribedUsers(_data, function(res){
                    var _users = [];
                    for(var i = 0; i < res.users.length; i++){
                        _users.push(res.users[i].user_id);
                    }
                    _commentData['subscribedUsers']= _users;
                    callBack(null);
                })
            },
            function addNotification(callBack){

                if(_commentData.subscribedUsers.length > 0){

                    var _data = {
                        sender:_commentData.user_id,
                        notification_type:Notifications.COMMENT,
                        notified_post:req.body.__post_id
                    }
                    Notification.saveNotification(_data, function(res){
                        if(res.status == 200){
                            _commentData['notification_id'] = res.result._id;
                        }
                        callBack(null);
                    });

                } else{
                    callBack(null);
                }
            },

            function notifyUsers(callBack){

                if(_commentData.subscribedUsers.length > 0 && typeof _commentData.notification_id != 'undefined'){
                    var _data = {
                        notification_id:_commentData.notification_id,
                        recipients:_commentData.subscribedUsers
                    };
                    NotificationRecipient.saveRecipients(_data, function(res){
                        callBack(null);
                    })
                } else{
                    callBack(null);
                }
            }
        ],function(err,resultSet){
            outPut['status']    = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
            outPut['comment']   = _commentData;
            res.status(200).send(outPut);
            return ;
        });


    },

    /**
     * Get Comments
     * @param req
     * @param res
     */
    getComment:function(req,res){

        if(typeof req.query['__post_id'] == 'undefined' || typeof req.query['__post_id'] == ""){
            var outPut ={};
            outPut['status']    = ApiHelper.getMessage(400, Alert.COMMENT_POST_ID_EMPTY, Alert.ERROR);
            res.status(400).send(outPut);
            return 0;
        }


        var Comment = require('mongoose').model('Comment'),
            post_id = req.query['__post_id'];
        Comment.getComments(post_id,0,function(resultSet){
            var outPut ={};
            outPut['status']    = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
            outPut['comments']  = resultSet
            res.status(200).send(outPut);
        });

    }

}

module.exports =  CommentController;