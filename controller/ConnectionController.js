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


                for(var a =0 ;a<3;a++){
                    var r = Util.getRandomInt(0,resultSet.total_result-1);
                        _connection.push(resultSet.friends[r]);
                }
                outPut['connections'] = _connection;
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
        var Connection =require('mongoose').model('Connection');

        var req_connected_users = JSON.parse(req.body.connected_users);
        var req_unconnected_users = [];

        Connection.sendConnectionRequest(req_connected_users,req_unconnected_users, function (resultSet) {
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
    }

}


module.exports = ConnectionController;