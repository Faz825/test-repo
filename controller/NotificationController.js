'use strict';

/**
 * Handle notification related operation in the class
 */

var NotificationController ={

    getNotifications:function(req,res){

        var days = req.query.days;

        var NotificationRecipient = require('mongoose').model('NotificationRecipient'),
            _async = require('async'),
            user_id = Util.getCurrentSession(req).id,
            criteria = {recipient:Util.toObjectId(user_id)},
            _postOwnerIds = [], _notificationSenderIds = [], _postOwners = {}, _notificationSenders = {}, _notifications = {}, _redisIds = [],
            _unreadCount = 0, _formattedNotificationData = [], _unreadNotificationIds = [];

        _async.waterfall([
            function getNotifications(callBack){
                NotificationRecipient.getRecipientNotifications(criteria, days, function(resultSet){
                    var notifications = resultSet.notifications;
                    var _types = [];

                    for(var i = 0; i < notifications.length; i++){

                        var _type = notifications[i]['post_id']+notifications[i]['notification_type'];
                        if(_types.indexOf(_type) == -1){
                            _types.push(_type)
                            _notifications[notifications[i]['post_id']+notifications[i]['notification_type']] = {
                                post_id:notifications[i]['post_id'],
                                notification_type:notifications[i]['notification_type'],
                                read_status:notifications[i]['read_status'],
                                post_owner:notifications[i]['post_owner'],
                                created_at:notifications[i]['created_at'],
                                senders:[],
                                sender_count:0
                            };

                            _redisIds.push("post:"+notifications[i]['notification_type']+":"+notifications[i]['post_id']);
                        }

                        if(_postOwnerIds.indexOf(notifications[i]['post_owner'].toString()) == -1){
                            _postOwnerIds.push(notifications[i]['post_owner'].toString());
                        }

                        if(notifications[i]['read_status'] == false){
                            _unreadCount++;
                        }

                    }
                    callBack(null)
                });
            },
            function getSendersFromRedis(callBack){

                _async.each(_redisIds, function(_redisId, callBack){

                    console.log("====="+_redisId+"=====");

                    CacheEngine.getList(_redisId,0,3,function(chResultSet){

                        var _tempRedisIdArr = _redisId.split(":");
                        var _tempPostId = _tempRedisIdArr[2];
                        var _tempNotificationType = _tempRedisIdArr[1];

                        _notifications[_tempPostId+_tempNotificationType]['sender_count'] = chResultSet.result_count;

                        console.log(chResultSet.result_count)
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

                                //console.log(user_id+"========="+_res[i].commented_by.user_id);console.log(user_id !== _res[i].commented_by.user_id);
                                if(user_id !== _res[i].commented_by.user_id){
                                    x++;
                                    if(_notifications[_tempPostId+_tempNotificationType]['senders'].indexOf(_res[i].commented_by.user_id) == -1){
                                        _notifications[_tempPostId+_tempNotificationType]['senders'].push(_res[i].commented_by.user_id);
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

                                //console.log(user_id+"========="+_res[i].toString());console.log(user_id !== _res[i].toString());
                                if(user_id !== _res[i].toString()){
                                    x++;
                                    if(_notifications[_tempPostId+_tempNotificationType]['senders'].indexOf(_res[i].toString()) == -1){
                                        _notifications[_tempPostId+_tempNotificationType]['senders'].push(_res[i].toString());
                                    }

                                    if(_notificationSenderIds.indexOf(_res[i].toString()) == -1){
                                        _notificationSenderIds.push(_res[i].toString());

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
                _async.parallel([
                    function getPostOwners(callBack){

                        _async.each(_postOwnerIds,function(_postOwnerId, callBack){
                            if(_postOwnerId == user_id){
                                _postOwners[_postOwnerId] = {
                                    name: "your",
                                    user_name: Util.getCurrentSession(req).user_name
                                };
                                callBack(null);
                            }else{
                                var query={
                                    q:"user_id:"+_postOwnerId.toString(),
                                    index:'idx_usr'
                                };
                                //Find User from Elastic search
                                ES.search(query,function(csResultSet){
                                    //console.log(csResultSet.result[0])
                                    _postOwners[_postOwnerId] = {
                                        name: csResultSet.result[0]['first_name']+" "+csResultSet.result[0]['last_name']+"'s",
                                        user_name: csResultSet.result[0]['user_name']
                                    };
                                    callBack(null);
                                });
                            }

                        },function(err){
                            callBack(null)

                        });
                    },
                    function getSenders(callBack){

                        //console.log("getSenders");

                        _async.each(_notificationSenderIds,function(_notificationSenderId, callBack){

                            //console.log(_notificationSenders[_notificationSenderId])

                            if(typeof _notificationSenders[_notificationSenderId] == 'undefined'){
                                var query={
                                    q:"user_id:"+_notificationSenderId.toString(),
                                    index:'idx_usr'
                                };
                                //Find User from Elastic search
                                ES.search(query,function(csResultSet){
                                    //console.log(csResultSet)
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

                    }

                ],function(err){
                    callBack(null);
                })

            },

            function finalizeData(callBack){
                //console.log("finalizeData")
                //console.log(_notificationSenders)
                for (var key in _notifications) {


                    var obj = _notifications[key];
                    console.log(obj)

                    if(obj.senders.length > 0){

                        //console.log(obj.senders[0])
                        //console.log(_notificationSenders[obj.senders[0]])

                        var _data = {
                            post_id:obj.post_id,
                            notification_type:obj.notification_type,
                            read_status:obj.read_status,
                            created_at:DateTime.explainDate(obj.created_at),
                            post_owner_username:_postOwners[obj.post_owner]['user_name'],
                            post_owner_name:_postOwners[obj.post_owner]['name'],
                            sender_profile_picture:_notificationSenders[obj.senders[0]]['profile_image'],
                            sender_name:_notificationSenders[obj.senders[0]]['name'],
                            sender_count:obj.sender_count
                        };

                        if(obj.senders.length == 2){
                            if(obj.sender_count == 0){
                                _data['sender_name'] += ' and ';
                            }else{
                                _data['sender_name'] += ', ';
                            }
                            _data['sender_name'] += _notificationSenders[obj.senders[1]]['name'];
                        }

                        if(obj.senders.length == 3){
                            _data['sender_name'] += ', '+ _notificationSenders[obj.senders[1]]['name'];
                            if(obj.sender_count == 0){
                                _data['sender_name'] += ' and ';
                            }else{
                                _data['sender_name'] += ', ';
                            }
                            _data['sender_name'] += _notificationSenders[obj.senders[2]]['name'];
                        }

                        _formattedNotificationData.push(_data)

                    }

                }
                callBack(null);

            }
        ],function(err){
            //console.log(_formattedNotificationData);
            var outPut ={
                status:ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                unreadCount:_unreadCount,
                notifications:_formattedNotificationData
            }
            res.status(200).json(outPut);
        });

    },

    updateNotifications: function(req,res){
        var NotificationRecipient = require('mongoose').model('NotificationRecipient'),
            Notification = require('mongoose').model('Notification'),
            _async = require('async'),
            _data = {read_status:true},
            _notification_ids = [],
            user_id = Util.getCurrentSession(req).id;console.log(user_id);

        console.log(req.body)

        if(typeof req.body.post_id != 'undefined' && typeof req.body.notification_type != 'undefined'){
            _async.waterfall([
                function getNotifications(callBack){
                    var _criteria = {notified_post:req.body.post_id, notification_type:req.body.notification_type};
                    Notification.getNotifications(_criteria, function(res){
                        for(var i = 0; i < res.result.length; i++){
                            console.log(res.result[i]._id)
                            _notification_ids.push(res.result[i]._id)
                        }
                        callBack(null);
                    });
                },
                function updateNotifications(callBack){
                    _async.each(_notification_ids,function(_notificationId, callBack){
                        console.log(_notificationId);

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
        console.log("=== getDetails ===");console.log(req)
        console.log(req.query);
    },

    getNotificationCount:function(req,res){
        var NotificationRecipient = require('mongoose').model('NotificationRecipient'),
            _async = require('async'),
            user_id = Util.getCurrentSession(req).id,
            criteria = {recipient:Util.toObjectId(user_id),read_status:false};

        NotificationRecipient.getUnreadCount(criteria,function(result){
            var outPut ={
                status:ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                count:result.result.length
            };
            res.status(200).json(outPut);
        })


    }

};

module.exports = NotificationController;
