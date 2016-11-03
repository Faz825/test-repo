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
            _shared_with = req.body.shared_with,
            _randColor = require('randomcolor'),
            sharedUsers = [],
            _async = require('async'),
            _folder_id = 0,
            Notification = require('mongoose').model('Notification'),
            NotificationRecipient = require('mongoose').model('NotificationRecipient');

        _async.waterfall([

            function addFolderToDB(){

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
                });

            },
            function addNotification(callBack){

                if(sharedUsers.length > 0 && _folder_id != 0){

                    var _data = {
                        sender:Util.getCurrentSession(req).id,
                        notification_type:Notifications.SHARE_FOLDER,
                        notified_folder:_folder_id
                    }
                    Notification.saveNotification(_data, function(res){
                        if(res.status == 200){
                            callBack(null,res.result._id);
                        }

                    });

                } else{
                    callBack(null);
                }
            },
            function notifyingUsers(notification_id, callBack){

                if(typeof notification_id != 'undefined' && notifyUsers.length > 0){

                    var _data = {
                        notification_id:notification_id,
                        recipients:notifyUsers
                    };
                    NotificationRecipient.saveRecipients(_data, function(res){
                        callBack(null);
                    })

                } else{
                    callBack(null);
                }
            }

        ],function(err,resultSet){
            console.log("async waterfall callback")

            if(resultSet.status == 200){
                var outPut ={
                    status:ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS)
                };
                res.status(200).json(outPut);
            }else{
                var outPut ={
                    status:ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR)
                };
                res.status(400).json(outPut);
            }

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

    getFolders: function (req, res) {

        console.log("getFolders")

        var Folders = require('mongoose').model('Folders'),
            User = require('mongoose').model('User'),
            CurrentSession = Util.getCurrentSession(req),
            _async = require('async'),
            grep = require('grep-from-array'),
            FolderDocs = require('mongoose').model('FolderDocs'),
            _this = this;

        var user_id = CurrentSession.id;
        var criteria = {user_id:Util.toObjectId(user_id)};
        var my_doc;


        _async.waterfall([
            function getFolders(callBack){
                console.log("1 - getFolders")
                Folders.getFolders(criteria,function(resultSet){
                    callBack(null,resultSet.folders);
                });
            },
            function getDocumentsDB(folders,callBack){
                console.log("2 - getDocumentsDB")
                var _documents = [];
                _async.eachSeries(folders, function(folder, callBack){
                    //var _acceptedSharedUsers = 0
                    //for(var inc = 0; inc < folder.shared_users.length; inc++){
                    //    if(folder.shared_users[inc].status == FolderSharedRequest.REQUEST_ACCEPTED){
                    //        _acceptedSharedUsers++;
                    //    }
                    //}

                    var _folder = {
                        folder_id:folder._id,
                        folder_name:folder.name,
                        folder_color:folder.color,
                        folder_user:folder.user_id,
                        folder_shared_users:folder.shared_users,
                        folder_updated_at:folder.updated_at,
                        //is_shared: (_acceptedSharedUsers > 0)? true:false,
                        //shared_privacy: FolderSharedMode.READ_WRITE,
                        owned_by: 'me',
                        documents:[]
                    }, documents_criteria = {
                        folder_id: Util.toObjectId(folder._id)
                    };
                    FolderDocs.getDocuments(documents_criteria,function(resultSet){
                        _folder.documents = resultSet.documents;
                        _documents.push(_folder);
                        callBack(null);
                    });
                },function(err){
                    console.log("async eachseries callback")
                    callBack(null,_documents);
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
