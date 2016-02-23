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

ConnectionSchema.statics.connect=function(connected_users,unconnected_users,callBack){
    var _connected_users =[],now = new Date();

    //REMOVE UNSELECTED CONNECTIONS
    if(unconnected_users.length > 0){
        var _formatted_unconnected_ids = [];
        for(var a=0;a<unconnected_users.length;a++){
           // _formatted_unconnected_ids.push(unconnected_users[a].toObjectId());
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
                created_at: now
            });
        }

        this.collection.insert(_connected_users,function(err,resultSet){

        });
    }


    callBack({status:200,
        connected:"ok"});

}

/**
 * Get Connections that related to users
 * @param userId
 * @param callBack
 */
ConnectionSchema.statics.getConnectedUsers = function(userId,callBack){
    var _this = this;

    _this.find({user_id:userId}).exec(function(err,resultSet){
        if(!err){
            callBack({
                status:200,
                connections:resultSet

            });
        }else{
            console.log("Server Error --------")
            callBack({status:400,error:err});
        }
    });

}

/**
 * Get All Connected User ids as an array
 * @param userId
 * @param callBack
 */
ConnectionSchema.statics.getConnectedUserIds = function(userId,callBack){
    var _this = this;
    _this.getConnectedUsers(userId,function(resultSet){

        callBack({
            status:resultSet.status,
            connected_user_ids:_this.formatConnectedUsers(resultSet.connections,true)
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
        callBack(resultSet.connected_user_ids.length)
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