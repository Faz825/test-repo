/**
 * Created by phizuupc on 3/14/2017.
 */

var NotificationCategoryUpdateHandler = {

    init: function () {
        this.updateNotifications(function (payload) {});
    },
    // updateCategory: function (callBack) {
    //     console.log("Updateing existing notifications - category");
    //
    //     var _async = require('async'),
    //         Notification = require('mongoose').model('Notification');
    //
    //     _async.waterfall([
    //
    //         function getAllNotifications(callBack) {
    //             var criteria = {}
    //
    //             Notification.getNotifications(criteria, function (r) {
    //                 callBack(null, r.result);
    //             });
    //         },
    //         function updateNotificationsCat(notifications, callBack) {
    //             _async.eachSeries(notifications, function (notification, notifCallBack) {
    //
    //                 if (notification.notification_type == Notifications.SHARE_CALENDAR ||
    //                     notification.notification_type == Notifications.SHARE_CALENDAR_RESPONSE ||
    //                     notification.notification_type == Notifications.CALENDAR_SCHEDULE_UPDATED ||
    //                     notification.notification_type == Notifications.CALENDAR_SCHEDULE_TIME_CHANGED ||
    //                     notification.notification_type == Notifications.CALENDAR_SCHEDULE_CARRIED_NEXT_DAY) {
    //
    //                     var criteria = {
    //                         _id: notification._id
    //                     }
    //                     var updateData = {
    //                         notification_category: NotificationCategory.TODOS
    //                     }
    //
    //                     Notification.updateNotifications(criteria, updateData, function (r) {
    //                         notifCallBack(null);
    //                     });
    //
    //
    //                 } else if (notification.notification_type == Notifications.SHARE_NOTEBOOK
    //                     || notification.notification_type == Notifications.SHARE_NOTEBOOK_RESPONSE) {
    //
    //                     var criteria = {
    //                         _id: notification._id
    //                     }
    //                     var updateData = {
    //                         notification_category: NotificationCategory.PRODUCTIVITY
    //                     }
    //
    //                     Notification.updateNotifications(criteria, updateData, function (r) {
    //                         notifCallBack(null);
    //                     });
    //
    //                 } else if (notification.notification_type == Notifications.SHARE_FOLDER || notification.notification_type == Notifications.SHARE_FOLDER_RESPONSE) {
    //
    //                     var criteria = {
    //                         _id: notification._id
    //                     }
    //                     var updateData = {
    //                         notification_category: NotificationCategory.PRODUCTIVITY
    //                     }
    //
    //                     Notification.updateNotifications(criteria, updateData, function (r) {
    //                         notifCallBack(null);
    //                     });
    //
    //
    //                 } else if (notification.notification_type == Notifications.SHARE_GROUP || notification.notification_type == Notifications.SHARE_GROUP_RESPONSE) {
    //
    //                     var criteria = {
    //                         _id: notification._id
    //                     }
    //                     var updateData = {
    //                         notification_category: NotificationCategory.PRODUCTIVITY
    //                     }
    //
    //                     Notification.updateNotifications(criteria, updateData, function (r) {
    //                         notifCallBack(null);
    //                     });
    //
    //
    //                 } else if (notification.notification_type == Notifications.SHARE_GROUP_NOTEBOOK) {
    //
    //                     var criteria = {
    //                         _id: notification._id
    //                     }
    //                     var updateData = {
    //                         notification_category: NotificationCategory.PRODUCTIVITY
    //                     }
    //
    //                     Notification.updateNotifications(criteria, updateData, function (r) {
    //                         notifCallBack(null);
    //                     });
    //
    //
    //                 } else if (notification.notification_type == Notifications.ADD_GROUP_POST) {
    //
    //                     var criteria = {
    //                         _id: notification._id
    //                     }
    //                     var updateData = {
    //                         notification_category: NotificationCategory.SOCIAL
    //                     }
    //
    //                     Notification.updateNotifications(criteria, updateData, function (r) {
    //                         notifCallBack(null);
    //                     });
    //
    //
    //                 } else {
    //
    //                     var criteria = {
    //                         _id: notification._id
    //                     }
    //                     var updateData = {
    //                         notification_category: NotificationCategory.SOCIAL
    //                     }
    //
    //                     Notification.updateNotifications(criteria, updateData, function (r) {
    //                         notifCallBack(null);
    //                     });
    //
    //                 }
    //
    //             }, function (err) {
    //                 callBack(null);
    //             });
    //         }
    //     ], function (err) {
    //         callBack(null);
    //     });
    // },
    updateNotifications: function (callBack) {

        var _async = require('async'),
            Notification = require('mongoose').model('Notification');

        var socialNotifications = [],
            productivityNotifications = [],
            todosNotifications = [];

        _async.waterfall([
            function getAllNotificationByType(callBack){
                _async.parallel([
                    function getTodosNotifications(callBack){
                        var criteria = {
                            $or: [
                                { "notification_type": Notifications.SHARE_CALENDAR },
                                { "notification_type": Notifications.SHARE_CALENDAR_RESPONSE },
                                { "notification_type": Notifications.CALENDAR_SCHEDULE_UPDATED },
                                { "notification_type": Notifications.CALENDAR_SCHEDULE_TIME_CHANGED },
                                { "notification_type": Notifications.CALENDAR_SCHEDULE_CARRIED_NEXT_DAY }
                            ]
                        }

                        Notification.getNotifications(criteria, function (r) {
                            for(var i = 0; i < r.result.length; i++){
                                todosNotifications.push(
                                    Util.toObjectId(r.result[i]._id)
                                );
                            }

                            callBack(null);
                        });
                    },
                    function getSocialNotifications(callBack){
                        var criteria = {
                            $or: [
                                { "notification_type": Notifications.ADD_GROUP_POST },
                                { "notification_type": Notifications.LIKE },
                                { "notification_type": Notifications.SHARE },
                                { "notification_type": Notifications.COMMENT },
                                { "notification_type": Notifications.BIRTHDAY }
                            ]
                        }

                        Notification.getNotifications(criteria, function (r) {
                            for(var i = 0; i < r.result.length; i++){
                                socialNotifications.push(
                                    Util.toObjectId(r.result[i]._id)
                                );
                            }

                            callBack(null);
                        });
                    },
                    function getProductivityNotifications(callBack){
                        var criteria = {
                            $or: [
                                { "notification_type": Notifications.SHARE_NOTEBOOK },
                                { "notification_type": Notifications.SHARE_NOTEBOOK_RESPONSE },
                                { "notification_type": Notifications.SHARE_FOLDER },
                                { "notification_type": Notifications.SHARE_FOLDER_RESPONSE },
                                { "notification_type": Notifications.SHARE_GROUP },
                                { "notification_type": Notifications.SHARE_GROUP_RESPONSE },
                                { "notification_type": Notifications.SHARE_GROUP_NOTEBOOK }
                            ]
                        }

                        Notification.getNotifications(criteria, function (r) {
                            for(var i = 0; i < r.result.length; i++){
                                productivityNotifications.push(
                                    Util.toObjectId(r.result[i]._id)
                                );
                            }

                            callBack(null);
                        });
                    }
                ], function (err) {
                    callBack(null);
                });
            },

            function updateNotifications(callBack){
                _async.parallel([
                    function updateTodosNotifications(callBack){

                        var criteria = {
                            _id: {'$in': todosNotifications}
                        },updateData = {
                            $set: {'notification_category': NotificationCategory.TODOS}
                        }

                        Notification.updateNotifications(criteria, updateData, function (r) {
                            callBack(null);
                        });
                    },
                    function updateSocialNotifications(callBack){
                        var criteria = {
                            _id: {'$in': socialNotifications}
                        },updateData = {
                            $set: {'notification_category': NotificationCategory.SOCIAL}
                        }

                        Notification.updateNotifications(criteria, updateData, function (r) {
                            callBack(null);
                        });
                    },
                    function updateProductivityNotifications(callBack){
                        var criteria = {
                            _id: {'$in': productivityNotifications}
                        },updateData = {
                            $set: {'notification_category': NotificationCategory.PRODUCTIVITY}
                        }

                        Notification.updateNotifications(criteria, updateData, function (r) {
                            callBack(null);
                        });
                    }
                ], function (err) {
                    callBack(null);
                });
            }
        ], function (err) {
            callBack(null);
        });
    }
};

module.exports = NotificationCategoryUpdateHandler;