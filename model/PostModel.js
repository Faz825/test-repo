/**
 * This is post model that allows to handle all the Operations .
 */
'use strict'
var  mongoose = require('mongoose'),
     Schema   = mongoose.Schema,
     uuid = require('node-uuid');


var PostSchema = new Schema({
    has_attachment:{
        type:Boolean,
        default:false
    },
    body:{
        type:String,
        trim:true
    },
    created_by:{
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
},{collection:'posts'});



PostSchema.pre('save', function(next){
    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }
    next();
});

PostSchema.statics.create = function(post,callBack){
    var _post = new this();
    _post = post;

    _post.save(function(err,resultSet){
        if(!err){
            callBack({
                status:200,
                user:{
                    post_id:resultSet._id,
                    body:uuid.v1(),
                    first_name:resultSet.first_name,
                    last_name:resultSet.last_name,
                    email:resultSet.email,
                    status:resultSet.status,
                    user_name:resultSet.user_name
                }

            });
        }else{
            console.log("Server Error --------")
            console.log(err)
            callBack({status:400,error:err});
        }

    })

}
mongoose.model('Post',PostSchema);