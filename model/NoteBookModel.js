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



mongoose.model('NoteBook',NoteBookSchema);