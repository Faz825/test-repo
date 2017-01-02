/**
 * Created by phizuupc on 12/19/2016.
 */
'use strict';

/**
 * Handle All Groups related functions
 */

var GroupsController = {

    createGroup: function (req, res) {

        var Groups = require('mongoose').model('Groups');
        var Folders = require('mongoose').model('Folders');
        var NoteBook = require('mongoose').model('NoteBook');
        var CurrentSession = Util.getCurrentSession(req);
        var _async = require('async'),
            UserId = Util.getCurrentSession(req).id,
            Notification = require('mongoose').model('Notification'),
            NotificationRecipient = require('mongoose').model('NotificationRecipient'),
            User = require('mongoose').model('User'),
            notifyUsers = (typeof req.body._members != 'undefined' ? req.body._members : []); //this should be an array


        _async.waterfall([
            function createGroup(callBack) {

                var _group = {
                    type: req.body._type,
                    name: req.body._name,
                    description: req.body._description,
                    color: req.body._color,
                    group_pic_link: req.body._group_pic_link,
                    members: req.body._members,
                    created_by: Util.getCurrentSession(req).id,
                };
                Groups.createGroup(_group, function (resultSet) {
                    if (resultSet.status == 200) {
                        callBack(null, resultSet.result);
                    }
                });
            },
            //function uploadGroupImage(groupData, callBack){
            //    if (typeof req.body._group_pic_link == 'undefined' || typeof req.body._group_pic_link == "") {
            //        callBack(null, groupData);
            //    }
            //
            //    var data = {
            //        content_title: "Group Image",
            //        file_name: req.body._group_pic_link,
            //        is_default: 1,
            //        entity_id: groupData._id,
            //        entity_tag: UploadMeta.GROUP_IMAGE
            //    }
            //    ContentUploader.uploadFile(data, function (payLoad) {
            //        callBack(null, groupData);
            //    });
            //},
            function createDefaultFolder(groupData, callBack) {

                if (typeof groupData != 'undefined' && Object.keys(groupData).length > 0) {

                    var _folderData = {
                        name: groupData.name,
                        color: groupData.color,
                        isGrouped: 1,
                        user_id: UserId,
                        group_data: [{
                            name: groupData.name,
                            group_id: groupData._id,
                            group_image: groupData.group_pic_link
                        }]
                    };
                    Folders.addNewFolder(_folderData, function (resultSet) {

                        callBack(null, groupData);
                    });
                } else {
                    callBack(null, groupData);
                }
            },
            function createDefaultNoteBook(groupData, callBack) {

                if (typeof groupData != 'undefined' && Object.keys(groupData).length > 0) {

                    var _notebook = {
                        name: groupData.name,
                        color: groupData.color,
                        isGrouped: 1,
                        user_id: UserId,
                        groupData: [{
                            name: groupData.name,
                            group_id: groupData._id,
                            group_image: groupData.group_pic_link
                        }]
                    };
                    NoteBook.addNewNoteBook(_notebook, function (resultSet) {
                        callBack(null, groupData);
                    });
                } else {
                    callBack(null, groupData);
                }
            },
            function addNotification(groupData, callBack) {

                if (notifyUsers.length > 0 && Object.keys(groupData).length > 0) {

                    var _data = {
                        sender: UserId,
                        notification_type: Notifications.SHARE_GROUP,
                        notified_group: groupData._id
                    }
                    Notification.saveNotification(_data, function (res) {
                        if (res.status == 200) {
                            callBack(null, groupData, res.result._id);
                        }
                    });
                } else {
                    callBack(null, groupData, null);
                }
            },
            function notifyingUsers(groupData, notification_id, callBack) {

                if (typeof notification_id != 'undefined' && notifyUsers.length > 0) {

                    var _members = [];
                    for (var x = 0; x < notifyUsers.length; x++) {
                        _members.push(notifyUsers[x].user_id);
                    }
                    var _data = {
                        notification_id: notification_id,
                        recipients: _members
                    };
                    NotificationRecipient.saveRecipients(_data, function (res) {
                        callBack(null, groupData);
                    });

                } else {
                    callBack(null, groupData);
                }
            }

        ], function (err, groupData) {

            var outPut = {};
            if (err) {
                outPut['status'] = ApiHelper.getMessage(400, Alert.ERROR);
                res.status(400).send(outPut);
            } else {
                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS);
                outPut['result'] = groupData;
                res.status(200).send(outPut);
            }
        });

    },

    addGroupPost: function (req, res) {

        var outPut = {}, CurrentSession = Util.getCurrentSession(req);
        var TimeLinePostHandler = require('../../middleware/TimeLinePostHandler');
        var _async = require('async'),
            User = require('mongoose').model('User'),
            Groups = require('mongoose').model('Groups');

        var groupId = req.body.__groupId;

        _async.waterfall([
            function getGroupMembers(callBack) {
                Groups.getGroupMembers(groupId, function (r) {
                    callBack(null, r.members);
                });
            },
            function addPost(members, callBack) {
                var data = {
                    has_attachment: (typeof req.body.__hs_attachment != 'undefined') ? req.body.__hs_attachment : false,
                    content: (typeof req.body.__content != 'undefined') ? req.body.__content : "",
                    created_by: (req.body.__on_friends_wall === 'true') ? req.body.__profile_user_id : CurrentSession.id,
                    post_owned_by: CurrentSession.id,
                    page_link: (typeof req.body.page_link != 'undefined') ? req.body.page_link : "",
                    post_visible_mode: PostVisibleMode.GROUP_POST,
                    visible_users: members,
                    post_mode: (typeof req.body.__post_type != 'undefined') ? req.body.__post_type : PostConfig.NORMAL_POST,
                    file_content: (typeof req.body.__file_content != 'undefined') ? req.body.__file_content : "",
                    upload_id: (typeof req.body.__uuid != 'undefined') ? req.body.__uuid : "",
                    location: (typeof req.body.__lct != 'undefined') ? req.body.__lct : "",
                    life_event: (typeof req.body.__lf_evt != 'undefined') ? req.body.__lf_evt : "",
                    shared_post: ""
                };
                console.log("GroupsController - addPost - data - ");
                TimeLinePostHandler.addNewPost(data, function (r) {
                    callBack(null);
                });
            }
        ], function (err) {
            outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
            res.status(200).send(outPut);
        });

    }

};

module.exports = GroupsController;
