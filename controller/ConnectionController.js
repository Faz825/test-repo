/**
 * This is connection controller that communicate with connection.
 */


var ConnectionController ={

    /**
     * Get Connection request
     * @param req
     * @param res
     */
    getRequestedConnections :function(req,res){
        var Connection =require('mongoose').model('Connection'),CurrentSession = Util.getCurrentSession(req);

        var criteria ={
            user_id:CurrentSession.id,
            result_per_page:3

        }
        Connection.getConnectionRequests(criteria,function(resultSet){
            var outPut = {
                status:ApiHelper.getMessage(200,Alert.SUCCESS,Alert.SUCCESS),
                req_cons:resultSet.requested_connections
            }

            res.status(200).send(outPut);
            return 0
        });
    },

    /**
     * Get My Connection
     * @param req
     * @param res
     */
    getMyConnections:function(req,res){
        console.log(req.query['q']);
        console.log('default');
        var Connection = require('mongoose').model('Connection'),CurrentSession = Util.getCurrentSession(req);
        var criteria = {
            user_id :CurrentSession.id,
            q:req.query['q']
        }

        Connection.getMyConnection(criteria,function(resultSet){
            var outPut = {
                status:ApiHelper.getMessage(200,Alert.SUCCESS,Alert.SUCCESS),

            }
            outPut['header'] ={
                total_result:resultSet.result_count,
                result_per_page:Config.CONNECTION_RESULT_PER_PAGE,
                total_pages:Math.ceil(resultSet.result_count/Config.CONNECTION_RESULT_PER_PAGE)
            };

            outPut['my_con'] = resultSet.results

            res.status(200).send(outPut);
            return 0
        })
    },

    /**
     * Get My Connection - Sort
     * @param req
     * @param res
     */
    getMySortedConnections:function(req,res){

        var Connection = require('mongoose').model('Connection'),CurrentSession = Util.getCurrentSession(req);
        var criteria = {
            user_id :CurrentSession.id,
            q:req.query['q']
        }, sortingOption = req.params['option'];

        Connection.getMyConnection(criteria,function(resultSet){
            var outPut = {
                status:ApiHelper.getMessage(200,Alert.SUCCESS,Alert.SUCCESS),

            }
            outPut['header'] ={
                total_result:resultSet.result_count,
                result_per_page:Config.CONNECTION_RESULT_PER_PAGE,
                total_pages:Math.ceil(resultSet.result_count/Config.CONNECTION_RESULT_PER_PAGE)
            };

            var _allConnections = resultSet.results;

            switch(sortingOption){
                case 'name':
                    console.log('sorting...');
                    _allConnections.sort(function(a,b){
                        a.first_name - b.first_name;
                    });
                    break;
                case 'date':
                    _allConnections.sort(function(a,b){
                        b.connected_at - a.connected_at;
                    });
                    break;
            }
            console.log('outing...');
            outPut['my_con'] = _allConnections;

            res.status(200).send(outPut);
            return 0
        })
    },

    /**
     * Get My Connection with Unfriend User
     * @param req
     * @param res
     */
    getMyConnectionsBindUnfriendConnections:function(req,res){
        console.log(req.query['q']);
        var Connection = require('mongoose').model('Connection'),CurrentSession = Util.getCurrentSession(req);
        var criteria = {
            user_id :CurrentSession.id,
            q:req.query['q']
        }

        Connection.getMyConnectionsBindUnfriendConnections(criteria,function(resultSet){
            var outPut = {
                status:ApiHelper.getMessage(200,Alert.SUCCESS,Alert.SUCCESS),

            }
            outPut['header'] ={
                total_result:resultSet.result_count,
                result_per_page:Config.CONNECTION_RESULT_PER_PAGE,
                total_pages:Math.ceil(resultSet.result_count/Config.CONNECTION_RESULT_PER_PAGE)
            };

            outPut['my_con'] = resultSet.results;
            outPut['unfriend'] = resultSet.unfriend_connections;

            res.status(200).send(outPut);
            return 0
        })
    },
    /**
     * Accept Friend request
     * @param req
     * @param res
     */
    acceptFriendRequest:function(req,res){
        var Connection =require('mongoose').model('Connection'),CurrentSession = Util.getCurrentSession(req);
        var criteria ={
            sender_id  :req.body.sender_id,
            user_id:CurrentSession.id
        }
        Connection.acceptConnectionRequest(criteria,function(resultSet){
            var outPut = {
                status:ApiHelper.getMessage(200,Alert.SUCCESS,Alert.SUCCESS),
            }
            res.status(200).send(outPut);
            return 0
        });
    },

    getMutualConnections:function(req,res){

        var User = require('mongoose').model('User'),
            Connection = require('mongoose').model('Connection'),
            CurrentSession = Util.getCurrentSession(req),
            _async = require('async'),
            _grep = require('grep-from-array'),
            _mutual_cons = [];

        _async.waterfall([
                function getMyConnections(callback){
                    var criteria = {
                        user_id :CurrentSession.id,
                        q:req.params['q']
                    };

                    Connection.getMyConnection(criteria,function(resultSet){
                        var my_cons = resultSet.results;
                        callback(null, my_cons);
                    })
                },
                function getFriendsConnection(resultSet, callback){
                    var myConnection = resultSet,
                        criteria = {
                            user_id :req.params['uid'],
                            q:req.params['q']
                        };

                    Connection.getMyConnection(criteria,function(resultSet){
                        var friend_cons = resultSet.results;

                        for(var inc = 0; inc < myConnection.length; inc++){
                            var user_id = myConnection[inc].user_id;
                            if(user_id != req.params['uid']) {

                                var mutual_con = _grep(friend_cons, function (e) {
                                    return e.user_id == user_id;
                                });
                                if(mutual_con[0] != null){
                                    _mutual_cons.push(mutual_con[0]);
                                }
                            }
                        }
                        callback(null);
                    });
                }
            ],function(err){
                var outPut = {
                    status:ApiHelper.getMessage(200,Alert.SUCCESS,Alert.SUCCESS)
                };
                outPut['mutual_cons'] = _mutual_cons;
                outPut['mutual_cons_count'] = _mutual_cons.length;
                res.status(200).send(outPut);
            }
        );


    },

    /**
     * Send Frind Request
     * @param req
     * @param res
     */
    getFriendSuggestion:function(req,res){

        var Connection =require('mongoose').model('Connection'),
            filter_ids=[],CurrentSession = Util.getCurrentSession(req);
        filter_ids.push(CurrentSession.id);
        var criteria ={
            pg:0,
            country:CurrentSession.country,
            user_id:CurrentSession.id,
            status: [ConnectionStatus.REQUEST_ACCEPTED, ConnectionStatus.REQUEST_SENT],
            random:3,
            filter_ids:filter_ids
        };


        Connection.getFriendSuggestion(criteria,function(resultSet){

            var outPut	={};

            if(resultSet.status !== 400){

                outPut['status'] = ApiHelper.getMessage(200,Alert.SUCCESS,Alert.SUCCESS);
                outPut['header'] ={
                    total_result:resultSet.total_result,
                    result_per_page:Config.CONNECTION_RESULT_PER_PAGE,
                    total_pages:Math.ceil(resultSet.total_result/Config.CONNECTION_RESULT_PER_PAGE)
                };

                //LOAD RANDOM FRIEND SUGGESTIONS

                var _connection = [];

                /*if(resultSet.total_result > 3){

                    for(var a =0 ;a<3;a++){
                        var r = Util.getRandomInt(0,resultSet.total_result-1);
                        _connection.push(resultSet.friends[r]);
                    }






                    outPut['connections'] = _connection;







                }else{
                    outPut['connections'] = resultSet.friends;
                }*/

                outPut['connections'] = resultSet.friends
                res.status(200).send(outPut);
                return 0
            }else{
                outPut['status'] = ApiHelper.getMessage(400,Alert.CONNECTION_USERS_EMPTY,Alert.ERROR);

                res.status(400).send(outPut);
                return 0;
            }

        });
    },

    /**
     * Send Connection request
     * @param req
     * @param res
     */
    sendFriendRequest:function(req,res){
        var Connection =require('mongoose').model('Connection'),CurrentSession = Util.getCurrentSession(req);

        var req_connected_users = JSON.parse(req.body.connected_users);
        var req_unconnected_users = [];

        Connection.sendConnectionRequest(CurrentSession.id,req_connected_users,req_unconnected_users, function (resultSet) {
            var outPut = {};
            if (resultSet.status !== 200) {
                outPut['status'] = ApiHelper.getMessage(400, Alert.CONNECT_ERROR, Alert.ERROR);
                res.status(400).send(outPut);
                return 0;
            }


            outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
            res.status(200).json(outPut);
            return 0;
        });
    },

    /**
     * Get unique suggestion
     * @param req
     * @param res
     */
    getUniqueFriendRequest:function(req,res){
        var Connection =require('mongoose').model('Connection'),
         req_connected_users = JSON.parse(req.body.cur_b_ids),CurrentSession = Util.getCurrentSession(req);
         req_connected_users.push(CurrentSession.id);
        var criteria ={
            pg:0,
            country:CurrentSession.country,
            user_id:CurrentSession.id,
            status: [ConnectionStatus.REQUEST_ACCEPTED, ConnectionStatus.REQUEST_SENT],
            random:3,
            filter_ids:req_connected_users
        };


        Connection.getFriendSuggestion(criteria,function(resultSet){

            var outPut	={};




            if(resultSet.status !== 400){
                var rand = Util.getRandomInt(0,resultSet.total_result);
                outPut['status'] = ApiHelper.getMessage(200,Alert.SUCCESS,Alert.SUCCESS);
                outPut['header'] ={
                    total_result:resultSet.total_result,
                    result_per_page:Config.CONNECTION_RESULT_PER_PAGE,
                    total_pages:Math.ceil(resultSet.total_result/Config.CONNECTION_RESULT_PER_PAGE)
                };
                outPut['connection'] = resultSet.friends[rand];
                res.status(200).send(outPut);
                return 0
            }else{
                outPut['status'] = ApiHelper.getMessage(400,Alert.CONNECTION_USERS_EMPTY,Alert.ERROR);

                res.status(400).send(outPut);
                return 0;
            }

        });
    },

    checkConnection:function(req,res){

        var User = require('mongoose').model('User'),
            Connection = require('mongoose').model('Connection'),
            _async = require('async'),
            CurrentSession = Util.getCurrentSession(req),
            outPut = {},
            _alreadyConnected = false, _alreadyRequestSent = false, _alreadyRequestReceived = false, _otherUserId = null;

        _async.waterfall([
                function getOtherUserDetails(callback){
                    var query={
                        q:"user_name:"+req.params['uname'],
                        index:'idx_usr'
                    };
                    //Find User from Elastic search
                    ES.search(query,function(csResultSet){
                        _otherUserId = csResultSet.result[0]['user_id'];
                        callback(null);
                    });
                },
                function checkAlreadyConnected(callback){
                    var criteria = {
                        user_id :CurrentSession.id,
                        q:'user_name:'+req.params['uname']
                    };

                    Connection.getMyConnectionData(criteria,function(resultSet){
                        console.log(resultSet);
                        if(resultSet.results.length > 0){
                            _alreadyConnected = true;
                        }
                        callback(null);
                    })
                },
                function checkAlreadyRequested(callback){
                    if(_alreadyConnected == false){
                        Connection.checkRequestSentReceived(CurrentSession.id, _otherUserId,function(resultSet){
                            if(resultSet.length > 0){
                                console.log(resultSet[0].connected_with);
                                if(resultSet[0].user_id.toString() == CurrentSession.id){
                                    _alreadyRequestSent = true;
                                }
                                if(resultSet[0].connected_with.toString() == CurrentSession.id){
                                    _alreadyRequestReceived = true;
                                }
                                callback(null)
                            }else{
                                callback(null)
                            }
                        });
                    } else{
                        callback(null)
                    }
                }



            ],function(err){
                var outPut = {
                    status:ApiHelper.getMessage(200,Alert.SUCCESS,Alert.SUCCESS),
                    alreadyConnected:_alreadyConnected,
                    alreadyRequestSent:_alreadyRequestSent,
                    alreadyRequestReceived:_alreadyRequestReceived,
                    profile_user_id:_otherUserId
                };
                res.status(200).send(outPut);
                return 0;
            }
        );
    },

    /**
     * Remove User Connections
     * @param req
     * @param res
     */
    unfriendUser:function(req,res){
        var Connection = require('mongoose').model('Connection'),
            NoteBook = require('mongoose').model('NoteBook'),
            _async = require('async'),
            CurrentSession = Util.getCurrentSession(req);

        _async.waterfall([
            function updateConnection(callback){
                var criteria ={
                    sender_id  :req.body.sender_id,
                    user_id:CurrentSession.id
                };

                Connection.unfriendUser(criteria,function(resultSet){
                    console.log('connections');
                    callback(null);
                });
            },
            function updateNotebookByLoggedUser(callback){
                var criteria ={
                    sender_id  :req.body.sender_id,
                    user_id:CurrentSession.id
                };

                NoteBook.sharedNotebookOnUnfriend(criteria,function(resultSet){
                    console.log('1');
                    callback(null);
                });
            },
            function updateNotebookByRemovedUser(callback){
                var criteria ={
                    user_id  :req.body.sender_id,
                    sender_id:CurrentSession.id.toString()
                };

                NoteBook.sharedNotebookOnUnfriend(criteria,function(resultSet){
                    console.log('2');
                    callback(null);
                });
            }
        ],function(err){
            var outPut = {
                status:ApiHelper.getMessage(200,Alert.SUCCESS,Alert.SUCCESS)
            };
            res.status(200).send(outPut);
        });
    }

}


module.exports = ConnectionController;