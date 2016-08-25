'use strict';

/**
 * Handle notification related operation in the class
 */

var NotificationController ={

    getNotifications:function(req,res){

        var days = req.query.days; console.log("Days = "+days);
        var pg = req.query.pg;console.log("pg = "+pg);

        var NotificationRecipient = require('mongoose').model('NotificationRecipient'),
            _async = require('async'),
            user_id = Util.getCurrentSession(req).id,
            criteria = {recipient:Util.toObjectId(user_id)},
            skip = (pg - 1)*Config.NOTIFICATION_RESULT_PER_PAGE, limit = Config.NOTIFICATION_RESULT_PER_PAGE,
            _notifications = {}, _redisIds = [], notifications = {},
            _unreadCount = 0, _formattedNotificationData = [], _postIds = [], _userIds = [], _users = {}, _postData = {}, _totalNotifications = 0, outPut = {}, _noOfNotifications = 0;

        _async.waterfall([
            function getNotificationCount(callBack){
                console.log("getNotificationCount")

                if(typeof days != 'undefined'){
                    console.log("days defined so call count functions")
                    _async.parallel([
                        function(callBack){
                            NotificationRecipient.getCount(criteria,function(result){
                                _totalNotifications = result.result;
                                outPut['header'] ={
                                    total_result:_totalNotifications,
                                    result_per_page:Config.NOTIFICATION_RESULT_PER_PAGE,
                                    total_pages:Math.ceil(_totalNotifications/Config.NOTIFICATION_RESULT_PER_PAGE)
                                };
                                callBack(null);
                            });
                        },
                        function(callBack){
                            var _unreadCriteria = {recipient:Util.toObjectId(user_id), read_status:false};
                            NotificationRecipient.getCount(_unreadCriteria,function(result){
                                _unreadCount = result.result;
                                callBack(null);
                            });
                        }
                    ], function(err){
                        callBack(null);
                    });
                }else{
                    callBack(null);
                }

            },
            function getTodayNotifications(callBack){
                console.log("getTodayNotifications")

                if(typeof days != 'undefined'){
                    console.log("days defined so get todays notifications")

                    NotificationRecipient.getRecipientNotifications(criteria, days, function(resultSet){

                        notifications = resultSet.notifications;

                        var _types = [], _type = '';

                        for(var i = 0; i < notifications.length; i++){

                            if(notifications[i]['notification_type'] == Notifications.BIRTHDAY){
                                _type = notifications[i]['notification_type']
                            } else{
                                _type = notifications[i]['post_id']+notifications[i]['notification_type'];
                                _redisIds.push("post:"+notifications[i]['notification_type']+":"+notifications[i]['post_id']);
                                if(_postIds.indexOf(notifications[i]['post_id'].toString()) == -1){
                                    _postIds.push(notifications[i]['post_id'].toString());
                                }
                            }

                            if(_types.indexOf(_type) == -1){
                                _types.push(_type)
                                _notifications[_type] = {
                                    post_id:notifications[i]['post_id'],
                                    notification_type:notifications[i]['notification_type'],
                                    read_status:notifications[i]['read_status'],
                                    post_owner:null,
                                    created_at:notifications[i]['created_at'],
                                    senders:[],
                                    sender_count:0,
                                    notification_ids:[]
                                };
                                _noOfNotifications++;
                            }
                        }
                        _totalNotifications = _totalNotifications - notifications.length;
                        outPut['header'] ={
                            total_result:_totalNotifications,
                            result_per_page:Config.NOTIFICATION_RESULT_PER_PAGE,
                            total_pages:Math.ceil(_totalNotifications/Config.NOTIFICATION_RESULT_PER_PAGE)
                        };
                        callBack(null);

                    });

                } else{
                    callBack(null);
                }
            },
            function getNotifications(callBack){
                console.log("getNotifications")

                if(_noOfNotifications < 5){
                    console.log("_noOfNotifications < 5");
                    console.log(skip);
                    console.log(limit);
                    NotificationRecipient.getRecipientNotificationsLimit(criteria,skip,limit,function(resultSet){
                        notifications = resultSet.notifications;
                        var _types = [], _type = '';

                        for(var i = 0; i < notifications.length; i++){

                            if(notifications[i]['notification_type'] == Notifications.BIRTHDAY){
                                _type = notifications[i]['notification_type']
                            } else{
                                _type = notifications[i]['post_id']+notifications[i]['notification_type'];
                                _redisIds.push("post:"+notifications[i]['notification_type']+":"+notifications[i]['post_id']);
                                if(_postIds.indexOf(notifications[i]['post_id'].toString()) == -1){
                                    _postIds.push(notifications[i]['post_id'].toString());
                                }
                            }

                            if(_types.indexOf(_type) == -1){
                                _types.push(_type)
                                _notifications[_type] = {
                                    post_id:notifications[i]['post_id'],
                                    notification_type:notifications[i]['notification_type'],
                                    read_status:notifications[i]['read_status'],
                                    post_owner:null,
                                    created_at:notifications[i]['created_at'],
                                    senders:[],
                                    sender_count:0,
                                    notification_ids:[]
                                };
                            }
                        }
                        callBack(null);
                    });
                } else{
                    console.log("_noOfNotifications > 5");
                    callBack(null);
                }
            },
            function getPostData(callBack){
                var Post = require('mongoose').model('Post');
                _async.each(_postIds, function(_postId, callBack){

                    Post.db_getPostDetailsOnly({_id:_postId}, function(resultPost){

                        _postData[_postId] = {
                            postOwner:resultPost.post.created_by
                        };
                        callBack(null)
                    });
                }, function(err){
                    callBack(null)
                });
            },
            function getDetails(callBack){
                for(var i = 0; i < notifications.length; i++){

                    var x = 0;

                    if(notifications[i]['notification_type'] == Notifications.BIRTHDAY){

                        if(_notifications[notifications[i]['notification_type']]['senders'].indexOf(notifications[i]['sender_id'].toString()) == -1 && x < 3){
                            _notifications[notifications[i]['notification_type']]['senders'].push(notifications[i]['sender_id'].toString());
                            x++;

                            if(_userIds.indexOf(notifications[i]['sender_id'].toString()) == -1){
                                _userIds.push(notifications[i]['sender_id'].toString());
                            }
                        }

                        if(x > 3){
                            var _senderCount = _notifications[notifications[i]['notification_type']]['sender_count'];
                            _senderCount++;
                            _notifications[notifications[i]['notification_type']]['sender_count'] = _senderCount;
                        }

                    } else{
                        _notifications[notifications[i]['post_id']+notifications[i]['notification_type']]['post_owner'] = _postData[notifications[i]['post_id']]['postOwner'];
                        if(_userIds.indexOf(_postData[notifications[i]['post_id']]['postOwner'].toString()) == -1){
                            _userIds.push(_postData[notifications[i]['post_id']]['postOwner'].toString());
                        }
                    }

                }
                callBack(null)

            },
            function getSendersFromRedis(callBack){

                _async.each(_redisIds, function(_redisId, callBack){

                    CacheEngine.getList(_redisId,0,10,function(chResultSet){

                        var _tempRedisIdArr = _redisId.split(":");
                        var _tempPostId = _tempRedisIdArr[2];
                        var _tempNotificationType = _tempRedisIdArr[1];

                        _notifications[_tempPostId+_tempNotificationType]['sender_count'] = chResultSet.result_count;

                        var _res = chResultSet.result;
                        var x = 0;
                        for(var i = 0; i < _res.length; i++){

                            if(x > 2){
                                break;
                            }

                            var _senderCount = _notifications[_tempPostId+_tempNotificationType]['sender_count'];
                            _senderCount--;
                            _notifications[_tempPostId+_tempNotificationType]['sender_count'] = _senderCount;

                            if(typeof _res[i] === 'object'){

                                if(user_id !== _res[i].commented_by.user_id){
                                    x++;
                                    if(_notifications[_tempPostId+_tempNotificationType]['senders'].indexOf(_res[i].commented_by.user_id) == -1){
                                        _notifications[_tempPostId+_tempNotificationType]['senders'].push(_res[i].commented_by.user_id);
                                    }

                                    if(_userIds.indexOf(_res[i].commented_by.user_id) == -1){

                                        _userIds.push(_res[i].commented_by.user_id);

                                        _users[_res[i].commented_by.user_id] = {
                                            name : _res[i].commented_by.first_name+" "+_res[i].commented_by.last_name,
                                            profile_image : _res[i].commented_by.images.profile_image.http_url,
                                            user_name: _res[i].commented_by.user_name
                                        }

                                    }

                                }

                            } else{

                                if(user_id !== _res[i].toString()){
                                    x++;
                                    if(_notifications[_tempPostId+_tempNotificationType]['senders'].indexOf(_res[i].toString()) == -1){
                                        _notifications[_tempPostId+_tempNotificationType]['senders'].push(_res[i].toString());
                                    }

                                    if(_userIds.indexOf(_res[i].toString()) == -1){
                                        _userIds.push(_res[i].toString());

                                    }
                                }

                            }
                        }
                        callBack(null);
                    });


                }, function (err) {
                    callBack(null);
                })
            },
            function getUserDetails(callBack){
                _async.each(_userIds,function(_userId, callBack){

                    if(typeof _users[_userId] == 'undefined'){
                        var query={
                            q:"user_id:"+_userId.toString(),
                            index:'idx_usr'
                        };
                        //Find User from Elastic search
                        ES.search(query,function(csResultSet){

                            _users[_userId] = {
                                name : csResultSet.result[0]['first_name']+" "+csResultSet.result[0]['last_name'],
                                profile_image : csResultSet.result[0]['images']['profile_image']['http_url'],
                                user_name: csResultSet.result[0]['user_name']
                            }
                            callBack(null);
                        });
                    }else{
                        callBack(null);
                    }


                },function(err){
                    callBack(null)

                });
            },

            function finalizeData(callBack){

                for (var key in _notifications) {

                    var obj = _notifications[key];

                    if(obj.senders.length > 0){

                        var _postOwnerName = "",
                            _postOwnerUsername = "",
                            birthdayDay = "";

                        if(obj.notification_type == Notifications.BIRTHDAY){
                            var createdDate = new Date(obj.created_at);
                            var diff = Math.floor((new Date() - createdDate) / 1000);
                            if(diff < 86400){
                                birthdayDay = "today";
                            } else{
                                birthdayDay = "yesterday";
                            }

                        }else{

                            if(obj.post_owner == user_id){
                                _postOwnerName = "your";
                            }else{
                                _postOwnerName = _users[obj.post_owner]['name']+"'s";
                            }
                            _postOwnerUsername = _users[obj.post_owner]['user_name'];
                        }

                        var _data = {
                            post_id:obj.post_id,
                            notification_type:obj.notification_type,
                            read_status:obj.read_status,
                            created_at:DateTime.explainDate(obj.created_at),
                            post_owner_username:_postOwnerUsername,
                            post_owner_name:_postOwnerName,
                            sender_profile_picture:_users[obj.senders[0]]['profile_image'],
                            sender_name:_users[obj.senders[0]]['name'],
                            sender_count:obj.sender_count,
                            birthday:birthdayDay
                        };

                        if(obj.senders.length == 2){
                            if(obj.sender_count == 0){
                                _data['sender_name'] += ' and ';
                            }else{
                                _data['sender_name'] += ', ';
                            }
                            _data['sender_name'] += _users[obj.senders[1]]['name'];
                        }

                        if(obj.senders.length == 3){
                            _data['sender_name'] += ', '+ _notificationSenders[obj.senders[1]]['name'];
                            if(obj.sender_count == 0){
                                _data['sender_name'] += ' and ';
                            }else{
                                _data['sender_name'] += ', ';
                            }
                            _data['sender_name'] += _users[obj.senders[2]]['name'];
                        }

                        _formattedNotificationData.push(_data)

                    }

                }
                callBack(null);

            }
        ],function(err){
            outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
            outPut['unreadCount'] = _unreadCount;
            outPut['notifications'] = _formattedNotificationData;
            //outPut ={
            //    status:ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
            //    unreadCount:_unreadCount,
            //    notifications:_formattedNotificationData
            //}

            res.status(200).json(outPut);
        });

    },

    updateNotifications: function(req,res){
        var NotificationRecipient = require('mongoose').model('NotificationRecipient'),
            Notification = require('mongoose').model('Notification'),
            _async = require('async'),
            _data = {read_status:true},
            _notification_ids = [],
            user_id = Util.getCurrentSession(req).id;

        console.log(req.body)

        if(typeof req.body.post_id != 'undefined' && typeof req.body.notification_type != 'undefined'){
            _async.waterfall([
                function getNotifications(callBack){
                    var _criteria = {notified_post:req.body.post_id, notification_type:req.body.notification_type};
                    Notification.getNotifications(_criteria, function(res){
                        for(var i = 0; i < res.result.length; i++){
                            _notification_ids.push(res.result[i]._id)
                        }
                        callBack(null);
                    });
                },
                function updateNotifications(callBack){
                    _async.each(_notification_ids,function(_notificationId, callBack){

                        var _criteria = {notification_id:Util.toObjectId(_notificationId), recipient:Util.toObjectId(user_id)};

                        NotificationRecipient.updateRecipientNotification(_criteria, _data, function(res){
                            callBack(null);
                        });

                    },function(err){
                        callBack(null);
                    });

                }
            ],function(err){
                var outPut ={
                    status:ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS)
                };
                res.status(200).json(outPut);
            })
        }else{
            var _criteria = {recipient:Util.toObjectId(user_id)};

            NotificationRecipient.updateRecipientNotification(_criteria, _data, function(result){
                var outPut ={
                    status:ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS)
                };
                res.status(200).json(outPut);
            });
        }


    },

    getDetails:function(req,res){

        var post_id = req.query.post_id,
            notification_type = req.query.notification_type,
            Post = require('mongoose').model('Post'),
            _async = require('async'),
            user_id = Util.getCurrentSession(req).id,
            criteria = {_id:Util.toObjectId(post_id)},
            _postData = {},
            _notificationData = {},
            _notificationSenderIds = [],
            _notificationSenders = {},
            _formattedData = {},
            created_at = new Date(),
            redis_id = "post:"+notification_type+":"+post_id;

        _async.waterfall([
            function getPostDetails(callback){
                Post.db_getPost(criteria, function(result){
                    _postData = result.post;
                    callback(null);
                });
            },
            function getNotificationData(callback){
                CacheEngine.getList(redis_id,0,10,function(chResultSet){

                    _notificationData['sender_count'] = chResultSet.result_count;
                    _notificationData['senders'] = [];

                    var _res = chResultSet.result;
                    var x = 0;
                    for(var i = 0; i < _res.length; i++){

                        if(x > 2){
                            break;
                        }

                        var _senderCount = _notificationData['sender_count'];
                        _senderCount--;
                        _notificationData['sender_count'] = _senderCount;

                        if(typeof _res[i] === 'object'){

                            if(user_id !== _res[i].commented_by.user_id){
                                x++;
                                if(_notificationData['senders'].indexOf(_res[i].commented_by.user_id) == -1){
                                    _notificationData['senders'].push(_res[i].commented_by.user_id);
                                }

                                if(_notificationSenderIds.indexOf(_res[i].commented_by.user_id) == -1){

                                    _notificationSenderIds.push(_res[i].commented_by.user_id);

                                    _notificationSenders[_res[i].commented_by.user_id] = {
                                        name : _res[i].commented_by.first_name+" "+_res[i].commented_by.last_name,
                                        profile_image : _res[i].commented_by.images.profile_image.http_url
                                    }

                                }

                            }

                        } else{

                            if(user_id !== _res[i].toString()){
                                x++;
                                if(_notificationData['senders'].indexOf(_res[i].toString()) == -1){
                                    _notificationData['senders'].push(_res[i].toString());
                                }

                                if(_notificationSenderIds.indexOf(_res[i].toString()) == -1){
                                    _notificationSenderIds.push(_res[i].toString());

                                }
                            }

                        }
                    }
                    callback(null);
                });
            },
            function getSenders(callBack){

                _async.each(_notificationSenderIds,function(_notificationSenderId, callBack){

                    if(typeof _notificationSenders[_notificationSenderId] == 'undefined'){
                        var query={
                            q:"user_id:"+_notificationSenderId.toString(),
                            index:'idx_usr'
                        };
                        //Find User from Elastic search
                        ES.search(query,function(csResultSet){

                            _notificationSenders[_notificationSenderId] = {
                                name : csResultSet.result[0]['first_name']+" "+csResultSet.result[0]['last_name'],
                                profile_image : csResultSet.result[0]['images']['profile_image']['http_url']
                            }
                            callBack(null);
                        });
                    }else{
                        callBack(null);
                    }


                },function(err){
                    callBack(null)

                });

            },
            function finalizeData(callBack){

                    if(_notificationData.senders.length > 0){

                        var postOwnerName = "";
                        if(_postData.created_by.user_id == user_id){
                            postOwnerName = "your"
                        }else{
                            postOwnerName = _postData.created_by.first_name+" "+_postData.created_by.last_name
                        }

                        var _data = {
                            post_id:_postData.post_id,
                            notification_type:notification_type,
                            read_status:false,
                            created_at:DateTime.explainDate(created_at),
                            post_owner_username:_postData.created_by.user_name,
                            post_owner_name:postOwnerName,
                            sender_profile_picture:_notificationSenders[_notificationData.senders[0]]['profile_image'],
                            sender_name:_notificationSenders[_notificationData.senders[0]]['name'],
                            sender_count:_notificationData.sender_count
                        };

                        if(_notificationData.senders.length == 2){
                            if(_notificationData.sender_count == 0){
                                _data['sender_name'] += ' and ';
                            }else{
                                _data['sender_name'] += ', ';
                            }
                            _data['sender_name'] += _notificationSenders[_notificationData.senders[1]]['name'];
                        }

                        if(_notificationData.senders.length == 3){
                            _data['sender_name'] += ', '+ _notificationSenders[_notificationData.senders[1]]['name'];
                            if(obj.sender_count == 0){
                                _data['sender_name'] += ' and ';
                            }else{
                                _data['sender_name'] += ', ';
                            }
                            _data['sender_name'] += _notificationSenders[_notificationData.senders[2]]['name'];
                        }

                        _formattedData = _data;

                    }


                callBack(null);

            }

        ],function(err){
            var outPut ={
                status:ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                data:_formattedData

            };
            res.status(200).json(outPut);
        });


    },

    getNotificationCount:function(req,res){
        var NotificationRecipient = require('mongoose').model('NotificationRecipient'),
            _async = require('async'),
            user_id = Util.getCurrentSession(req).id,
            criteria = {recipient:Util.toObjectId(user_id),read_status:false};

        NotificationRecipient.getCount(criteria,function(result){
            var outPut ={
                status:ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                count:result.result
            };
            res.status(200).json(outPut);
        })


    }

};

module.exports = NotificationController;
