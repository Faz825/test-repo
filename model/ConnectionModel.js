/**
 * This is connection module that handle connections
 */

'use strict'
var  mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var ConnectionSchema = new Schema({
    user_id:{
        type: Schema.ObjectId,
        default:null
    },
    connected_with:{
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

},{collection:"connections"});

ConnectionSchema.statics.connect=function(data,callBack){


    this.collection.insert(data,function(err,resultSet){
        if(! err){
            callBack({status:200,
                connected:resultSet.result.ok});
        }else{
            console.log("Server Error --------");
            console.log(err);
            callBack({status:400,error:err});
        }

    });

}

function onInsert(err,resultSet,callBack){

    callBack(resultSet)

}
ConnectionSchema.pre('save', function(next){
    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }
    next();
});
mongoose.model('Connection',ConnectionSchema);