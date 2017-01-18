'use strict';

/**
 * Handle All Folder related functions
 */

var GroupFolderController ={

    /**
     * Adding New Folder
     * @param req
     * @param res
     */
    addNewFolder:function(req,res){


        var Folders = require('mongoose').model('Folders'),
            User = require('mongoose').model('User'),
            CurrentSession = Util.getCurrentSession(req),
            _async = require('async'),
            grep = require('grep-from-array'),
            FolderDocs = require('mongoose').model('FolderDocs'),
            grpMembers = req.body.group_members,
            _randColor = require('randomcolor');

        var sharedUsers = [];

        _async.waterfall([
            function getSharedMembers(callBack) {
                if(grpMembers) {
                    for(var i = 0; i < grpMembers.length; i++){
                        //console.log("_shared_with = "+i)
                        var randColor = _randColor.randomColor({
                            luminosity: 'light',
                            hue: 'random'
                        });

                        var _sharingUser = {
                            user_id: grpMembers[i].user_id,
                            user_note_color: randColor,
                            shared_type: FolderSharedMode.VIEW_ONLY,
                            status: FolderSharedRequest.REQUEST_PENDING
                        };

                        sharedUsers.push(_sharingUser);
                    }
                    callBack(null, sharedUsers);
                } else {
                    callBack(null, [])
                }

            },
            function addFolder(sharedUsers, callBack) {

                    var _folderrr = {
                        name:req.body.folder_name,
                        color:req.body.folder_color,
                        isDefault:req.body.isDefault,
                        user_id:Util.getCurrentSession(req).id,
                        shared_users:sharedUsers,
                        folder_type:req.body.folder_type,
                        group_id:req.body.group_id
                    };

                    Folders.addNewFolder(_folderrr,function(resultSet){
                        callBack(null,resultSet);
                    });

            },
            function formatFolder(resultSet, callBack) {
                if(typeof resultSet != 'undefined' && resultSet) {
                    var _folder = {
                        folder_id:resultSet.folder._id,
                        folder_name:resultSet.folder.name,
                        folder_color:resultSet.folder.color,
                        folder_user:resultSet.folder.user_id,
                        folder_shared_users:resultSet.folder.shared_users,
                        folder_updated_at:resultSet.folder.updated_at,
                        folder_type:resultSet.folder_type,
                        folder_group_id:resultSet.folder_group_id,
                        owned_by: 'me',
                        documents:[]
                    };
                    callBack(null,_folder);
                } else {
                    callBack(null,null);
                }

            }
        ],function(err, _folder){

            var outPut ={
                status:ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                folder:_folder
            };
            res.status(200).json(outPut);
        })

    },

    getFolders: function (req, res) {
        console.log("came to getFolders in GroupFolderController");
        var Folders = require('mongoose').model('Folders'),
            User = require('mongoose').model('User'),
            CurrentSession = Util.getCurrentSession(req),
            _async = require('async'),
            grep = require('grep-from-array'),
            FolderDocs = require('mongoose').model('FolderDocs'),
            _this = this;

        var user_id = CurrentSession.id;
        var group_id = req.params.group_id;
        console.log("group_id > ", group_id);
        var criteria = {group_id:Util.toObjectId(group_id)};


        _async.waterfall([
            function getFolders(callBack){
                Folders.getFolders(criteria,function(resultSet){
                    callBack(null,resultSet.folders);
                });
            },
            function getDocumentsDB(folders,callBack){
                var _documents = [];
                _async.eachSeries(folders, function(folder, callBack){

                    var _isShared = false;
                    var _sharedUsers = folder.shared_users;
                    for(var su = 0; su < _sharedUsers.length; su++){
                        if(_sharedUsers[su].status == FolderSharedRequest.REQUEST_ACCEPTED){
                            _isShared = true;
                        }
                    }

                    var _folder = {
                        folder_id:folder._id,
                        folder_name:folder.name,
                        folder_color:folder.color,
                        folder_user:folder.user_id,
                        folder_group:folder.group_id,
                        folder_shared_users:folder.shared_users,
                        folder_updated_at:folder.updated_at,
                        is_shared:_isShared,
                        shared_mode:FolderSharedMode.VIEW_UPLOAD,
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
                    callBack(null,_documents);
                });
            }

        ],function(err,resultSet){
            if(err){
                var outPut ={
                    status:ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR)
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

        var GroupFolders = require('mongoose').model('GroupFolders');

        var folder_id = req.params.folder_id;
        var criteria = {_id: Util.toObjectId(folder_id)};

        GroupFolders.getFolder(criteria, function (resultSet) {
            if (resultSet.status == 200) {
                var outPut = {
                    status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                    folder: resultSet.folder
                }
                res.status(200).json(outPut);
            } else {
                var outPut ={
                    status:ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR)
                };
                res.status(400).json(outPut);
            }
        });

    },
    /**
     * get owned group folder count
     * @param req
     * @param res
     */

    getGroupFolderCount:function(req,res){

        var Folders = require('mongoose').model('Folders'),
            CurrentSession = Util.getCurrentSession(req);
        var user_id = CurrentSession.id;
        var criteria = {user_id:Util.toObjectId(user_id), group_id:req.params.group_id, type: 1};

        Folders.getCount(criteria,function(resultSet){
            if(resultSet.status == 200){
                var outPut ={
                    status:ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                    count:resultSet.result
                };
                res.status(200).json(outPut);
            } else{
                var outPut ={
                    status:ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR),
                };
                res.status(400).json(outPut);
            }
        });

    }

};

module.exports = GroupFolderController;
