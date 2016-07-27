/**
 * Image uploader middle ware class will handle impage uploading operations
 */
var ContentUploader ={

    s3:null,
    PROFILE_IMAGE:"profile",
    PROFILE_COVER_IMAGE:"cover_image",
    POST_IMAGE:"posts",
    TEMP_UPLOAD:"temp:",
    io:null,
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
        console.log("uploadToCDN")

        var binaryData = Util.decodeBase64Image(payLoad.file_name),
            uuid = require('node-uuid');

        var newFileName = uuid.v1() + "_"+payLoad.entity_tag+ binaryData.extension,
            file_id = uuid.v1();


        var _http_url = Config.CDN_URL+Config.CDN_UPLOAD_PATH+payLoad.entity_id+"/"+newFileName;console.log(_http_url)

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
                    http_url:_http_url
                };
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
        console.log("tempUpload")
        var _async = require('async'),
            Upload = require('mongoose').model('Upload'),
            _this = this;

        _async.waterfall([
            function uploadFile(callBack){
                console.log("uploadFile")

                _this.uploadToCDN(payLoad,function(cdnReturn){
                    if(cdnReturn.status == 200){
                        callBack(null,cdnReturn);
                    }else{
                        callBack(null,null);
                    }

                });
            },
            function saveCache(cdnReturn,callBack){
                console.log("saveCache")
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

    },

    deleteFromCDN:function(payload, callback){
        console.log("deleteFromCDN")

        var deleteParam = {
            Bucket: Config.CDN_BUCKET_NAME.slice(0,-1), //this.getUploadPath(payload.entity_id),
            Key: Config.CDN_UPLOAD_PATH+payload.entity_id+"/"+payload.file_name
        };
        console.log(deleteParam)
        this.s3.deleteObject(deleteParam, function(err, data) {
            if (err){
                console.log(err);
                callback(err)
            }
            else {
                console.log('delete', data);
                callback(null);
            }
        });



        //callback();

    },


    /**
     * Upload File temporary with caching cluster. this is get file content to CDN before add to the
     * relevant entity and its ID
     * This can be video or Image
     * @param payLoad
     * @param callBack
     */
    tempVideoUpload : function(payLoad,callBack){
        console.log("tempVideoUpload")
        var _async = require('async'),
            Upload = require('mongoose').model('Upload'),
            _this = this;

        console.log("payLoad ===> ")
        console.log(payLoad)

        _async.waterfall([
            function uploadFile(callBack){
                console.log("uploadFile")

                _this.uploadVideoToCDN(payLoad,function(cdnReturn){
                    if(cdnReturn.status == 200){
                        callBack(null,cdnReturn);
                    }else{
                        callBack(null,null);
                    }

                });
            },
            function saveCache(cdnReturn,callBack){
                console.log("saveCache")
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
     * Upload Files to S3 bucket
     *
     * @param payLoad.entity_id
     * @param payLoad.entity_tag
     * @param payLoad.content_title
     * @param payLoad.is_default
     * @param callBack
     */
    uploadVideoToCDN:function(payLoad,callBack){

        console.log("uploadVideoToCDN")

        var uuid = require('node-uuid');
        var fs = require('fs');

        var name = payLoad.file_name;console.log(name)
        var arr = name.split(".");
        var type = arr[arr.length-1];console.log(type);
        //var nameWithoutEx = "";
        //for(var i=0; i<arr.length-1;i++){
        //    nameWithoutEx += arr[i];
        //}

        var newFileName = uuid.v1() + "_"+payLoad.entity_tag+"."+type,
            file_id = uuid.v1(),
            videoBody = fs.createReadStream('temp/'+payLoad.file_name);console.log(videoBody)


        var _http_url = Config.CDN_URL+Config.CDN_UPLOAD_PATH+payLoad.entity_id+"/"+newFileName;console.log(_http_url)

        this.s3.putObject({
            Bucket: this.getUploadPath(payLoad.entity_id),
            Key: newFileName,
            Body: videoBody,
            ACL: 'public-read'

        }, function (err, data) {
            console.log("here");
            if (!err) {
                var _upload_meta = {
                    entity_id:payLoad.entity_id,
                    entity_tag:payLoad.entity_tag,
                    upload_index:payLoad.upload_index,
                    file_id:file_id,
                    file_name: newFileName,
                    file_type: type,
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


    initSocket:function(io){

        var fs = require('fs');
        this.io = io;
        this.io.sockets.on('connection', function (socket) {

            var files = {};

            socket.on('start', function (data) { //data contains the variables that we passed through in the html file

                var name = data['name'];
                name = name.trim().replace(/\s/g, '');
                files[name] = {  //Create a new Entry in The Files Variable
                    fileSize : data['size'],
                    data     : "",
                    downloaded : 0,
                    upload_id: data['data']['upload_id'],
                    upload_index: data['data']['upload_index']
                };
                var place = 0;
                try{
                    var stat = fs.statSync('temp/' +  name);
                    if(stat.isFile())
                    {
                        files[name]['downloaded'] = stat.size;
                        place = stat.size / 524288;
                    }
                }
                catch(er){} //It's a New File
                fs.open("temp/" + name, "a", '0755', function(err, fd){
                    if(err)
                    {
                        console.log(err);
                    }
                    else
                    {
                        files[name]['handler'] = fd; //We store the file handler so we can write to it later
                        socket.emit('more_data', { place : place, percent : 0 });
                    }
                });
            });

            socket.on('upload', function (data){

                var name = data['name'];
                name = name.trim().replace(/\s/g, '');
                files[name]['downloaded'] += data['data'].length;
                files[name]['data'] += data['data'];

                if(files[name]['downloaded'] == files[name]['fileSize']) //If File is Fully Uploaded
                {
                    fs.write(files[name]['handler'], files[name]['data'], null, 'Binary', function(err, Writen){
                        var uuid = require('node-uuid');
                        var ffmpeg = require('ffmpeg');
                        var _async = require('async');

                        var arr = name.split(".");
                        var type = arr[arr.length-1];console.log(type);
                        var nameWithoutEx = "";
                        for(var i=0; i<arr.length-1;i++){
                            nameWithoutEx += arr[i];
                        }
                        var finalData = {};

                        _async.waterfall([

                            function convertVideo(callback){
                                console.log("convertVideo")
                                try {

                                    var process = new ffmpeg('temp/'+name);
                                    process.then(function (video) {
                                        //Get Thumbnail Here
                                        video.fnExtractFrameToJPG('temp/', {
                                            frame_rate : 1,
                                            number : 1,
                                            file_name : name
                                        }, function (error, files) {
                                            if (!error)
                                                console.log('Frames: ' + files);
                                            console.log(error)
                                        });
                                        if(type != "mp4"){
                                            video.setVideoFormat('mp4').save('temp/'+nameWithoutEx+'.mp4');
                                        }

                                    }, function (err) {
                                        console.log('Error: ' + err);
                                    });
                                } catch (e) {
                                    console.log("catch");
                                    console.log(e.code);
                                    console.log(e.msg);
                                } finally{
                                    callback(null);
                                }
                            },
                            function uploadVideoToCDN(callback){
                                //Upload video to CDN
                                console.log("uploadVideoToCDN")

                                var data ={
                                    content_title:"Post Video",
                                    file_name:nameWithoutEx+'.mp4',
                                    entity_id:files[name]['upload_id'],
                                    entity_tag:UploadMeta.TIME_LINE_VIDEO,
                                    upload_index:files[name]['upload_index']
                                };
                                ContentUploader.tempVideoUpload(data,function(resultSet){
                                    finalData['video_upload'] = resultSet;
                                    callback(null)
                                });
                                callback(null)
                            },
                            function uploadThumbnailToCDN(callback){
                                //Upload Thumbnail image to CDN
                                console.log("uploadThumbnailToCDN")
                                var data ={
                                    content_title:"Post Video Thumbnail Image",
                                    file_name:nameWithoutEx+'_1.jpg',
                                    entity_id:files[name]['upload_id'],
                                    entity_tag:UploadMeta.TIME_LINE_VIDEO_IMAGE,
                                    upload_index:files[name]['upload_index']
                                };

                                ContentUploader.tempVideoUpload(data,function(resultSet){
                                    finalData['thumb_image_upload'] = resultSet;
                                    callback(null)
                                });
                            }

                        ],function(err){
                            socket.emit('finished', finalData);
                        });
                    });
                }
                else if(files[name]['data'].length > 10485760){ //If the Data Buffer reaches 10MB

                    fs.write(files[name]['handler'], files[name]['data'], null, 'Binary', function(err, Writen){
                        files[name]['data'] = ""; //Reset The Buffer
                        var place = files[name]['downloaded'] / 524288;
                        var percent = (files[name]['downloaded'] / files[name]['fileSize']) * 100;
                        socket.emit('more_data', { place : place, percent :  percent});
                    });
                }
                else
                {
                    var place = files[name]['downloaded'] / 524288;
                    var percent = (files[name]['downloaded'] / files[name]['fileSize']) * 100;
                    socket.emit('more_data', { place : place, percent :  percent});
                }
            });

        });
    }





}
module.exports = ContentUploader;