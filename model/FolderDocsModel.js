/**
 * This is Documents Model
 */


'use strict';
var  mongoose = require('mongoose'),
    Schema   = mongoose.Schema,
    uuid = require('node-uuid');


var FolderDocsSchema = new Schema({
    name:{
        type:String,
        trim:true
    },
    content_type:{
        type:String,
        trim:true
    },
    user_id:{
        type: Schema.ObjectId,
        ref: 'User',
        default:null
    },
    folder_id:{
        type: Schema.ObjectId,
        ref: 'Folders',
        default:null
    },
    file_path:{
        type:String,
        trim:true,
        default:null
    },
    thumb_path:{
        type:String,
        trim:true,
        default:null
    },
    created_at:{
        type:Date
    },
    updated_at:{
        type:Date
    }

},{collection:"folder_docs"});


FolderDocsSchema.pre('save', function(next){
    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }
    next();
});


/**
 * Create Document
 */
FolderDocsSchema.statics.addNewDocument = function(DocumentData,callBack){

    var newDocument = new this();
    newDocument.name 	        = DocumentData.name;
    newDocument.content_type  	= DocumentData.content_type;
    newDocument.user_id		    = DocumentData.user_id;
    newDocument.folder_id		= DocumentData.folder_id;
    newDocument.file_path		= DocumentData.file_path;
    newDocument.thumb_path		= DocumentData.thumb_path;

    newDocument.save(function(err,resultSet){

        if(!err){
            callBack({
                status:200,
                document:resultSet
            });
        }else{
            console.log("Server Error --------")
            console.log(err)
            callBack({status:400,error:err});
        }

    });

};


/**
 * Get Documents
 */
FolderDocsSchema.statics.getDocuments = function(criteria,callBack){
    var _this = this;

    _this.find(criteria).sort({created_at:-1}).exec(function(err,resultSet){
        if(!err){
            callBack({
                status:200,
                documents:resultSet
            });
        }else{
            console.log("Server Error --------")
            callBack({status:400,error:err});
        }
    })

};


/**
 * Get Document
 */
FolderDocsSchema.statics.getDocument = function(criteria,callBack){
    var _this = this;
    _this.findOne(criteria).exec(function(err,resultSet){
        if(!err){
            callBack({
                status:200,
                document:resultSet
            });
        }else{
            console.log("Server Error --------")
            callBack({status:400,error:err});
        }
    })

};

/**
 * Get Folder Document
 */
FolderDocsSchema.statics.getFolderDocument = function(criteria,callBack){
    var _this = this;
    _this.find(criteria).exec(function(err,resultSet){
        if(!err){
            callBack({
                status:200,
                document:resultSet
            });
        }else{
            console.log("Server Error --------")
            callBack({status:400,error:err});
        }
    })

};

mongoose.model('FolderDocs',FolderDocsSchema);