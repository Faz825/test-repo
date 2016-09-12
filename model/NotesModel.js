/**
 * This is Notes Model
 */


'use strict';
var  mongoose = require('mongoose'),
    Schema   = mongoose.Schema,
    uuid = require('node-uuid');


var NoteSchema = new Schema({
    name:{
        type:String,
        trim:true
    },
    content:{
        type:String,
        trim:true
    },
    user_id:{
        type: Schema.ObjectId,
        ref: 'User',
        default:null
    },
    notebook_id:{
        type: Schema.ObjectId,
        ref: 'NoteBook',
        default:null
    },
    created_at:{
        type:Date
    },
    updated_at:{
        type:Date
    }

},{collection:"notes"});


NoteSchema.pre('save', function(next){
    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }
    next();
});


/**
 * Create Note
 */
NoteSchema.statics.addNewNote = function(NoteData,callBack){

    var newNote = new this();
    newNote.name 	= NoteData.name;
    newNote.content  	= NoteData.content;
    newNote.user_id		= NoteData.user_id;
    newNote.notebook_id		= NoteData.notebook_id;

    newNote.save(function(err,resultSet){

        if(!err){
            callBack({
                status:200,
                note:resultSet
            });
        }else{
            console.log("Server Error --------")
            console.log(err)
            callBack({status:400,error:err});
        }

    });

};


/**
 * Get Notes
 */
NoteSchema.statics.getNotes = function(criteria,callBack){

    //db.getCollection('notes').aggregate([
    //    {$match:{user_id:ObjectId("5702078a79409fc607b61699")}},
    //    {$group:{_id:"$notebook_id", notes:{$push:"$$ROOT"}}}
    //])

    var _this = this;
    //_this.aggregate([
    //    { $match : criteria },
    //    {$lookup:{
    //        from:"notebooks",
    //        localField:"notebook_id",
    //        foreignField:"_id",
    //        as:"notebookData"
    //    }},
    //    { $unwind: '$notebookData'},
    //    { $group : {"_id":"$notebook_id", notes:{$push:"$$ROOT"}}}
    //], function(err, resultSet){
    //    if(!err){
    //
    //        callBack({
    //            status:200,
    //            notes:resultSet
    //
    //        });
    //    }else {
    //        console.log("Server Error --------")
    //        callBack({status: 400, error: err});
    //    }
    //});

    _this.find(criteria).sort({created_at:-1}).exec(function(err,resultSet){

        console.log(resultSet.name);

        if(!err){
            callBack({
                status:200,
                notes:resultSet
            });
        }else{
            console.log("Server Error --------")
            callBack({status:400,error:err});
        }
    })

};


/**
 * Get Notes
 */
NoteSchema.statics.getNote = function(criteria,callBack){
    var _this = this;
    _this.findOne(criteria).exec(function(err,resultSet){
        if(!err){
            callBack({
                status:200,
                note:resultSet
            });
        }else{
            console.log("Server Error --------")
            callBack({status:400,error:err});
        }
    })

};



/**
 * Update Note
 */
NoteSchema.statics.updateNote = function(criteria,updateData,callBack){

    var _this = this;
    _this.update(criteria,
        {$set:updateData},function(err,resultSet){

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
 * Delete Note
 */
NoteSchema.statics.deleteNote = function(criteria,callBack){

    var _this = this;

    _this.findOneAndRemove(criteria,function(err,resultSet){
        if(!err){
            callBack({status:200});
        }else{
            console.log("Server Error --------")
            callBack({status:400,error:err});
        }
    });

};




mongoose.model('Notes',NoteSchema);