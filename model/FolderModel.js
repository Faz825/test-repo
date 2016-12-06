/**
 * Folder model
 */


'use strict';
var mongoose = require('mongoose'),
    Schema   = mongoose.Schema,
    uuid = require('node-uuid');

GLOBAL.FolderConfig = {
    ES_INDEX_SHARED_FOLDER :"shared_folders:",
    ES_INDEX_OWN_FOLDER : "own_folders:"
};
GLOBAL.FolderSharedMode = {
    VIEW_ONLY: 1,
    VIEW_UPLOAD: 2
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
 * Get folder count based on criteria
 * @param criteria
 * @param callBack
 */
FolderSchema.statics.getCount = function(criteria,callBack){

    this.count(criteria).exec(function(err,resultSet){

        if(!err){
            callBack({
                status:200,
                result:resultSet
            });
        }else{
            console.log("Server Error --------")
            console.log(err)
            callBack({status:400,error:err});
        }

    })

};

/**
 * Create New Folder to DB
 */
FolderSchema.statics.addNewFolder = function(_data,callBack){

    console.log("addNewFolder");
    //console.log(FolderConfig.ES_INDEX_OWN_FOLDER);

    var _this = this;
    var _folder = new this();
    _folder.name 	= _data.name;
    _folder.color  	= _data.color;
    _folder.isDefault  	= _data.isDefault;
    _folder.user_id		= _data.user_id;
    _folder.shared_users = _data.shared_users;

    _folder.save(function(err,resultSet){

        if(!err){

            var _esFolder = {
                cache_key:FolderConfig.ES_INDEX_OWN_FOLDER+resultSet.user_id.toString(),
                folder_id:resultSet._id,
                folder_name:resultSet.name,
                folder_color:resultSet.color,
                folder_owner:resultSet.user_id,
                folder_user:resultSet.user_id,
                folder_updated_at:resultSet.updated_at,
                folder_shared_mode:FolderSharedMode.VIEW_UPLOAD
            };

            _this.addFolderToCache(_esFolder, function(err){
                console.log("_this.addFolderToCache ==========");
                console.log(err)
                callBack({
                    status:200,
                    folder:resultSet
                });
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

    console.log("addFolderToCache");
    console.log(data);

    var _esFolder = {
        folder_id:data.folder_id,
        folder_name:data.folder_name,
        folder_color:data.folder_color,
        folder_owner:data.folder_owner,
        folder_updated_at:data.folder_updated_at,
        folder_shared_mode:data.folder_shared_mode
    };
    var _type = "";

    if(data.folder_owner == data.folder_user){
        _type = "own_folder"
    } else{
        _type = "shared_folder"
    }

    var payLoad={
        index:data.cache_key,
        id:data.folder_id.toString(),
        type: _type,
        data:_esFolder,
        tag_fields:['folder_name']
    }

    ES.createIndex(payLoad,function(resultSet){

        console.log("addFolderToCache - ES.createIndex return");
        console.log(resultSet)
        callBack(resultSet)
        return 0;
    });
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
 * Get Folders
 */
FolderSchema.statics.getSharedFolders = function(index,callBack){

    var query={
        index:index
    };
    ES.search(query,function(esResultSet){
        //console.log(esResultSet)
        if(esResultSet == null || typeof esResultSet.result[0] == "undefined"){
            callBack({status:400,folders:[]});
        }else{
            callBack({status:200, folders:esResultSet.result});
        }
    });

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
 * Remove Shared user | DB
 */
FolderSchema.statics.removeSharedUser = function(folderId,sharedCriteria,callBack){

    var _this = this;

    _this.update({_id:folderId},
        { $pull: sharedCriteria},function(err,resultSet){
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
 * Update Shared folder
 * @param criteria
 * @param data
 * @param callBack
 */
FolderSchema.statics.updateSharedFolder = function(criteria, data, callBack){

    var _this = this;

    _this.update(criteria, data, {multi:true}, function(err,resultSet){
        if(!err){
            callBack({
                status:200
            });
        }else{
            console.log("Server Error --------")
            console.log(err)
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
