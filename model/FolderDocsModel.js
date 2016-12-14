/**
 * This is Documents Model
 */


'use strict';
var mongoose = require('mongoose'),
    Schema   = mongoose.Schema,
    uuid = require('node-uuid');

GLOBAL.FolderDocsConfig = {
    ES_INDEX_SHARED_DOC :"shared_docs:",
    ES_INDEX_OWN_DOC : "own_docs:"
};


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
 * Add folder to CACHE
 */
FolderDocsSchema.statics.addDocToCache = function(data, callBack){

    console.log("addDocToCache");
    console.log(data);

    var _esDocument = {
        document_id:data.document_id,
        document_name:data.document_name,
        content_type:data.content_type,
        document_owner:data.document_owner,
        file_path:data.file_path,
        thumb_path:data.thumb_path,
        folder_id:data.folder_id,
        folder_name:data.folder_name
        //folder_color:data.folder_color,
        //folder_owner:data.folder_owner,
        //folder_updated_at:data.folder_updated_at,
        //folder_shared_mode:data.folder_shared_mode
    };
    var _type = "";

    if(data.document_owner == data.document_user){
        _type = "own_document"
    } else{
        _type = "shared_document"
    }

    var payLoad={
        index:data.cache_key,
        id:data.document_id.toString(),
        type: _type,
        data:_esDocument,
        tag_fields:['document_name']
    }

    ES.createIndex(payLoad,function(resultSet){

        console.log("addDocToCache - ES.createIndex return");
        console.log(resultSet)
        callBack(resultSet)
        return 0;
    });
}


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


/**
 * Delete Document From Cache based on document Id
 * @param payload
 * @param callBack
 */
FolderDocsSchema.statics.deleteDocumentFromCache= function(payload,callBack){

    var query={
        id:payload.id,
        type: payload.type,
        index:payload.cache_key
    };

    ES.delete(query,function(csResultSet){
        callBack(null);
    });

};

/**
 * delete document
 * @param likes
 * @param callBack
 */
FolderDocsSchema.statics.deleteDocument = function(criteria,callBack){
    this.remove(criteria).exec(function(err,resultSet){

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


mongoose.model('FolderDocs',FolderDocsSchema);