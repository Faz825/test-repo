
'use strict'

var UserControler ={
    /**
     * Register new User
     * @param req
     * @param res
     */
	doSignup:function(req,res){
		var User = require('mongoose').model('User');

		var user ={
			id:req.body._id,
			first_name:req.body.fName,
			last_name:req.body.lName,
			email:req.body.email,
			password:req.body.password,
			status:req.body.status,
			secretary:req.body.secretary
		}
		User.findByEmail(user.email,function(ResultSet){

			if(ResultSet.status == 200 && ResultSet.user == null ){

				User.create(user,function(_ResultSet){
					if(typeof _ResultSet.status != 'undefined' && _ResultSet.status == 400){
						res.status(400).json({
							status:"error",
							message:Alert.USER_CREATION_ERROR
						});
						return;
					}

					var _cache_key = CacheEngine.prepareCaheKey(_ResultSet.user.token);
					CacheEngine.addToCache(_cache_key,_ResultSet.user,function(cacheData){
						
						var _out_put= {
							status:'success',
							message:Alert.ACCOUNT_CREATION_SUCCESS
						}
						if(!cacheData){
							_out_put['extra']=Alert.CACHE_CREATION_ERROR
						}

						_out_put['user']=_ResultSet.user
						res.status(200).json(_out_put);
					});
					
				});
			}else{
				res.status(400).json({
					status:"error",
					message:Alert.ACCOUNT_EXIST
				});
			}
		});
		
	},

    /**
     * Save Secretary for selected User
     * @param req
     * @param res
     */
    saveSecretary:function(req,res){
        var User = require('mongoose').model('User'),
            Secretary = require('mongoose').model('Secretary');


        var secretaryData ={
            secretary:req.body.secretary,
            status:2
        }
        User.saveUpdates(CurrentSession.id,secretaryData,function(resultSet){
            Secretary.getSecretaryById(secretaryData.secretary,function(resultSet){
                var _cache_key = CacheEngine.prepareCaheKey(CurrentSession.token);
                CurrentSession['secretary_name']        = resultSet.full_name;
                CurrentSession['secretary_id']          = resultSet.id;
                CurrentSession['secretary_image_url']   = resultSet.image_name;
                CurrentSession['status']                = 2;


                CacheEngine.updateCache(_cache_key,CurrentSession,function(cacheData){
                    var _out_put= {
                        status:'success',
                        message:Alert.ADDED_SECRETARY
                    }
                    if(!cacheData){
                        _out_put['extra']=Alert.CACHE_CREATION_ERROR
                    }
                    _out_put['user']=CurrentSession;
                    res.status(200).json(_out_put);
                });
            });

        });

    },

	/**
	 * Save Data fo birth,
	 * @param req
	 * @param res
	 */
	saveGeneralInfo:function(req,res){
        var User = require('mongoose').model('User');
        var generalInfo ={
            dob:req.body.dob,
            country:req.body.country,
            zip:req.body.zip,
            status:3
        }
        User.saveUpdates(CurrentSession.id,generalInfo,function(resultSet){


            if(resultSet.status != 200){

                res.status(400).json({
                    status:"error",
                    message:Alert.ERROR_ON_GENERAL_INFO_ADDING
                });

            }
            var _cache_key = CacheEngine.prepareCaheKey(CurrentSession.token);
            CurrentSession['status']    = 3;
            CurrentSession['country']   = req.body.country;
            CacheEngine.updateCache(_cache_key,CurrentSession,function(cacheData){
                var  _out_put = {}
                _out_put = {
                    status:ApiHelper.getMessage(200,Alert.SUCCESS,Alert.INFO),
                    user:CurrentSession
                }
                if(!cacheData){
                    _out_put['extra']=Alert.CACHE_CREATION_ERROR
                }

                res.status(200).json(_out_put);
            });


            return 0;


        });
    },
    /**
     * Load Connections
     * @param req
     * @param res
     */
    getConnections:function(req,res){
        var User = require('mongoose').model('User');
        var criteria ={
            pg:0,
            country:CurrentSession.country
        };

        if(typeof req.query.pg  != 'undefined' &&
            req.query.pg != "" && req.query.pg > 1){
            criteria['pg'] = req.query.pg -1;
        }

        
        User.getConnectionUsers(criteria,function(resultSet){



            if(resultSet.status !== 400){
                var outPut	={};
                outPut['status'] = ApiHelper.getMessage(200,Alert.SUCCESS,Alert.SUCCESS);
                outPut['header'] ={
                    total_result:resultSet.totla_result,
                    result_per_page:Config.CONNECTION_RESULT_PER_PAGE,
                    current_page:req.query.pg,
                    total_pages:Math.ceil(resultSet.totla_result/Config.CONNECTION_RESULT_PER_PAGE)
                };

                outPut['connections'] = resultSet.users

                res.status(200).send(outPut);
            }else{
                outPut['status'] = ApiHelper.getMessage(400,Alert.CONNECTION_USERS_EMPTY,Alert.ERROR);

                res.status(400).send(outPut);
            }

        });

    },


    connect:function(req,res){

        var req_connected_users = JSON.parse(req.body.connected_users);
        console.log(req_connected_users.length);
        if(req_connected_users.length <= 0 ){
            var outPut={
                status : ApiHelper.getMessage(400,Alert.CONNECTED_USERS_NOT_SELECTED,Alert.ERROR)
            }
            res.status(400).send(outPut);
            return 0;
        }



        var connected_users =[],
            now = new Date(),
            Connection = require('mongoose').model('Connection');


        for(var i =0;req_connected_users.length > i; i++){
            connected_users.push({
                user_id:CurrentSession.id,
                connected_with:req_connected_users[i],
                created_at:now
            });
        }


        Connection.connect(connected_users,function(resultSet){
            var outPut ={};
            if(resultSet.status !== 200){
                outPut['status'] = ApiHelper.getMessage(400,Alert.CONNECT_ERROR,Alert.ERROR);
                res.status(400).send(outPut);
                return 0;
            }

            var _cache_key = CacheEngine.prepareCaheKey(CurrentSession.token);
            CurrentSession['status']    = 4;
            CacheEngine.updateCache(_cache_key,CurrentSession,function(cacheData){
                var  _out_put = {}
                _out_put = {
                    status:ApiHelper.getMessage(200,Alert.CONNECTED,Alert.SUCCESS),
                    user:CurrentSession
                }
                if(!cacheData){
                    _out_put['extra']=Alert.CACHE_CREATION_ERROR
                }
                res.status(200).json(_out_put);
            });

        });
    }

};







module.exports = UserControler; 