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

        var Folders = require('mongoose').model('Folders');

        var _folder = {
            name:req.body.folder_name,
            color:req.body.folder_color,
            isDefault:req.body.isDefault,
            user_id:Util.getCurrentSession(req).id
        };

        Folders.addNewFolder(_folder,function(resultSet){
            if(resultSet.status == 200){
                res.status(200).send(ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS));
            }else{
                res.status(400).send(ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR));
            }
        });

    },
    getFolders: function (req, res) {

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
                Folders.getFolders(criteria,function(resultSet){
                    callBack(null,resultSet.folders);
                });
            },
            function getDocumentsDB(folders,callBack){
                var _documents = [];
                _async.eachSeries(folders, function(folder, callBack){
                    var _acceptedSharedUsers = 0
                    for(var inc = 0; inc < folder.shared_users.length; inc++){
                        if(folder.shared_users[inc].status == FolderSharedRequest.REQUEST_ACCEPTED){
                            _acceptedSharedUsers++;
                        }
                    }

                    var _folder = {
                        folder_id:folder._id,
                        folder_name:folder.name,
                        folder_color:folder.color,
                        folder_user:folder.user_id,
                        folder_shared_users:folder.shared_users,
                        folder_updated_at:folder.updated_at,
                        is_shared: (_acceptedSharedUsers > 0)? true:false,
                        shared_privacy: FolderSharedMode.READ_WRITE,
                        owned_by: 'me',
                        documents:[]
                    }, documents_criteria = {
                        folder_id: Util.toObjectId(folder._id)
                    };
                    FolderDocs.getDocuments(documents_criteria,function(resultSet){
                        var documents_set = resultSet.documents,
                            _shared_users = _folder.folder_shared_users;

                        _async.eachSeries(documents_set, function(__document, callBack){

                            _async.waterfall([
                                function getUser(callBack) {
                                    var _search_param = {
                                            _id:__document.user_id
                                        },
                                        showOptions ={
                                            w_exp:false,
                                            edu:false
                                        };

                                    User.getUser(_search_param,showOptions,function(resultSet){
                                        if(resultSet.status ==200 ){
                                            callBack(null,resultSet.user)
                                        }
                                    });
                                },
                                function finalizeDocumentSet(document_owner, callBack) {
                                    var c_index = grep(_shared_users, function(e){ return e.user_id == __document.user_id; }),
                                        _hexColor = '#e3e7ea';

                                    if(c_index.length > 0 && (__document.user_id == c_index[0].user_id)){
                                        _hexColor = c_index[0].user_document_color;
                                    }

                                    var _document = {
                                        document_id: __document._id,
                                        document_name: __document.name,
                                        document_content: __document.content,
                                        document_owner: document_owner.first_name + ' ' + document_owner.last_name,
                                        document_color: _hexColor,
                                        updated_at: DateTime.documentCreatedDate(__document.updated_at)
                                    };
                                    _folder.documents.push(_document);

                                    callBack(null);
                                }
                            ],function(err){
                                callBack(null);
                            });

                        },function(err){
                            if(_folder.folder_name == 'My Folder'){
                                my_doc = _folder;
                            }else {
                                _documents.push(_folder);
                            }
                            callBack(null);
                        });

                    });
                },function(err){
                    callBack(null,_documents);
                });
            },
            function isESIndexExists(resultSet, callBack){
                var user_id = CurrentSession.id;
                var _cache_key = "idx_user:"+FolderConfig.CACHE_PREFIX+user_id;
                var query={
                    index:_cache_key,
                    id:user_id,
                    type: 'shared_documents',
                };
                ES.isIndexExists(query, function (esResultSet){
                    callBack(null, {
                        documentsDb: resultSet,
                        isExists: esResultSet
                    });
                });
            },
            function getSharedFolders(resultSet, callBack){
                if(resultSet.isExists) {
                    var user_id = CurrentSession.id;

                    var query = {
                        q: "_id:" + user_id.toString()
                    };
                    Folders.ch_getSharedFolders(user_id, query, function (esResultSet) {
                        callBack(null, {
                            user_documents: resultSet.documentsDb,
                            shared_documents: esResultSet
                        });
                    });
                }else{
                    callBack(null, {
                        user_documents: resultSet.documentsDb,
                        shared_documents: null
                    });
                }

            },
            function getSharedFolders(resultSet, callBack){

                if(resultSet.shared_documents != null){
                    var sharedDocumentList = resultSet.shared_documents.result[0].folders;
                    var _documents = (resultSet.user_documents != null)? resultSet.user_documents: [];
                    _async.eachSeries(sharedDocumentList, function(folder, callBack){
                        _async.waterfall([
                            function getFolders(callBack){
                                Folders.getFolderById(folder,function(resultSet){
                                    callBack(null,resultSet);
                                });
                            },
                            function getUserES(resultSet, callBack){
                                var query={
                                    q:"user_id:"+resultSet.user_id.toString(),
                                    index:'idx_usr'
                                };
                                //Find User from Elastic search
                                ES.search(query,function(csResultSet){
                                    var usrObj = {
                                        user_id:resultSet.user_id,
                                        user_name:csResultSet.result[0]['first_name']+" "+csResultSet.result[0]['last_name'],
                                        profile_image:csResultSet.result[0]['images']['profile_image']['http_url']
                                    };
                                    callBack(null, {
                                        folder: resultSet,
                                        user: usrObj
                                    });
                                });
                            },
                            function getDocumentsDB(resultSet,callBack){

                                var folder = resultSet.folder;

                                var _folder = {
                                    folder_id:folder._id,
                                    folder_name:folder.name,
                                    folder_color:folder.color,
                                    folder_user:resultSet.user,
                                    folder_shared_users:folder.shared_users,
                                    folder_updated_at:folder.updated_at,
                                    is_shared: true,
                                    shared_privacy: FolderSharedMode.READ_ONLY,
                                    owned_by: 'another',
                                    documents:[]
                                }, documents_criteria = {
                                    folder_id: Util.toObjectId(folder._id)
                                };

                                var folder_sharedUser = grep(_folder.folder_shared_users, function(e){ return e.user_id == user_id; });

                                if(folder_sharedUser.length > 0 && folder_sharedUser[0].status == FolderSharedRequest.REQUEST_ACCEPTED){

                                    _folder.shared_privacy = folder_sharedUser[0].shared_type;

                                    Folders.getFolders(documents_criteria,function(resultSet){
                                        var documents_set = resultSet.documents,
                                            _shared_users = _folder.folder_shared_users;

                                        _async.eachSeries(documents_set, function(__document, callBack){

                                            _async.waterfall([
                                                function getUser(callBack) {
                                                    var _search_param = {
                                                            _id:__document.user_id
                                                        },
                                                        showOptions ={
                                                            w_exp:false,
                                                            edu:false
                                                        };

                                                    User.getUser(_search_param,showOptions,function(resultSet){
                                                        if(resultSet.status ==200 ){
                                                            callBack(null,resultSet.user)
                                                        }
                                                    });
                                                },
                                                function finalizeDocumentSet(document_owner, callBack) {
                                                    var c_index = grep(_shared_users, function(e){ return e.user_id == __document.user_id; }),
                                                        _hexColor = '#e3e7ea';

                                                    if(c_index.length > 0 && (__document.user_id == c_index[0].user_id)){
                                                        _hexColor = c_index[0].user_document_color;
                                                    }

                                                    var _document = {
                                                        document_id: __document._id,
                                                        document_name: __document.name,
                                                        document_content: __document.content,
                                                        document_owner: document_owner.first_name + ' ' + document_owner.last_name,
                                                        document_color: _hexColor,
                                                        updated_at: DateTime.documentCreatedDate(__document.updated_at)
                                                    };
                                                    _folder.documents.push(_document);

                                                    callBack(null);
                                                }
                                            ],function(err){
                                                callBack(null);
                                            });

                                        },function(err){
                                            if(_folder.folder_name == 'My Document'){
                                                my_doc = _folder;
                                            }else {
                                                _documents.push(_folder);
                                            }
                                            callBack(null);
                                        });

                                    });
                                }else{
                                    callBack(null);
                                }
                            }
                        ],function(err){
                            callBack(null);
                        });

                    },function(err){
                        callBack(null, _documents);
                    });

                }else {
                    callBack(null, resultSet.user_documents);
                }
            }

        ],function(err,resultSet){
            if(err){
                var outPut ={
                    status:ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR),
                    documents:err
                }
                res.status(400).json(outPut);
            }
            var outPut ={
                status:ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                documents:resultSet
            }
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

    },

};

module.exports = FolderController;
