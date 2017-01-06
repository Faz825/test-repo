/**
 * Group model
 */


'use strict';
var mongoose = require('mongoose'),
    Schema   = mongoose.Schema,
    uuid = require('node-uuid');

GLOBAL.GroupSharedRequest = {
    REQUEST_PENDING: 1,
    REQUEST_REJECTED: 2,
    REQUEST_ACCEPTED: 3,
    MEMBER_REMOVED: 4
};

GLOBAL.GroupPermissions = {
    FULL_ACCESS: 1,
    VIEW_ONLY: 2,
    VIEW_POST: 3,
    ADD_POST: 4,
    SHARE_POST: 5,
    VIEW_DOCUMENT: 6,
    VIEW_MEMBER: 7,
    ADD_MEMBER: 8,
    VIEW_CALENDAR: 9,
    VIEW_FOLDER: 10,
};

var SharedMemberSchema = new Schema({
    name:{
        type:String,
        default:null
    },
    user_id:{
        type : Schema.ObjectId,
        ref : 'User',
        default : null
    },
    status:{
        type : Number,
        default : null /* 1 - pending | 2 - rejected | 3 - accepted*/
    },
    permissions:{
        type : Number,
        default : null /* 1 - pending | 2 - rejected | 3 - accepted*/
    },
    join_date: {
        type:Date
    },
});

var GroupsSchema = new Schema({
    type:{
        type : Number,
        default : 1 /* 1 - group | 2 - community*/
    },
    name:{
        type:String,
        default:null
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
    members:[SharedMemberSchema],
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
    _group.members = groupData.members;
    _group.type = groupData.type;

    _group.save({lean:true},function(err,result){

        if(!err){
            callBack({
                status:200,
                result:result
            });
        }else{
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


    /* TODO: We can use this aggrigation approch, 
    when we are using new version (3.2) of MongoDB */
    /*_this.aggregate([
        { 
            "$match": { 
                "_id": groupId       
            } 
        },
        {
            "$filter": {
                "input": "$members",
                "as": "member",
                "cond": { "$eq": ["$$member.status", 3] }
            }
        },
        { "$unwind": "$members" },
        {
            "$lookup": {
                "from" : "SharedMember",
                "localField" : "members.user_id",
                "foreignField" : "user_id",
                "as" : "member"
            }
        }
    ]).exec(function(err, results) { 
        if (err) throw err;
    });*/


    _this.find({_id: Util.toObjectId(groupId)}).select('created_by members -_id').exec(function(err,resultSet){
        if(!err){

            console.log(resultSet);
            var members = resultSet[0].members;
            var tmpArray = [];
            for (var i = 0; i < members.length; i++) {

                var member = members[i];
                if(member.status == 3) {
                    tmpArray.push(member.user_id);  
                }

                if(members.length == i + 1) {
                    callBack({
                        owner : resultSet[0].created_by,
                        members : tmpArray,
                        members_count : tmpArray.length
                    });
                }
            }
        }else{
            console.log("Server Error --------");
            callBack({status:400, error:err});
        }
    })
};

/**
 * Get Group By Id
 */
GroupsSchema.statics.getGroupById = function(id,callBack){

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
 * Get Group Data
 */
GroupsSchema.statics.getGroupData = function(criteria,callBack){

    var _this = this;

    _this.find(criteria , {'members.$': 1}).exec(function (err, resultSet) {
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
 * Get Group Filtered Data
 */
GroupsSchema.statics.getGroupDataFiltered = function(criteria,filter,callBack){

    var _this = this;

    _this.find(criteria , filter).exec(function (err, resultSet) {
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
 * Update Shared Group
 * @param criteria
 * @param data
 * @param callBack
 */
GroupsSchema.statics.updateGroupData = function(criteria, data, callBack){

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
 * This is to get the group name of given group_id
 * @param criteria
 * @param data
 * @param callBack
 */
GroupsSchema.statics.bindNotificationData = function(notificationObj, callBack){

    this.getGroupById(notificationObj.group_id,function(groupData){

        notificationObj['group_name'] = groupData.name;

        callBack(notificationObj);
    });

};

/**
 * Update a Group
 * @param filter
 * @param value
 * @param callBack
 */
GroupsSchema.statics.updateGroups = function(filter, value, callBack){

    var _this = this;
    var options = {multi: true};

    this.update(filter, value, options, function(err, update) {
        if(err){
            console.log(err);
            console.log("Error - An Error occured in group updating.");
            callBack({status:400,error:err});
        } else {
            console.log(update);
            console.log("Success - The group updating is success.");
            callBack({status:200, group:update});
        }
    });
};

mongoose.model('Groups',GroupsSchema);
