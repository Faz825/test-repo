/**
 * Folder model
 */


'use strict';
var mongoose = require('mongoose'),
    Schema   = mongoose.Schema,
    uuid = require('node-uuid');

var GroupsSchema = new Schema({
    name:{
        type:String,
        trim:true
    },
    description:{
        type:String,
        default:null
    },
    color:{
        type:String,
        trim:true
    },
    group_pic_link:{
        type:String,
        trim:true,
        default:null
    },
    created_by:{
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

},{collection:"groups"});


GroupsSchema.pre('save', function(next){
    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }
    next();
});

/**
 * Create group
 * @param groupData
 * @param callBack
 */
GroupsSchema.statics.createGroup = function(groupData,callBack){
    var _group = new this();
    _group.name = groupData.name;
    _group.description = groupData.description;
    _group.color = groupData.color;
    _group.group_pic_link = groupData.group_pic_link;
    _group.created_by = groupData.created_by;
    _group.shared_users = groupData.shared_users;

    _group.save(function(err){

        if(!err){
            callBack({
                status:200
            });
        }else{
            console.log("Server Error --------");
            console.log(err);
            callBack({status:400,error:err});
        }

    });
};

/**
 * Create group
 * @param groupData
 * @param callBack
 */
GroupsSchema.statics.getGroupMembers = function(groupId,callBack){
    var _this = this;

    _this.find({_id: Util.toObjectId(groupId)}, {shared_users : 1}).exec(function(err,resultSet){
        if(!err){
            callBack({
                members : resultSet,
                members_count : resultSet.length
            });
        }else{
            console.log("Server Error --------");
            callBack({status:400,error:err});
        }
    })
};


mongoose.model('Groups',GroupsSchema);
