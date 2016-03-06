/**
 * This is connection module that handle connections
 */

'use strict'
var  mongoose = require('mongoose'),
    Schema   = mongoose.Schema;
/**
 * Define Connection Status
 */
GLOBAL.ConnectionStatus ={
    REQUEST_PENDING:0,
    REQUEST_ACCEPTED:1,
    RESPONSE_DECLINED:2,
    REQUEST_BLOCKED:3

};

GLOBAL.ConnectionConfig ={
    CACHE_NAME:"connections:"
}

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
    status:{
        type:Number,
        default:0
    },
    action_user_id:{
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

ConnectionSchema.statics.connect=function(connected_users,unconnected_users,callBack){
    var _connected_users =[],now = new Date();
    //REMOVE UNSELECTED CONNECTIONS
    if(unconnected_users.length > 0){
        var _formatted_unconnected_ids = [];
        for(var a=0;a<unconnected_users.length;a++){
            this.remove({connected_with:unconnected_users[a].toObjectId()},function(err){
                console.log(err);
            })
        }
    }
    if(connected_users.length >0){
        for (var i = 0; connected_users.length > i; i++) {
            _connected_users.push({
                user_id: CurrentSession.id.toObjectId(),
                connected_with: connected_users[i].toObjectId(),
                created_at: now,
                action_user_id:CurrentSession.id.toObjectId(),
                status:ConnectionStatus.REQUEST_PENDING
            });
        }
        this.collection.insert(_connected_users,function(err,resultSet){});
    }
    callBack({status:200,connected:"ok"});

}

/**
 * Get Connections that related to users
 * @param userId
 * @param callBack
 */
ConnectionSchema.statics.getConnectedUserIds = function(userId,callBack){
    var _this = this,_async = require('async'),
        _connectedUserIds=[];

    _async.waterfall([
        function getMyRequestAcceptedUsers(callBack){
            _this.find({user_id:userId,status:ConnectionStatus.REQUEST_ACCEPTED})
                .exec(function(err,resultSet){
                if(!err){
                    for(var a = 0;a<resultSet.length;a++){
                        var usr_id= resultSet[a].connected_with.toString();
                        if(_connectedUserIds.indexOf(usr_id) == -1)
                            _connectedUserIds.push(resultSet[a].connected_with.toString());
                    }
                    callBack(null)
                }else{
                    console.log("Server Error --------");
                    console.log(err);
                    callBack(null);
                }
            });
        },
        function getIAcceptedRequest(callBack){
            _this.find({connected_with:userId,status:ConnectionStatus.REQUEST_ACCEPTED})
                .exec(function(err,resultSet){
                if(!err){
                    for(var a = 0;a<resultSet.length;a++){
                        var usr_id= resultSet[a].user_id.toString();
                        if(_connectedUserIds.indexOf(usr_id) == -1)
                            _connectedUserIds.push(resultSet[a].user_id.toString());
                    }
                    callBack(null,_connectedUserIds)
                }else{
                    console.log("Server Error --------");
                    console.log(err);
                    callBack(null);
                }
            });
        }
    ],function(err,_connectedUserIds){

        callBack({
            connected_user_ids:_connectedUserIds
        })
    });




}


/**
 * Format Users object
 * if getIdOnly is tru then function will return all user ids based on the connectedUser object
 * if not it will return connection object as it is
 * @param connectedUsers
 * @param getIdOnly
 */
ConnectionSchema.statics.formatConnectedUsers = function(connectedUsers,getIdOnly){

    if(typeof getIdOnly != 'undefined' && getIdOnly === true){
        var _tmp_connected_user_ids = [];

        for(var i=0;i<connectedUsers.length;i++){
            _tmp_connected_user_ids.push(connectedUsers[i].connected_with.toString());
        }
        return _tmp_connected_user_ids;
    }

    return connectedUsers;


}

/**
 * Get Connected User count
 * @param userId
 * @param callBack
 */
ConnectionSchema.statics.getConnectionCount = function(userId,callBack){
    this.getConnectedUserIds(userId,function(resultSet){
        callBack(0)
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

String.prototype.toObjectId = function() {
    var ObjectId = (require('mongoose').Types.ObjectId);
    return new ObjectId(this.toString());
};
mongoose.model('Connection',ConnectionSchema);