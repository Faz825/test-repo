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
    REQUEST_ACCEPTED:1,
    RESPONSE_DECLINED:2,
    REQUEST_BLOCKED:3,
    REQUEST_SENT:4,

};

GLOBAL.ConnectionConfig ={
    CACHE_NAME:"connections:",
    ES_INDEX_NAME:"idx_connections:"
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

ConnectionSchema.statics.sendConnectionRequest=function(user_id,connected_users,unconnected_users,callBack){
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
                user_id: Util.toObjectId(user_id),
                connected_with: connected_users[i].toObjectId(),
                created_at: now,
                action_user_id:Util.toObjectId(user_id),
                status:ConnectionStatus.REQUEST_SENT
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
ConnectionSchema.statics.getFriends = function(userId,status,callBack){
    var _this = this,_async = require('async'),
        _friendIds=[],_friends={},
        _status = {
            $in:status
        }

    _async.waterfall([
        function getMyRequestAcceptedUsers(callBack){
            _this.find({user_id:userId,status:_status})
                .exec(function(err,resultSet){
                if(!err){
                    for(var a = 0;a<resultSet.length;a++){
                        var usr_id= resultSet[a].connected_with.toString();
                        if(_friendIds.indexOf(usr_id) == -1) {
                            var _usr_id = resultSet[a].connected_with.toString();
                            _friendIds.push(_usr_id);
                            _friends[_usr_id]  = resultSet[a];
                        }
                    }
                    callBack(null);
                }else{
                    console.log("Server Error --------");
                    console.log(err);
                    callBack(null);
                }
            });
        },
        function getIAcceptedRequest(callBack){
            _this.find({connected_with:userId,status:_status})
                .exec(function(err,resultSet){
                if(!err){
                    for(var a = 0;a<resultSet.length;a++){
                        var usr_id= resultSet[a].user_id.toString();
                        if(_friendIds.indexOf(usr_id) == -1) {
                            var _usr_id = resultSet[a].user_id.toString();
                            _friendIds.push(_usr_id);
                            _friends[_usr_id]  = resultSet[a];
                        }
                    }
                    callBack(null,_friendIds,_friends);
                }else{
                    console.log("Server Error --------");
                    console.log(err);
                    callBack(null);
                }
            });
        }
    ],function(err,_friendIds,_friends){

        callBack({
            friends_ids:_friendIds,
            friends:_friends
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
 * Get Connection Count
 * @param userId
 * @param callBack
 */
ConnectionSchema.statics.getFriendsCount = function(userId,callBack){
    var _this = this,
        _async = require('async'),
        friendsCount=0;



    _async.waterfall([
        function getMyRequestAcceptedUsers(callBack){
            _this.count({user_id:userId,status:ConnectionStatus.REQUEST_ACCEPTED})
                .exec(function(err,resultCount){
                    if(!err){
                        friendsCount = resultCount
                        callBack(null);
                    }else{
                        console.log("Server Error --------");
                        console.log(err);
                        callBack(null);
                    }
                });
        },
        function getIAcceptedRequest(callBack){
            _this.count({connected_with:userId,status:ConnectionStatus.REQUEST_ACCEPTED})
                .exec(function(err,resultCount){
                    if(!err){
                        friendsCount = friendsCount+resultCount;
                        callBack(null,friendsCount);
                    }else{
                        console.log("Server Error --------");
                        console.log(err);
                        callBack(null);
                    }
                });
        }
    ],function(err,friendsCount){
        callBack(friendsCount)
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


/**
 * Get Connection requests that received for me
 * @param userId
 */
ConnectionSchema.statics.getConnectionRequests = function(criteria,callBack){

    var _this = this, _async = require('async'),_formatted_connection_requests= [];

    var _query = {
        connected_with:Util.toObjectId(criteria.user_id),
        status:ConnectionStatus.REQUEST_SENT
    }



        _this.find(_query)
            .exec(function(err,resultSet){
                if(!err){
                    _async.each(resultSet,
                        function(connection,callBack){
                            var query={
                                q:connection.user_id.toString(),
                                index:'idx_usr'
                            };
                            ES.search(query,function(esResultSet){

                                if(typeof esResultSet.result[0] == "undefined"){
                                    callBack();
                                }else{
                                    _formatted_connection_requests.push(esResultSet.result[0]);
                                    callBack();
                                }


                            });

                        },function(err){
                            if(err){
                                console.log("getConnectionRequests \n ")
                                console.log(err)
                                callBack({status:400,error:err});
                            }else{
                                callBack({status:200,requested_connections:_formatted_connection_requests});
                            }

                        })
                }else{
                    console.log("Server Error --------");
                    console.log(err);
                    callBack(null);
                }

            });



}

/**
 * Accept connection request
 * following are the tasks that need to be handle in this function
 * 1. Change status to 1 in connections document
 * 2. Update Each users connection index
 *
 * @param criteria
 * @param callBack
 */
ConnectionSchema.statics.acceptConnectionRequest = function(criteria,callBack){

    var _this = this, _async = require('async');

    _async.waterfall([

        function changeStatus(callBack){
            var now = new Date();
            _this.update({
                user_id:Util.toObjectId(criteria.sender_id),
                connected_with:Util.toObjectId(criteria.user_id)
            },{
                $set:{
                    status:ConnectionStatus.REQUEST_ACCEPTED,
                    updated_at:now,
                    action_user_id:Util.toObjectId(criteria.user_id)
                }
            },{upsert:false,multi:false},function(err,rsUpdate){
                if(!err){
                    callBack(null);
                }else{
                    console.log("acceptConnectionRequest \n");
                    console.log(err);
                }
            })
        },
        function updateIndexConnection(callBack){

            //UPDATE OWN CONNECTION ES
            var query={
                q:criteria.sender_id.toString(),
                index:'idx_usr'
            };

            ES.search(query,function(esResultSet){


                var _cache_key = ConnectionConfig.ES_INDEX_NAME+criteria.user_id.toString();
                var payLoad={
                    index:_cache_key,
                    id:criteria.sender_id.toString(),
                    type: 'connections',
                    data:esResultSet.result[0],
                    tag_fields:[esResultSet.result[0].first_name,esResultSet.result[0].last_name]
                }

                ES.createIndex(payLoad,function(resultSet){
                    //DONE
                    console.log("createIndex")
                    console.log(resultSet)
                });

            });


            //UPDATE FRIEND'S CONNECTION ES
            var query={
                q:criteria.user_id.toString(),
                index:'idx_usr'
            };
            ES.search(query,function(esResultSet){

                var _cache_key = ConnectionConfig.ES_INDEX_NAME+criteria.sender_id.toString();
                var payLoad={
                    index:_cache_key,
                    id:criteria.user_id.toString(),
                    type: 'connections',
                    data:esResultSet.result[0],
                    tag_fields:[esResultSet.result[0].first_name,esResultSet.result[0].last_name]
                }

                ES.createIndex(payLoad,function(resultSet){
                    console.log("createIndex")
                    console.log(resultSet)
                    //DONE
                });

            });
            callBack(null)
        }

    ],function(err,resultSet){
            callBack({status:200})
    });

}

/**
 * Get My Connection
 * @param criteria
 * @param callBack
 */
ConnectionSchema.statics.getMyConnection = function(criteria,callBack){

    var _cache_key = ConnectionConfig.ES_INDEX_NAME+criteria.user_id.toString(),
        _async = require('async');

    var query={
        q:criteria.q,
        index:_cache_key
    },
    formatted_users = [];

    console.log(JSON.stringify(query))

    ES.search(query,function(esResultSet){

        if(esResultSet != null){
            _async.each(esResultSet.result,
                function(result,callBack){

                    console.log(JSON.stringify(result));

                    var query={
                        q:"user_id:"+result.user_id,
                        index:'idx_usr'
                    };
                    ES.search(query,function(sesResultSet){
                        if(result.user_id != criteria.user_id){
                            formatted_users.push(sesResultSet.result[0]);

                        }
                        callBack();

                    });
                },
                function(err){

                    callBack({result_count:formatted_users.length,results:formatted_users})

                });



        }else{
            callBack({result_count:0,results:[]})
        }

    });

}



ConnectionSchema.statics.getFriendSuggestion = function(criteria,callBack){

    var _async = require('async'),
        User = require('mongoose').model('User'),
        _this = this;

    _async.waterfall([
        function getUsersConnections(callBack){

            _this.getFriends(criteria.user_id,criteria.status,function(myFriends){

                callBack(null,myFriends.friends)

            });
        },
        function getAllUsers(myFriends,callBack){

            User.getAllUsers(criteria.country,criteria.user_id,function(resultSet){
                callBack(null,{
                    total_result:resultSet.total_result,
                    users:resultSet.users,
                    my_friends:myFriends
                })
            })
        },
        function mergeConnection(connections,callBack){
            var _my_friends =connections.my_friends,
                _formattedFriendList =[],
                _allUsers = connections.users;


            for(var i =0;i<_allUsers.length;i++){
                var _c_users ={},
                    _my_friend = _my_friends[_allUsers[i].user_id.toString()];

                if(typeof _my_friend == 'undefined' && criteria.filter_ids.indexOf(_allUsers[i].user_id) == -1){
                    _allUsers[i].connection_status = 0
                    _formattedFriendList.push(_allUsers[i]);

                }

            }
            callBack(null,{
                total_result: _formattedFriendList.length,
                friends:_formattedFriendList
            })
        }


    ],function(err,resultSet){

        if(!err){
            callBack({status:200,friends:resultSet.friends,total_result:resultSet.total_result})
        }else{
            console.log("LOOP ERROR")
            console.log({status:400,error:err});
        }

    });



}


String.prototype.toObjectId = function() {
    var ObjectId = (require('mongoose').Types.ObjectId);
    return new ObjectId(this.toString());
};
mongoose.model('Connection',ConnectionSchema);