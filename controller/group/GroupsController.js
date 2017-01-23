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
        var Upload = require('mongoose').model('Upload');
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
                    name: req.body._name,
                    description: req.body._description,
                    color: req.body._color,
                    group_pic_link: req.body._group_pic_link,
                    group_pic_id: req.body._group_pic_id,
                    members: req.body._members,
                    created_by: Util.getCurrentSession(req).id,
                    type:(typeof req.body._type != 'undefined' ? req.body._type : 1)
                };
                Groups.createGroup(_group, function (resultSet) {
                    if (resultSet.status == 200) {
                        callBack(null, resultSet.result);
                    }
                });
            },
            function updateImageDocument(groupData, callBack) {

                if (req.body._group_pic_id) {
                    var filter = { "_id" : req.body._group_pic_id };
                    var value = { "entity_id" : groupData._id };
                    Upload.updateUpload(filter, value, function (updateResult) {
                        if(updateResult.error) {
                            callBack(updateResult.error, null);
                        }
                        callBack(null, groupData);
                    });
                } else {
                    callBack(null, groupData);
                }
            },
            function createDefaultFolder(groupData, callBack) {

                if (typeof groupData != 'undefined' && Object.keys(groupData).length > 0) {

                    var _folderData = {
                        name: groupData.name,
                        color: groupData.color,
                        isGrouped: 1,
                        user_id: UserId,
                        group_id: groupData._id
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
                        type: NoteBookType.GROUP_NOTEBOOK,
                        user_id: UserId,
                        group_id: groupData._id
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
            Notification = require('mongoose').model('Notification'),
            NotificationRecipient = require('mongoose').model('NotificationRecipient'),
            Groups = require('mongoose').model('Groups');

        var groupId = req.body._groupId;
        _async.waterfall([
            function getGroupMembers(callBack) {
                var criteria = {_id: Util.toObjectId(groupId)};
                Groups.getGroupMembers(criteria, function (membersResult) {

                    callBack(null, membersResult.members);
                });
            },
            function addPost(members, callBack) {
                var data = {
                    has_attachment: (typeof req.body.__hs_attachment != 'undefined') ? req.body.__hs_attachment : false,
                    content: (typeof req.body.__content != 'undefined') ? req.body.__content : "",
                    created_by: (req.body.__on_friends_wall === 'true') ? req.body.__profile_user_id : CurrentSession.id,
                    post_owned_by: CurrentSession.id,
                    page_link: (typeof req.body.page_link != 'undefined') ? req.body.page_link : "",
                    post_visible_mode: PostVisibleMode.GROUP_MEMBERS,
                    visible_users: members,
                    post_mode: (typeof req.body.__post_mode != 'undefined') ? req.body.__post_mode : PostConfig.NORMAL_POST,
                    file_content: (typeof req.body.__file_content != 'undefined') ? req.body.__file_content : "",
                    upload_id: (typeof req.body.__uuid != 'undefined') ? req.body.__uuid : "",
                    location: (typeof req.body.__lct != 'undefined') ? req.body.__lct : "",
                    life_event: (typeof req.body.__lf_evt != 'undefined') ? req.body.__lf_evt : "",
                    shared_post: ""
                };
                TimeLinePostHandler.addNewPost(data, function (addResult) {
                    callBack(null, addResult);
                });
            },


            function addNotification(postData, callBack) {

                if (postData.visible_users.length > 0 && Object.keys(postData).length > 0) {

                    var _data = {
                        sender: postData.post_owned_by.user_id,
                        notification_type: Notifications.SHARE_GROUP,
                        notified_group: groupId
                    }
                    Notification.saveNotification(_data, function (notificationRes) {
                        if (notificationRes.status == 200) {
                            console.log(notificationRes);
                            callBack(null, postData, notificationRes.result._id);
                        }
                    });
                } else {
                    callBack(null, postData, null);
                }
            },
            function notifyingUsers(postData, notification_id, callBack) {

                if (typeof notification_id != 'undefined' && postData.visible_users.length > 0) {
                    var _data = {
                        notification_id: notification_id,
                        recipients: postData.visible_users
                    };
                    NotificationRecipient.saveRecipients(_data, function (res) {
                        callBack(null, postData);
                    });

                } else {
                    callBack(null, postData);
                }
            }
        ], function (err) {
            outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
            res.status(200).send(outPut);
        });

    },

    /*
     * Updating the group description
     */
    updateDescription: function (req, res) {

        var outPut = {};
        var currentSession = Util.getCurrentSession(req);
        var async = require('async');
        var groups = require('mongoose').model('Groups');
        var groupId = (typeof req.body.__groupId != 'undefined') ? req.body.__groupId : null;
        var description = (typeof req.body.__description != 'undefined') ? req.body.__description : null;

        if(groupId == null) {
            outPut['status'] = ApiHelper.getMessage(602, Alert.GROUP_ID_EMPTY, Alert.GROUP_ID_EMPTY);
            res.status(602).send(outPut);
            return;
        }

        if(description == null) {
            outPut['status'] = ApiHelper.getMessage(602, Alert.GROUP_DESCRIPTION_EMPTY, Alert.GROUP_DESCRIPTION_EMPTY);
            res.status(602).send(outPut);
            return;
        }

        async.waterfall([
            function updateDb(callBack) {
                var filter = {
                    "_id" : groupId
                };
                var value = {
                    "description" : description
                };
                groups.updateGroups(filter, value, function (updateResult) {
                    callBack(null, updateResult.group);
                });
            }
        ], function (err) {
            outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
            res.status(200).send(outPut);
        });
    },


    /**
     * @description Add new users as an array
     * @param String groupId
     * @param Array newusers
     *      ex:-
     *          [{
     *              "permissions" : null,
     *              "status" : 3,
     *               "user_id" : "583d3d0ddaf9fd094117eb72",
     *               "name" : "Supun Sulan"
     *          }]
     */
    addMembers: function (req, res) {

        var outPut = {};
        var currentSession = Util.getCurrentSession(req);
        var async = require('async');
        var groups = require('mongoose').model('Groups');
        var groupId = (typeof req.body.__groupId != 'undefined') ? req.body.__groupId : null;
        var newMembers = (typeof req.body.__members != 'undefined') ? req.body.__members : [];

        if(groupId == null) {
            outPut['status'] = ApiHelper.getMessage(602, Alert.GROUP_ID_EMPTY, Alert.GROUP_ID_EMPTY);
            res.status(602).send(outPut);
            return;
        }

        if(newMembers == null) {
            outPut['status'] = ApiHelper.getMessage(602, Alert.GROUP_MEMBERS_EMPTY, Alert.GROUP_MEMBERS_EMPTY);
            res.status(602).send(outPut);
            return;
        }

        async.waterfall([
            function updateDb(callBack) {
                var filter = {
                    "_id" : groupId
                };
                var value = {
                    $push : {
                        "members" : {$each : newMembers }
                    }
                };
                groups.updateGroups(filter, value, function (updateResult) {
                    callBack(null, updateResult.group);
                });
            }
        ], function (err) {
            outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
            res.status(200).send(outPut);
        });
    },

    removeMember: function (req, res) {
        var Groups = require('mongoose').model('Groups'),
            _async = require('async'),
            _arrIndex = require('array-index-of-property');

        var group_id = req.body._group_id,
            member_id = req.body._member_id;

        _async.waterfall([

            function removeUserFromGroup(callBack) {
                var criteria = {
                  '_id': Util.toObjectId(group_id),
                  'members.user_id': Util.toObjectId(member_id)
                };

                var _status = {
                    'members.$.status': GroupSharedRequest.MEMBER_REMOVED
                };

                Groups.updateGroups(criteria, _status, function (r) {
                    callBack(null);
                });
            },
            function removePostSubscriptions(callBack) {
                //ToDo: remove member post subs
                callBack(null);
            },
            function removeSharedCalendar(callBack) {
                //ToDo: remove member calendar events tasks todos
                callBack(null);
            }

        ], function (err) {
            var outPut = {};
            if (err) {
                outPut['status'] = ApiHelper.getMessage(400, Alert.ERROR);
                res.status(400).send(outPut);
            } else {
                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS);
                res.status(200).send(outPut);
            }
        });
    },

    /**
     * Upload the group image
     * @param req
     * @param res
     * @returns Object outPut
     */
    uploadGroupProfileImage: function (req, res) {

        var CurrentSession = Util.getCurrentSession(req);
        var User = require('mongoose').model('User');
        var data = {
            content_title: "Group profile Image",
            file_name: req.body.image,
            is_default: 1,
            entity_id: null,
            entity_tag: UploadMeta.GROUP_IMAGE,
            status: 7
        }
        ContentUploader.uploadFile(data, function (payLoad) {
            if (payLoad.status != 400) {
                var outPut = {
                    status: ApiHelper.getMessage(200, Alert.GROUP_IMAGE_SUCCESS, Alert.SUCCESS)
                }
                outPut['upload'] = payLoad;
                res.status(200).json(outPut);
            } else {
                var outPut = {
                    status: ApiHelper.getMessage(400, Alert.GROUP_IMAGE_ERROR, Alert.ERROR)
                };
                res.status(400).send(outPut);
            }
        });
    },

    /**
     * This function returns a given group
     * @param req
     * @param res
     * @returns Object outPut
     */
    getGroup: function (req, res) {
        var Group = require('mongoose').model('Groups');
        var _async = require('async');
        var namePrefix = req.body.name_prefix;


        _async.waterfall([
            function getGroup(callBack){
                var criteria = { "name_prefix" : namePrefix };
                Group.getGroup(criteria, function(result) {
                    if(result.status==200) {
                        callBack(null, result.group[0]);
                    } else {
                        callBack(null, null);
                    }
                });
            }
        ], function (err, group) {
            var outPut = {};
            if(err){
                outPut['status'] = ApiHelper.getMessage(500, Alert.ERROR, Alert.ERROR);
                outPut['group'] = null;
            } else {
                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['group'] = group;
            }
            res.status(200).send(outPut);
            return;
        });
    },

    /**
     * This function returns groups under a given criteria
     * @param req
     * @param res
     * @returns Object outPut
     */
    getGroups: function (req, res) {
        var Group = require('mongoose').model('Groups');
        var _async = require('async');

        _async.waterfall([
            function getGroups(callBack){
                var criteria = {};
                Group.getGroup(criteria, function(result) {
                    if(result.status==200) {
                        callBack(null, result.group);
                    } else {
                        callBack(null, null);
                    }
                });
            }
        ], function (err, groups) {
            var outPut = {};
            if(err){
                outPut['status'] = ApiHelper.getMessage(500, Alert.ERROR, Alert.ERROR);
                outPut['groups'] = null;
            } else {
                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['groups'] = groups;
                console.log(outPut['groups']);
                console.log("GROUPS FROM BACKEND ");
            }
            res.status(200).send(outPut);
            return;
        });
    },

    /**
     * This function returns 12 random members
     * @param req
     * @param res
     * @returns Object outPut
     */
    getMembers: function (req, res) {
        var Group = require('mongoose').model('Groups');
        var User = require('mongoose').model('User');
        var Upload = require('mongoose').model('Upload');
        var name_prefix = req.body.name_prefix;
        var defaultRandomMemberCount = 12;

        var _async = require('async');
        _async.waterfall([
            function getGroupMembers(callBack){

                var criteria = {name_prefix: name_prefix};
                Group.getGroupMembers(criteria, function(result) {
                    if(result.error && result == null) {
                        callBack(result.error, null);
                    }
                    callBack(null, result);
                });
            },
            function composeMembers(membersResult, callBack) {
                var i = 0;
                var arrUsers = [];
                var BreakException = {};
                var members = typeof(membersResult.memberObjs) != 'undefined' ? membersResult.memberObjs : [];
                members.forEach(function(member) {
                    Upload.getProfileImage(member.user_id, function (profileImageData) {
                        var url = '';
                        if (profileImageData.status != 200) {
                            url = Config.DEFAULT_PROFILE_IMAGE;
                        } else {
                            url = profileImageData.image.profile_image.http_url;
                        }

                        var tmpUserObj = {
                            name: member.name,
                            user_id: member.user_id,
                            status: member.status,
                            permissions: member.permissions,
                            _id:member._id,
                            profile_image:url
                        };
                        arrUsers.push(tmpUserObj);
                        i = i+1;

                        if( ( i == members.length && members.length != defaultRandomMemberCount+1) || i == defaultRandomMemberCount ){
                            callBack(null, membersResult, arrUsers);
                        }
                    });
                });
            }
        ], function (err, groupMembers, randomMembers) {
            var outPut = {};
            if(err){
                outPut['status'] = ApiHelper.getMessage(500, Alert.ERROR, Alert.ERROR);
                outPut['members'] = null;
            } else {
                groupMembers['random_members'] = randomMembers;
                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['members'] = groupMembers;
            }
            res.status(200).send(outPut);
            return;
        });
    }
}

module.exports = GroupsController;
