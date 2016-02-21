/**
 * Upload module handle all upload related operation with the database.
 **/
'use strict'


GLOBAL.UploadMeta ={
    PROFILE_IMAGE:"profile_image",
    COVER_IMAGE:"cover_image",

    TIME_LINE_IMAGE:"time_line_image",
    TIME_LINE_VIDEO:"post_video",



}




var  mongoose = require('mongoose'),
    Schema   = mongoose.Schema ;




var ContentSchema = Schema({
    file_name:{
        type:String,//physical file name
        trim:true
    },
    file_type:{
        type:String,//image/jpg,image/png
        trim:true,
        default:null
    },
    is_default:{
        type:Number,
        default:0
    }
});



var UploadSchema = new Schema({
    entity_id:{
        type: Schema.ObjectId, //Exact document id
        default:null
    },
    title:{
        type:String, //Upload title i.e Profile Image,Post Images
        trim:true
    },
    entity_tag:{
        type:String, //profile_image,post_image,post_video
        trim:true
    },
    created_at:{
        type:Date
    },
    updated_at:{
        type:Date
    },
    contents:[ContentSchema],
},{collection:"uploads"});


var Content = mongoose.model('Content',ContentSchema);

UploadSchema.pre('update', function(next){

    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }


    next();
});


/**
 * Create new upload record in data based on the upload type
 * with in this function, new upload document  will create for new user.
 * also with in this function new content record will create
 * @param userId
 * @param data
 * @param callBack
 */
UploadSchema.statics.saveOnDb= function(payLoad,callBack){
    var _upload = this,
        content = new Content();




    content.file_name    = payLoad.file_name;
    content.file_type    = payLoad.file_type;
    content.is_default      = payLoad.is_default;
    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }
    _upload.update({
            entity_id:payLoad.entity_id,
            entity_tag:payLoad.entity_tag
        },
        {
            $set:{
                title:payLoad.content_title,
                created_at:this.created_at,
                updated_at:this.updated_at
            },
            $push : {
                "contents":content
            }
        },
        {multi:false,upsert:true},function(err,resultSet){
            if(!err){
                callBack({
                    status:200,
                    image:resultSet

                });
            }else{
                console.log("Server Error --------")
                callBack({status:400,error:err});
            }

        });

}
/**
 * Get Profile image and Cover image
 * @param userId
 * @param callBack
 */
UploadSchema.statics.getProfileImage=function(userId,callBack){
    console.log(userId)

    this.aggregate([
        {$match:
            {
                entity_id:userId.toObjectId(),
                entity_tag:{ $in: [UploadMeta.COVER_IMAGE,UploadMeta.PROFILE_IMAGE]}
            }
        },
        {$unwind:"$contents"},
        {$match:
            {"contents.is_default":1}}  ,
            {$project:{
                    "entity_id" :1,"entity_tag":1,"contents":1}},
        {
            $group:{
                _id:"$_id",
                entity_tag:{"$first":"$entity_tag"},
                contents:{"$first":"$contents"}
            }
        }
    ],function(err,resultSet){
        if(!err && resultSet.length > 0){
            var _image ={};
            for(var i=0;i<resultSet.length;i++){
                var _tmp_rs = resultSet[i],
                    _http_url = Config.CDN_URL+Config.CDN_UPLOAD_PATH+userId+"/"+_tmp_rs.contents.file_name;
                _image[_tmp_rs['entity_tag']] ={
                    entity_id:_tmp_rs._id,
                    file_name:_tmp_rs.contents.file_name,
                    file_type:_tmp_rs.contents.file_type,
                    http_url:_http_url
                }
            }
            callBack({
                status:200,
                image:_image

            });
        }else{
            console.log("Server Error --------")
            callBack({status:400,error:err});
        }
    });
}






String.prototype.toObjectId = function() {
    var ObjectId = (require('mongoose').Types.ObjectId);
    return new ObjectId(this.toString());
};

mongoose.model('Upload',UploadSchema);