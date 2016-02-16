/**
 * Image uploader middle ware class will handle impage uploading operations
 */
var ContentUploader ={

    s3:null,
    PROFILE_IMAGE:"profile",
    PROFILE_COVER_IMAGE:"profile",
    POST_IMAGE:"posts",
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

    uploadToCDN:function(payLoad,callBack){

        var binaryData = Util.decodeBase64Image(payLoad.file_name),
            uuid = require('node-uuid');

        var newFileName = uuid.v1() + "_"+payLoad.entity_tag+ binaryData.extension;

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
                    file_name: newFileName,
                    file_type: binaryData.type,
                    is_default:payLoad.is_default,
                    content_title:payLoad.content_title,
                    http_url:_http_url
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
    uploadProfileImage:function(source,section,callBack){
        this.uploadImage(source,section,function(payLoad){
            callBack(payLoad);
        });

    }



}
module.exports = ContentUploader;