/**
 * Folder model
 */


'use strict';
var  mongoose = require('mongoose'),
    Schema   = mongoose.Schema,
    uuid = require('node-uuid');

GLOBAL.FolderConfig={
    CACHE_PREFIX :"shared_folders:"
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

    _folder.save(function(err,resultSet){

        if(!err){
            callBack({
                status:200,
                notebook:resultSet
            });
        }else{
            console.log("Folder Save Error --------")
            console.log(err)
            callBack({status:400,error:err});
        }

    });

};


/**
 * Get Folders
 */
FolderSchema.statics.getFolders = function(criteria,callBack){

    var _this = this;

    _this.find(criteria).sort({created_at:-1}).exec(function(err,resultSet){
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


mongoose.model('Folders',FolderSchema);
