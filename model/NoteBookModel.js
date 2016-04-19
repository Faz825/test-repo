/**
 * This is Notebook model
 */


'use strict';
var  mongoose = require('mongoose'),
    Schema   = mongoose.Schema,
    uuid = require('node-uuid');


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
 * Get Notebooks
 */
NoteBookSchema.statics.getNotebooks = function(criteria,callBack){

    var _this = this;

    _this.find(criteria).sort({isDefault:-1}).exec(function(err,resultSet){
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



mongoose.model('NoteBook',NoteBookSchema);