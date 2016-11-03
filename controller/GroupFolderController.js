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

        var GroupFolders = require('mongoose').model('GroupFolders');

        var _folder = {
            name:req.body.folder_name,
            color:req.body.folder_color,
            isDefault:req.body.isDefault,
            group_id:req.body.group_id
        };

        GroupFolders.addNewFolder(_folder,function(resultSet){
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
        });

    },

    getFolders: function (req, res) {

        var GroupFolders = require('mongoose').model('GroupFolders'),
            User = require('mongoose').model('User'),
            CurrentSession = Util.getCurrentSession(req),
            _async = require('async'),
            grep = require('grep-from-array'),
            GroupFolderDocs = require('mongoose').model('GroupFolderDocs'),
            _this = this;

        var user_id = CurrentSession.id;
        var group_id = req.body.group_id;
        var criteria = {group_id:Util.toObjectId(group_id)};


        _async.waterfall([
            function getFolders(callBack){
                GroupFolders.getFolders(criteria,function(resultSet){
                    callBack(null,resultSet.folders);
                });
            },
            function getDocumentsDB(folders,callBack){
                var _documents = [];
                _async.eachSeries(folders, function(folder, callBack){

                    var _folder = {
                        folder_id:folder._id,
                        folder_name:folder.name,
                        folder_color:folder.color,
                        folder_group:folder.group_id,
                        folder_shared_users:folder.shared_users,
                        folder_updated_at:folder.updated_at,
                        documents:[]
                    }, documents_criteria = {
                        folder_id: Util.toObjectId(folder._id)
                    };
                    GroupFolderDocs.getDocuments(documents_criteria,function(resultSet){
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

    }

};

module.exports = FolderController;
