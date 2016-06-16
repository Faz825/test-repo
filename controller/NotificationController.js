'use strict';

/**
 * Handle notification related operation in the class
 */

var NotificationController ={

    getNotifications:function(req,res){

        var NotificationRecipient = require('mongoose').model('NotificationRecipient'),
            _async = require('async');

        var user_id = Util.getCurrentSession(req).id;
        var criteria = {recipient:Util.toObjectId(user_id)};
        var _postOwnerIds = [], _notificationSenderIds = [], _postOwners = {}, _notificationSenders = {};
        var _notifications = {};
        var _unreadCount = 0;
        var _formattedNotificationData = [];
        var _unreadNotificationIds = [];

        _async.waterfall([
            function getNotifications(callBack){
                NotificationRecipient.getRecipientNotifications(criteria,function(resultSet){
                    var notifications = resultSet.notifications;
                    var _types = [];

                    for(var i = 0; i < notifications.length; i++){

                        var _type = notifications[i]['post_id']+notifications[i]['notification_type'];
                        if(_types.indexOf(_type) == -1){
                            _notifications[notifications[i]['post_id']+notifications[i]['notification_type']] = {
                                post_id:notifications[i]['post_id'],
                                notification_type:notifications[i]['notification_type'],
                                read_status:notifications[i]['read_status'],
                                post_owner:notifications[i]['post_owner'],
                                created_at:notifications[i]['created_at'],
                                senders:[],
                                sender_count:0,
                                unread_notification_ids:[]
                            };
                        }

                        if(_postOwnerIds.indexOf(notifications[i]['post_owner'].toString()) == -1){
                            _postOwnerIds.push(notifications[i]['post_owner'].toString());
                        }

                    }
                    callBack(null, resultSet.notifications)
                });
            },
            function formatNotifications(unformatedNotifications, callBack){

                for(var i = 0; i < unformatedNotifications.length; i++){

                    if(unformatedNotifications[i]['read_status'] == false){
                        _unreadCount++;
                        _notifications[unformatedNotifications[i]['post_id']+unformatedNotifications[i]['notification_type']]['unread_notification_ids'].push(unformatedNotifications[i]['_id']);
                        _unreadNotificationIds.push(unformatedNotifications[i]['_id']);
                    }

                    if(_notifications[unformatedNotifications[i]['post_id']+unformatedNotifications[i]['notification_type']]['senders'].length < 2){
                        _notifications[unformatedNotifications[i]['post_id']+unformatedNotifications[i]['notification_type']]['senders'].push(unformatedNotifications[i]['sender_id']);

                        if(_notificationSenderIds.indexOf(unformatedNotifications[i]['sender_id'].toString()) == -1){
                            _notificationSenderIds.push(unformatedNotifications[i]['sender_id'].toString());
                        }
                    } else{
                        var _senderCount = _notifications[unformatedNotifications[i]['post_id']+unformatedNotifications[i]['notification_type']]['sender_count'];
                        _senderCount++;
                        _notifications[unformatedNotifications[i]['post_id']+unformatedNotifications[i]['notification_type']]['sender_count'] = _senderCount;
                    }
                }
                callBack(null);
            },
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

                _async.each(_notificationSenderIds,function(_notificationSenderId, callBack){

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

                },function(err){
                    callBack(null)

                });

            },
            function finalizeData(callBack){
                for (var key in _notifications) {
                    var obj = _notifications[key];

                    var _data = {
                        post_id:obj.post_id,
                        notification_type:obj.notification_type,
                        read_status:obj.read_status,
                        created_at:DateTime.explainDate(obj.created_at),
                        post_owner_username:_postOwners[obj.post_owner]['user_name'],
                        post_owner_name:_postOwners[obj.post_owner]['name'],
                        sender_profile_picture:_notificationSenders[obj.senders[0]]['profile_image'],
                        sender_name:_notificationSenders[obj.senders[0]]['name'],
                        sender_count:obj.sender_count,
                        unread_notification_ids:obj.unread_notification_ids
                    };

                    if(obj.senders.length > 1){
                        _data['sender_name'] += ', '+ _notificationSenders[obj.senders[1]]['name'];
                    }

                    _formattedNotificationData.push(_data)

                }
                callBack(null);

            }
        ],function(err){
            //console.log(_formattedNotificationData);
            var outPut ={
                status:ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                unreadCount:_unreadCount,
                notifications:_formattedNotificationData,
                unreadNotificationIds:_unreadNotificationIds
            }
            res.status(200).json(outPut);
        });

    },

    updateNotifications: function(req,res){
        var NotificationRecipient = require('mongoose').model('NotificationRecipient'),
            _async = require('async'),
            _data = {read_status:true};

        _async.each(req.body.notifications,function(_notificationId, callBack){

            var _criteria = {_id:Util.toObjectId(_notificationId)};

            NotificationRecipient.updateRecipientNotification(_criteria, _data, function(res){
                callBack(null);
            })



        },function(err){
            var outPut ={
                status:ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS)
            };
            res.status(200).json(outPut);
        });
    }

};

module.exports = NotificationController;
