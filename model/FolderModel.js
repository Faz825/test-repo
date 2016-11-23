/**
 * Folder model
 */


'use strict';
var  mongoose = require('mongoose'),
    Schema   = mongoose.Schema,
    uuid = require('node-uuid');

GLOBAL.FolderConfig={
    CACHE_PREFIX :"shared_folders:",
    ES_INDEX_NAME:"idx_folders:"
};
GLOBAL.FolderSharedMode = {
    READ_ONLY: 1,
    READ_WRITE: 2
};
GLOBAL.FolderSharedRequest = {
    REQUEST_PENDING: 1,
    REQUEST_REJECTED: 2,
    REQUEST_ACCEPTED: 3
};


var FolderSchema = new Schema({
    name:{
        type:String,
        trim:true
    },
    color:{
        type:String,
        trim:true
    },
    isDefault:{
        type:Number,
        default:0
    },
    user_id:{
        type: Schema.ObjectId,
        ref: 'User',
        default:null
    },
    shared_users:[],
    created_at:{
        type:Date
    },
    updated_at:{
        type:Date
    }

},{collection:"folders"});


FolderSchema.pre('save', function(next){
    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }
    next();
});

/**
 * Create New Folder
 */
FolderSchema.statics.addNewFolder = function(_data,callBack){

    var _folder = new this();
    _folder.name 	= _data.name;
    _folder.color  	= _data.color;
    _folder.isDefault  	= _data.isDefault;
    _folder.user_id		= _data.user_id;
    _folder.shared_users = _data.shared_users;

    _folder.save(function(err,resultSet){

        if(!err){
            callBack({
                status:200,
                folder:resultSet
            });
        }else{
            console.log("Folder Save Error --------")
            console.log(err)
            callBack({status:400,error:err});
        }

    });

};


/**
 * Add folder to CACHE
 */
FolderSchema.statics.addFolderToCache = function(data, callBack){
    var _async = require('async'),
        Connection = require('mongoose').model('Connection'),
        Upload = require('mongoose').model('Upload'),
        _this = this;
    _async.waterfall([
        function getUserById(callBack){
            var _search_param = {
                    _id:Util.toObjectId(userId),
                },
                showOptions ={
                    w_exp:false,
                    edu:false
                };

            _this.getUser(_search_param,showOptions,function(resultSet){
                if(resultSet.status ==200 ){
                    callBack(null,resultSet.user)
                }
            })
        },
        function getConnectionCount(profileData,callBack){

            if( profileData!= null){
                Connection.getFriendsCount(profileData.user_id,function(connectionCount){
                    profileData['connection_count'] = connectionCount;
                    callBack(null,profileData);
                    return 0
                });
            }else{
                callBack(null,null)
            }
        },
        function getProfileImage(profileData,callBack){


            Upload.getProfileImage(profileData.user_id.toString(),function(profileImageData){

                if(profileImageData.status != 200){
                    profileData['images'] = {
                        'profile_image': {
                            id: "DEFAULT",
                            file_name: "default_profile_image.png",
                            file_type: ".png",
                            http_url: Config.DEFAULT_PROFILE_IMAGE
                        }
                    };
                }else{
                    profileData['images'] = profileImageData.image;

                }


                callBack(null,profileData)
                return 0;
            });

        }

    ],function(err,profileData){
        var outPut ={};
        if(!err){

            outPut['status']    = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
            outPut['profile_data']      = profileData;

            var payLoad={
                index:"idx_usr",
                id:profileData.user_id,
                type: 'user',
                data:profileData,
                tag_fields:['first_name','last_name','email','user_name','country']
            }

            ES.createIndex(payLoad,function(resultSet){
                callBack(resultSet)
                return 0;
            });

        }else{
            callBack(err)
            return 0;
        }
    })
}


/**
 * Get Folders
 */
FolderSchema.statics.getFolders = function(criteria,callBack){

    var _this = this;
    _this.find(criteria).sort({created_at:1}).exec(function(err,resultSet){
        if(!err){
            callBack({
                status:200,
                folders:resultSet
            });
        }else{
            console.log("Server Error while getting folders--------")
            callBack({status:400,error:err});
        }
    })

};


/**
 * Get Folder By Id
 */
FolderSchema.statics.getFolderById = function(id,callBack){

    var _this = this;

    _this.findOne({_id: id}).exec(function (err, resultSet) {
        if (!err) {
            if (resultSet == null) {
                callBack(null);
                return;
            }

            callBack(resultSet);
        } else {
            console.log(err)
            callBack({status: 400, error: err})
        }
    });

};

/**
 * Get Folder | Get shared folder to user
 */
FolderSchema.statics.ch_getSharedFolders = function(userId,payload,callBack){

    var _this = this;
    var _cache_key = "idx_user:"+FolderConfig.CACHE_PREFIX+userId;

    var query={
        q:payload.q,
        index:_cache_key
    };

    //Find User from Elastic search
    ES.search(query,function(csResultSet){
        if(csResultSet == null){
            callBack(null);
        }else{
            callBack(csResultSet);
        }

    });

};


/**
 * This is to update folder
 * @param criteria
 * @param data
 * @param callBack
 */
FolderSchema.statics.updateFolder = function(criteria, data, callBack){

    var _this = this;

    _this.update(criteria, data, {multi:true}, function(err,resultSet){
        if(!err){
            callBack({
                status:200
            });
        }else{
            console.log("Server Error while updating folder--------")
            console.log(err)
            callBack({status:400,error:err});
        }
    });
};

/**
 * Share Folder | DB
 */
FolderSchema.statics.shareFolder = function(folderId,sharedCriteria,callBack){

    var _this = this;
    //_this.update({_id:folderId},
    //    {$set:sharedCriteria},function(err,resultSet){
    //
    //        if(!err){
    //            callBack({
    //                status:200
    //            });
    //        }else{
    //            console.log("Server Error --------")
    //            callBack({status:400,error:err});
    //        }
    //    });

    _this.update({_id:folderId},
        {$push:sharedCriteria},function(err,resultSet){

            if(!err){
                callBack({
                    status:200
                });
            }else{
                console.log("Server Error --------")
                callBack({status:400,error:err});
            }
        });

};


/**
 * This is to get the folder name of given folder_id
 * @param criteria
 * @param data
 * @param callBack
 */
FolderSchema.statics.bindNotificationData = function(notificationObj, callBack){

    this.getFolderById(notificationObj.folder_id,function(folderData){

        notificationObj['folder_name'] = folderData.name;

        callBack(notificationObj);
    });

};

mongoose.model('Folders',FolderSchema);
