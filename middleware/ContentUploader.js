/**
 * Image uploader middle ware class will handle impage uploading operations
 */
var ContentUploader ={

    s3:null,
    PROFILE_IMAGE:"profile",
    PROFILE_COVER_IMAGE:"cover_image",
    POST_IMAGE:"posts",
    TEMP_UPLOAD:"temp:",
    /**
     * Initialize AWS sdk and S3 bucket service
     */
    init:function(){
        var aws = require('aws-sdk');
        aws.config.update({accessKeyId: Config.AWS_KEY, secretAccessKey: Config.AWS_SECRET});
        this.s3 = new aws.S3();
        console.log("S3 SDN CONNECT...")
    },

    /**
     * Get Profile Image upload path
     * Upload path will prepare based on the function implementation
     * @param section
     * @returns {string}
     */
    getUploadPath:function(section){
        return Config.CDN_BUCKET_NAME + Config.CDN_UPLOAD_PATH + section;
    },

    /**
     * Upload Image to the S3 bucket
     * @param source
     * @param section
     * @param callBack
     */
    uploadFile:function(payLoad,callBack){

        var _async = require('async'),
            Upload = require('mongoose').model('Upload'),
            _this = this;

        _async.waterfall([
            function uploadFile(callBack){

                _this.uploadToCDN(payLoad,function(cdnReturn){
                    if(cdnReturn.status == 200){
                        callBack(null,cdnReturn);
                    }else{
                        callBack(null,null);
                    }

                });
            },
            function saveOnDb(cdnReturn,callBack){
                if(cdnReturn != null && cdnReturn.status == 200){
                    Upload.saveOnDb(cdnReturn.upload_meta,function(dbResultSet){

                        callBack(null,cdnReturn.upload_meta);
                    });
                }else{
                    callBack(null,null);
                }

            }
        ],function(err,resultSet){

            if(resultSet != null){
                console.log(resultSet)
                callBack(resultSet)
            }else{
                callBack(resultSet)
            }

        });


    },

    /**
     * Upload Files to S3 bucket
     *
     * @param payLoad.entity_id
     * @param payLoad.entity_tag
     * @param payLoad.content_title
     * @param payLoad.is_default
     * @param callBack
     */
    uploadToCDN:function(payLoad,callBack){

        var binaryData = Util.decodeBase64Image(payLoad.file_name),
            uuid = require('node-uuid');

        var newFileName = uuid.v1() + "_"+payLoad.entity_tag+ binaryData.extension,
            file_id = uuid.v1();


        var _http_url = Config.CDN_URL+Config.CDN_UPLOAD_PATH+payLoad.entity_id+"/"+newFileName;

        this.s3.putObject({
            Bucket: this.getUploadPath(payLoad.entity_id),
            Key: newFileName,
            Body: binaryData.data,
            ACL: 'public-read'

        }, function (err, data) {
            if (!err) {
                var _upload_meta = {
                    entity_id:payLoad.entity_id,
                    entity_tag:payLoad.entity_tag,
                    upload_index:payLoad.upload_index,
                    file_id:file_id,
                    file_name: newFileName,
                    file_type: binaryData.type,
                    is_default:payLoad.is_default,
                    content_title:payLoad.content_title,
                    http_url:_http_url,

                }
                callBack({status:200,upload_meta:_upload_meta});
                return 0;
            }else{
                console.log("UPLOAD ERROR")
                console.log(err)
                callBack({status:400,error:err});
                return 0;
            }
        });
    },

    /**
     * Upload Profile Image
     * @param source
     * @param callBack
     */
    uploadProfileImage:function(payLoad,callBack){
        var _async = require('async'),
            Upload = require('mongoose').model('Upload'),
            _this = this;

        _async.waterfall([
            function uploadFile(callBack){

                _this.uploadToCDN(payLoad,function(cdnReturn){
                    if(cdnReturn.status == 200){
                        callBack(null,cdnReturn);
                    }else{
                        callBack(null,null);
                    }

                });
            },
            function saveOnDbWithDefaultContent(cdnReturn,callBack){
                if(cdnReturn != null && cdnReturn.status == 200){
                    Upload.saveOnDbWithDefaultContent(cdnReturn.upload_meta,function(dbResultSet){

                        callBack(null,cdnReturn.upload_meta);
                    });
                }else{
                    callBack(null,null);
                }

            }
        ],function(err,resultSet){

            if(resultSet != null){
                console.log(resultSet)
                callBack(resultSet)
            }else{
                callBack(resultSet)
            }

        });


    },


    /**
     * Upload File temporary with caching cluster. this is get file content to CDN before add to the
     * relevant entity and its ID
     * This can be video or Image
     * @param payLoad
     * @param callBack
     */
    tempUpload : function(payLoad,callBack){
        var _async = require('async'),
            Upload = require('mongoose').model('Upload'),
            _this = this;

        _async.waterfall([
            function uploadFile(callBack){

                _this.uploadToCDN(payLoad,function(cdnReturn){
                    if(cdnReturn.status == 200){
                        callBack(null,cdnReturn);
                    }else{
                        callBack(null,null);
                    }

                });
            },
            function saveCache(cdnReturn,callBack){
                if(cdnReturn != null && cdnReturn.status == 200){

                    var _cacheKey = payLoad.entity_tag+payLoad.entity_id;
                    //console.log(_cacheKey)
                    if(cdnReturn.status ==200){
                        CacheEngine.addBottomToList(_cacheKey,cdnReturn.upload_meta,function(csResultSet){
                            callBack(null,cdnReturn.upload_meta);
                        })
                    }else{
                        callBack(null,null);
                    }

                }else{
                    callBack(null,null);
                }

            }
        ],function(err,resultSet){

            if(resultSet != null){
                callBack(resultSet)
            }else{
                callBack(resultSet)
            }

        });

    },

    /**
     * Get Uploads from temp location
     * @param payLoad
     * @param callBack
     */
    getUploadFromTemp:function(payLoad,callBack){
        var _cacheKey = payLoad.entity_tag+payLoad.entity_id;
        CacheEngine.getList(_cacheKey,0,-1,function(chData){
            callBack(chData.result)
        });
    },



    copyFromTempToDb:function(payLoad,callBack){

        var _async = require('async'),
            Upload = require('mongoose').model('Upload'),
            _this = this,
            upload_data = [];

        this.getUploadFromTemp(payLoad,function(tmpUploads){

            _async.each(tmpUploads,
                function(upload,callBack){


                    var params = {
                        Bucket : _this.getUploadPath(payLoad.post_id),
                        CopySource : _this.getUploadPath(payLoad.entity_id)+"/"+upload.file_name,
                        Key : upload.file_name,
                        ACL : 'public-read',
                    };

                    upload['entity_id'] = Util.toObjectId(payLoad.post_id);

                    _this.s3.copyObject(params, function(err, data) {
                        if (!err)
                            //Add to Database
                            Upload.saveOnDb(upload,function(dbResultSet){
                                var _http_url = Config.CDN_URL+Config.CDN_UPLOAD_PATH+upload.entity_id+"/"+upload.file_name;
                                upload_data.push({
                                    entity_id:upload.entity_id,
                                    file_name:upload.file_name,
                                    file_type:upload.file_type,
                                    http_url:_http_url

                                });
                                callBack();
                            });
                        else {
                            callBack();
                            console.log(err); // successful response
                        }
                    });


                },
                function(err){
                    callBack(upload_data)
                }
            )

        });

    }



}
module.exports = ContentUploader;