/**
 * Upload controller will handle all Uploads for content upload for the system
 * TODO : This service should be separate from the main thread if this is dealing with larg user base
 */

    'use strict';


var UploadController = {

    uploadTimeLinePhoto:function(req,res){
        var outPut ={};
        if(typeof req.body.image_name == 'undefined' || typeof req.body.image_name == ""){
            outPut['status']    = ApiHelper.getMessage(400, Alert.POST_CONTENT_EMPTY, Alert.ERROR);
            res.status(400).send(outPut);
            return 0;
        }

        var uuid = require('node-uuid');

        var data ={
            content_title:"Post Image",
            file_name:req.body.image_name,
            entity_id:req.body.upload_id,
            entity_tag:UploadMeta.TIME_LINE_IMAGE,
            upload_index:req.body.upload_index
        }

        ContentUploader.tempUpload(data,function(resultSet){
            outPut['status']    = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
            outPut['upload']   = resultSet
            res.status(200).json(outPut);
        })



    },

    uploadFolderDocument:function(req,res){

        var outPut ={},
            _async = require('async'),
            document = {},
            saved_document = {},
            CurrentSession = Util.getCurrentSession(req);

        var binaryData = Util.decodeBase64Image(req.body.content);
        var extension = binaryData.extension;
        var ext = '';
        var FolderDocs = require('mongoose').model('FolderDocs');
        var Folders =  require('mongoose').model('Folders');

        if(typeof extension != "string"){
            for(var e = 0; e < extension.length; e++){
                if(req.body.name.indexOf(extension[e]) != -1){
                    ext = extension[e];
                }
            }
            extension = ext;
        }

        if(req.body.name.indexOf(extension) != -1){
            var nameArr = req.body.name.split(extension);
            document.name = nameArr[0];
        }

        document.content_type = extension.substr(1);
        document.user_id = Util.toObjectId(CurrentSession.id);
        document.folder_id = Util.toObjectId(req.body.upload_id);
        document.upload_index = req.body.upload_index;

        console.log(document);

        _async.waterfall([

            function uploadOtherFiles(callback) {
                if(req.body.type.indexOf("image/") == -1){

                    var data ={
                        content_title:"Folder Document",
                        file_name:req.body.content,
                        entity_id:req.body.upload_id,
                        entity_tag:UploadMeta.FOLDER_DOCUMENT,
                        upload_index:req.body.upload_index
                    };

                    ContentUploader.uploadToCDN(data,function(resultSet){
                        console.log(resultSet);
                        if(resultSet.status == 200){
                            document.file_path = resultSet.upload_meta.http_url;
                            callback(null);
                        } else{
                            outPut['status']    = ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR);
                            res.status(400).json(outPut);
                        }
                    });

                } else{
                    callback(null);
                }
            },
            function uploadImageFiles(callback){
                if(req.body.type.indexOf("image/") != -1){

                    var fs = require('fs');
                    var thumb = require('node-thumbnail').thumb;

                    fs.writeFile('orig/'+req.body.name, binaryData.data, function(err) {
                        if(!err){
                            thumb({
                                source: 'orig/'+req.body.name, // could be a filename: dest/path/image.jpg
                                destination: "thumb/",
                                concurrency: 4,
                                width:196,
                                height:204,
                                suffix:''
                            }, function(err) {
                                if(!err){

                                    var _data = {
                                        orig_file : 'orig/'+req.body.name,
                                        thumb_file : 'thumb/'+req.body.name,
                                        ext : extension,
                                        entity_id:req.body.upload_id,
                                        orig_entity_tag:UploadMeta.FOLDER_DOCUMENT,
                                        thumb_entity_tag:UploadMeta.FOLDER_DOCUMENT_THUMB
                                    }

                                    ContentUploader.uploadFolderImageDocumentToCDN(_data, function(resultSet){
                                        fs.unlink(_data.orig_file, function(err){
                                            if (err) console.log(err);
                                            console.log('successfully deleted '+_data.orig_file);
                                        });
                                        fs.unlink(_data.thumb_file, function(err){
                                            if (err) console.log(err);
                                            console.log('successfully deleted '+_data.thumb_file);
                                        });
                                        console.log(resultSet);
                                        if(resultSet.status == 200){
                                            document.file_path = resultSet.upload_meta.file_path;
                                            document.thumb_path = resultSet.upload_meta.thumb_path;
                                            callback(null);
                                        } else{
                                            outPut['status']    = ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR);
                                            res.status(400).json(outPut);
                                        }

                                    });

                                } else{
                                    outPut['status']    = ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR);
                                    res.status(400).json(outPut);
                                }
                            });

                        } else{
                            outPut['status']    = ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR);
                            res.status(400).json(outPut);
                        }
                    });
                } else{
                    callback(null);
                }
            },
            function saveDocumentToDB(callback){
                console.log("saveDocumentToDB");

                if(typeof document.file_path != 'undefined'){
                    FolderDocs.addNewDocument(document, function(res){
                        console.log(res);
                        saved_document = {
                            document_id:res.document._id,
                            document_name:res.document.name,
                            document_type:res.document.content_type,
                            document_user:res.document.user_id,
                            document_path:res.document.file_path,
                            document_thumb_path:res.document.thumb_path,
                            document_updated_at:DateTime.noteCreatedDate(res.document.updated_at)
                        };
                        callback(null);
                    })
                } else{
                    callback(null);
                }
            },
            function saveDocumentToES(callback){

                if(typeof document.file_path != 'undefined'){

                    Folders.getFolderById(Util.toObjectId(document.folder_id), function(result){

                        var _sharedUsers = result.shared_users;
                        var _folderOwner = result.user_id;

                        var _index = "";

                        console.log("_folderOwner == "+typeof _folderOwner);
                        console.log("saved_document.document_user == "+typeof saved_document.document_user)

                        if (_folderOwner.toString() == saved_document.document_user.toString()){
                            _index = FolderDocsConfig.ES_INDEX_OWN_DOC;
                        } else{
                            _index = FolderDocsConfig.ES_INDEX_SHARED_DOC;
                        }

                        var _esDocument = {
                            cache_key:_index+_folderOwner.toString(),
                            document_id:saved_document.document_id,
                            document_name:saved_document.document_name,
                            content_type:saved_document.document_type,
                            document_owner:saved_document.document_user,
                            document_user:_folderOwner,
                            file_path:saved_document.document_path,
                            thumb_path:saved_document.document_thumb_path,
                            folder_id:result._id,
                            folder_name:result.name
                        };

                        FolderDocs.addDocToCache(_esDocument, function(res){

                            _async.eachSeries(_sharedUsers, function(_sharedUser, callback){

                                if(_sharedUser.status == FolderSharedRequest.REQUEST_ACCEPTED){
                                    var _documentUser = _sharedUser.user_id;

                                    console.log("_documentUser == "+typeof _documentUser);
                                    console.log("saved_document.document_user == "+typeof saved_document.document_user)

                                    if (_documentUser == saved_document.document_user.toString()){
                                        _index = FolderDocsConfig.ES_INDEX_OWN_DOC;
                                    } else{
                                        _index = FolderDocsConfig.ES_INDEX_SHARED_DOC;
                                    }

                                    _esDocument.cache_key = _index+_documentUser.toString();
                                    _esDocument.document_user = _documentUser;

                                    FolderDocs.addDocToCache(_esDocument, function(res){callback(null)});
                                }

                            }, function(err){
                                callback(null)
                            });
                        });
                    });

                } else{
                    callback(null);
                }
            }
        ], function(err){
            console.log("callback")
            outPut['status']    = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
            outPut['upload_index']   = document.upload_index;
            outPut['document'] = saved_document;
            res.status(200).json(outPut);

        });

    }

}

module.exports = UploadController;