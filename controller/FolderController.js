'use strict';

/**
 * Handle All Folder related functions
 */

var FolderController ={

    /**
     * Adding New Folder
     * @param req
     * @param res
     */
    addNewFolder:function(req,res){

        console.log("addNewFolder")

        var Folders = require('mongoose').model('Folders'),
            _shared_with = (typeof req.body.shared_with != 'undefined' && req.body.shared_with.length > 0) ? req.body.shared_with : [],
            _randColor = require('randomcolor'),
            sharedUsers = [],
            _async = require('async'),
            _folder_id = 0,
            Notification = require('mongoose').model('Notification'),
            NotificationRecipient = require('mongoose').model('NotificationRecipient');

        _async.waterfall([

            function addFolderToDB(callBack){

                console.log("addFolderToDB");

                for(var i = 0; i < _shared_with.length; i++){
                    var randColor = _randColor.randomColor({
                        luminosity: 'light',
                        hue: 'random'
                    });

                    var _sharingUser = {
                        user_id: _shared_with[i],
                        user_note_color: randColor,
                        shared_type: FolderSharedRequest.READ_WRITE,
                        status: FolderSharedRequest.REQUEST_PENDING
                    };

                    sharedUsers.push(_sharingUser);
                }

                var _folder = {
                    name:req.body.folder_name,
                    color:req.body.folder_color,
                    isDefault:req.body.isDefault,
                    user_id:Util.getCurrentSession(req).id,
                    shared_users:sharedUsers
                };

                Folders.addNewFolder(_folder,function(resultSet){
                    console.log(resultSet.folder)
                    _folder_id = resultSet.folder._id;
                    callBack(null);
                });

            },
            function addNotification(callBack){
                console.log("addNotification");

                if(_shared_with.length > 0 && _folder_id != 0){
                    var _data = {
                        sender:Util.getCurrentSession(req).id,
                        notification_type:Notifications.SHARE_FOLDER,
                        notified_folder:_folder_id
                    }
                    Notification.saveNotification(_data, function(res){
                        if(res.status == 200){
                            callBack(null, res.result._id);
                        }
                    });
                } else{
                    callBack(null, null);
                }
            },
            function notifyingUsers(notification_id, callBack){
                console.log("notifyingUsers");

                if(typeof notification_id != 'undefined' && _shared_with.length > 0){

                    var _data = {
                        notification_id:notification_id,
                        recipients:_shared_with
                    };
                    NotificationRecipient.saveRecipients(_data, function(res) {
                        callBack(null);
                    });

                } else {
                    callBack(null);
                }
            }

        ],function(err){
            console.log("async waterfall callback");

            if(err){
                var outPut ={
                    status:ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR),
                };
                res.status(400).json(outPut);
            }
            var outPut ={
                status:ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                folder_id:_folder_id
            };
            res.status(200).json(outPut);
        });

    },

    getFolders: function (req, res) {

        var Folders = require('mongoose').model('Folders'),
            User = require('mongoose').model('User'),
            CurrentSession = Util.getCurrentSession(req),
            _async = require('async'),
            grep = require('grep-from-array'),
            FolderDocs = require('mongoose').model('FolderDocs');

        var user_id = CurrentSession.id;
        var criteria = {user_id:Util.toObjectId(user_id)};

        _async.waterfall([
            function getFolders(callBack){
                Folders.getFolders(criteria,function(resultSet){
                    callBack(null,resultSet.folders);
                });
            },
            function getDocumentsDB(folders,callBack){
                var _folders = [];

                _async.eachSeries(folders, function(folder, callBackFolder){

                    var _folder = {
                        folder_id:folder._id,
                        folder_name:folder.name,
                        folder_color:folder.color,
                        folder_user:folder.user_id,
                        folder_shared_users:folder.shared_users,
                        folder_updated_at:folder.updated_at,
                        owned_by: 'me',
                        documents:[]
                    }, documents_criteria = {
                        folder_id: Util.toObjectId(folder._id)
                    };
                    FolderDocs.getDocuments(documents_criteria,function(resultSet){

                        var _documents = [];

                        _async.eachSeries(resultSet.documents, function(doc, callBackDocument){

                            var _doc = {
                                document_id:doc._id,
                                document_name:doc.name,
                                document_type:doc.content_type,
                                document_user:doc.user_id,
                                document_path:doc.file_path,
                                document_thumb_path:doc.thumb_path,
                                document_updated_at:doc.updated_at
                            };
                            _documents.push(_doc);
                            callBackDocument(null);

                        },function(err){

                            _folder.documents = _documents;
                            _folders.push(_folder);
                            callBackFolder(null);

                        });

                    });
                },function(err){
                    console.log("async eachseries callback")
                    callBack(null,_folders);
                });
            }

        ],function(err,resultSet){
            console.log("async waterfall callback")
            if(err){
                var outPut ={
                    status:ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR),
                };
                res.status(400).json(outPut);
            }
            var outPut ={
                status:ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                folders:resultSet
            };
            res.status(200).json(outPut);
        });
    },

    getFolder: function (req, res) {

        var Folders = require('mongoose').model('Folders');

        var folder_id = req.params.folder_id;
        var criteria = {_id: Util.toObjectId(folder_id)};

        Folders.getFolder(criteria, function (resultSet) {
            if (resultSet.status == 200) {
                var outPut = {
                    status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                    folder: resultSet.folder
                }
                res.status(200).json(outPut);
            } else {
                res.status(400).send(ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR));
            }
        });

    }

};

module.exports = FolderController;
