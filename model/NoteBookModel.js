/**
 * This is Notebook model
 */


'use strict';
var  mongoose = require('mongoose'),
    Schema   = mongoose.Schema,
    uuid = require('node-uuid');

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
 * Share Notebook
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
 * Get Notebooks
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
            console.log(resultSet);
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



mongoose.model('NoteBook',NoteBookSchema);
