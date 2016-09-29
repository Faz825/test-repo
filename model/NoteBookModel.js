/**
 * This is Notebook model
 */


'use strict';
var  mongoose = require('mongoose'),
    Schema   = mongoose.Schema,
    uuid = require('node-uuid');

GLOBAL.NoteBookConfig={
    CACHE_PREFIX :"shared_notebooks:"
};
GLOBAL.NoteBookSharedMode = {
    READ_ONLY: 1,
    READ_WRITE: 2
};
GLOBAL.NoteBookSharedRequest = {
    REQUEST_PENDING: 1,
    REQUEST_REJECTED: 2,
    REQUEST_ACCEPTED: 3
};


var NoteBookSchema = new Schema({
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

},{collection:"notebooks"});


NoteBookSchema.pre('save', function(next){
    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }
    next();
});

/**
 * Create Notebook
 */
NoteBookSchema.statics.addNewNoteBook = function(NotebookData,callBack){

    var newNotebook = new this();
    newNotebook.name 	= NotebookData.name;
    newNotebook.color  	= NotebookData.color;
    newNotebook.isDefault  	= NotebookData.isDefault;
    newNotebook.user_id		= NotebookData.user_id;

    newNotebook.save(function(err,resultSet){

        if(!err){
            callBack({
                status:200,
                notebook:resultSet
            });
        }else{
            console.log("Server Error --------")
            console.log(err)
            callBack({status:400,error:err});
        }

    });

};

/**
 * Share Notebook | Cache based on User
 * {Create Index}
 */
NoteBookSchema.statics.ch_shareNoteBookCreateIndex = function(userId,data,callBack){

    var _cache_key = "idx_user:"+NoteBookConfig.CACHE_PREFIX+userId;
    var payLoad={
        index:_cache_key,
        id:data.user_id.toString(),
        type: 'shared_notebooks',
        data:data
    }

    ES.createIndex(payLoad,function(resultSet){
        callBack(resultSet)
    });

};

/**
 * Share Notebook | Cache based on User
 * {Update Notebook List}
 */
NoteBookSchema.statics.ch_shareNoteBookUpdateIndex = function(userId,data,callBack){

    var _cache_key = "idx_user:"+NoteBookConfig.CACHE_PREFIX+userId;
    var payLoad={
        index:_cache_key,
        id:data.user_id.toString(),
        type: 'shared_notebooks',
        data:data
    }

    ES.update(payLoad,function(resultSet){
        callBack(resultSet)
    });

};

/**
 * Share Notebook | DB
 */
NoteBookSchema.statics.shareNoteBook = function(noteBookId,sharedCriteria,callBack){

    var _this = this;
    _this.update({_id:noteBookId},
        {$set:sharedCriteria},function(err,resultSet){

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
 * Get Notebook | Get shared notebook to user
 */
NoteBookSchema.statics.ch_getSharedNoteBooks = function(userId,payload,callBack){

    var _this = this;
    var _cache_key = "idx_user:"+NoteBookConfig.CACHE_PREFIX+userId;

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
 * Get Notebooks | DB
 */
NoteBookSchema.statics.getNotebooks = function(criteria,callBack){

    var _this = this;

    _this.find(criteria).sort({created_at:-1}).exec(function(err,resultSet){
        if(!err){
            callBack({
                status:200,
                notebooks:resultSet
            });
        }else{
            console.log("Server Error --------")
            callBack({status:400,error:err});
        }
    })

};

/**
 * Get Notebook By Id
 */
NoteBookSchema.statics.getNotebookById = function(id,callBack){

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
 * Update Shared Notebook
 * @param criteria
 * @param data
 * @param callBack
 */
NoteBookSchema.statics.updateSharedNotebook = function(criteria, data, callBack){

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
 * Update Shared Notebook Status on Unfriend
 * @param criteria
 * @param data
 * @param callBack
 */
NoteBookSchema.statics.sharedNotebookOnUnfriend = function(payLoad, callBack){

    var _async = require('async'), _this = this;

    _async.waterfall([

        function isESIndexExists(callBack){
            var _cache_key = "idx_user:"+NoteBookConfig.CACHE_PREFIX+payLoad.user_id.toString();
            var query={
                index:_cache_key,
                id:payLoad.user_id.toString(),
                type: 'shared_notebooks',
            };
            ES.isIndexExists(query, function (esResultSet){
                callBack(null, esResultSet);
            });
        },
        function getESSharedNotebookList(resultSet, callBack) {
            if(resultSet) {
                var query = {
                    q: "_id:" + payLoad.user_id.toString()
                };
                _this.ch_getSharedNoteBooks(payLoad.user_id, query, function (esResultSet) {
                    var notebook_list = null;
                    if(esResultSet != null) {
                        notebook_list = esResultSet.result[0].notebooks;
                    }

                    callBack(null, notebook_list);
                });
            }else{
                callBack(null, null);
            }
        },
        function getDBSharedNotebookList(resultSet, callBack){
            var criteria = {
                user_id:Util.toObjectId(payLoad.sender_id),
                'shared_users.user_id':payLoad.user_id
            };

            _this.getNotebooks(criteria, function(dbResultSet){
                callBack(null, {
                    esNotebookList: resultSet,
                    dbNotebookList: dbResultSet.notebooks
                });
            });
        },
        function spliceEsList(resultSet, callBack){
            var esNotebookList = resultSet.esNotebookList,
                dbNotebookList = resultSet.dbNotebookList,
                dbRemovingList = [];

            console.log(esNotebookList);

            for(var inc = 0; inc < dbNotebookList.length; inc++){
                var index = esNotebookList.indexOf(dbNotebookList[inc]._id.toString());

                console.log('index captured for '+ dbNotebookList[inc].name + ' '+ dbNotebookList[inc]._id +' index '+ index+' es id '+ esNotebookList[index]);

                if(index != -1) {
                    dbRemovingList.push(esNotebookList[inc]);
                    esNotebookList.splice(index, 1);
                }
            }

            var query={
                    q:"user_id:"+payLoad.user_id.toString()
                },
                data = {
                    user_id: payLoad.user_id,
                    notebooks: esNotebookList
                };

            _this.ch_shareNoteBookUpdateIndex(payLoad.user_id,data, function(esResultSet){
                callBack(null, dbRemovingList);
            });

        },
        function (resultSet, callBack) {
            var dbNotebookList = resultSet;

            _async.each(dbNotebookList, function(dbNotebook, callBack){

                console.log('deleting... '+ dbNotebook);

                _this.collection.update(
                    { _id: Util.toObjectId(dbNotebook) },
                    { $pull: { 'shared_users': {'user_id': payLoad.user_id} } },
                    { multi: false },function(err,resultSet){
                        callBack(null);
                    });
            },function(err){
                callBack(null);
            });
        }

    ], function (err) {
        callBack({
            status:200
        });
    });

};





mongoose.model('NoteBook',NoteBookSchema);
