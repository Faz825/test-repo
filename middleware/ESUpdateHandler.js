/**
 * Created by phizuupc on 10/5/2016.
 */

var ESUpdateHandler = {

    init:function(){
        this.updateConnectedTime(function (payload) {});
    },

    updateConnectedTime:function(){
        var _async = require('async'),
            Connection = require('mongoose').model('Connection'),
            User = require('mongoose').model('User');

        _async.waterfall([

            function getAllUsers(callBack) {
                var q = '*';

                User.getAllUsers(q, '', function(resultSet){
                    callBack(null, resultSet.users);
                });
            },
            function (allUsers, callBack) {

                _async.eachSeries(allUsers, function(user,callBack){
                    _async.waterfall([
                        function isConnected(callBack) {
                            var status = ConnectionStatus.REQUEST_ACCEPTED;
                            Connection.getFriends(user.user_id,status,function(myFriendIds){
                                callBack(null, myFriendIds);
                            });
                        },
                        function updateESIndex(connectionStatus, callBack) {
                            var friends = connectionStatus.friends,
                                friends_ids = connectionStatus.friends_ids;
                            if(friends_ids.length > 0){
                                var _cache_key = ConnectionConfig.ES_INDEX_NAME+user.user_id;
                                var query={
                                    index:_cache_key
                                };
                                ES.search(query,function(esConnections){
                                    var esResult = esConnections.result;
                                    _async.eachSeries(esResult, function(esUser,callBack){
                                        if(esUser.connected_at == undefined){
                                            esUser['connected_at'] = friends[esUser.user_id].updated_at;

                                            var payLoad={
                                                index:_cache_key,
                                                id:esUser.user_id,
                                                type: 'connections',
                                                data:esUser
                                            }

                                            ES.update(payLoad,function(resultSet){
                                                callBack(null);
                                            });
                                        }else{
                                            callBack(null);
                                        }
                                    }, function(err){
                                        callBack(null);
                                    });
                                });
                            }else {
                                callBack(null);
                            }
                        }
                    ],function(err){
                        callBack(null);
                    });
                }, function(err){
                    callBack(null);
                });
            }
        ],function(err){
            callBack(null);
        });
    }
};

module.exports = ESUpdateHandler;