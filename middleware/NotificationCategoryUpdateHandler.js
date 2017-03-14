/**
 * Created by phizuupc on 3/14/2017.
 */

var NotificationCategoryUpdateHandler = {

    init:function(){
        this.updateCategory(function (payload) {});
    },
     updateCategory: function(callBack){
         console.log("Updateing existing notifications - category");

         var _async = require('async'),
             Notification = require('mongoose').model('Notification');

         _async.waterfall([

             function getAllNotifications(callBack){
                 var criteria = {}

                 Notification.getNotifications(criteria, function(r){
                     callBack(null, r.result);
                 });
             },
             function updateNotificationsCat(notifications, callBack){
                 _async.eachSeries(notifications, function(notification, notifCallBack){

                     if (notification.notification_type == Notifications.SHARE_CALENDAR ||
                         notification.notification_type == Notifications.SHARE_CALENDAR_RESPONSE ||
                         notification.notification_type == Notifications.CALENDAR_SCHEDULE_UPDATED ||
                         notification.notification_type == Notifications.CALENDAR_SCHEDULE_TIME_CHANGED ||
                         notification.notification_type == Notifications.CALENDAR_SCHEDULE_CARRIED_NEXT_DAY) {

                         var criteria = {
                             _id: notification._id
                         }
                         var updateData = {
                             notification_category: NotificationCategory.TODOS
                         }

                         Notification.updateNotifications(criteria, updateData, function(r){
                             notifCallBack(null);
                         });


                     } else if (notification.notification_type == Notifications.SHARE_NOTEBOOK
                         || notification.notification_type == Notifications.SHARE_NOTEBOOK_RESPONSE) {

                         var criteria = {
                             _id: notification._id
                         }
                         var updateData = {
                             notification_category: NotificationCategory.PRODUCTIVITY
                         }

                         Notification.updateNotifications(criteria, updateData, function(r){
                             notifCallBack(null);
                         });

                     } else if(notification.notification_type == Notifications.SHARE_FOLDER  || notification.notification_type == Notifications.SHARE_FOLDER_RESPONSE) {

                         var criteria = {
                             _id: notification._id
                         }
                         var updateData = {
                             notification_category: NotificationCategory.PRODUCTIVITY
                         }

                         Notification.updateNotifications(criteria, updateData, function(r){
                             notifCallBack(null);
                         });


                     } else if(notification.notification_type == Notifications.SHARE_GROUP  || notification.notification_type == Notifications.SHARE_GROUP_RESPONSE) {

                         var criteria = {
                             _id: notification._id
                         }
                         var updateData = {
                             notification_category: NotificationCategory.PRODUCTIVITY
                         }

                         Notification.updateNotifications(criteria, updateData, function(r){
                             notifCallBack(null);
                         });


                     } else if(notification.notification_type == Notifications.SHARE_GROUP_NOTEBOOK) {

                         var criteria = {
                             _id: notification._id
                         }
                         var updateData = {
                             notification_category: NotificationCategory.PRODUCTIVITY
                         }

                         Notification.updateNotifications(criteria, updateData, function(r){
                             notifCallBack(null);
                         });


                     } else if(notification.notification_type == Notifications.ADD_GROUP_POST) {

                         var criteria = {
                             _id: notification._id
                         }
                         var updateData = {
                             notification_category: NotificationCategory.SOCIAL
                         }

                         Notification.updateNotifications(criteria, updateData, function(r){
                             notifCallBack(null);
                         });


                     } else {

                         var criteria = {
                             _id: notification._id
                         }
                         var updateData = {
                             notification_category: NotificationCategory.SOCIAL
                         }

                         Notification.updateNotifications(criteria, updateData, function(r){
                             notifCallBack(null);
                         });

                     }

                 },function(err){
                     callBack(null);
                 });
             }
         ],function(err){
            callBack(null);
         });
     }
};

module.exports = NotificationCategoryUpdateHandler;