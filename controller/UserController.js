
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

        var secretary ={
            secretary:req.body.secretary,
            status:2
        }
        User.update(CurrentSession.id,req.body.secretary,function(resultSet){
            Secretary.getSecretaryById(req.body.secretary,function(resultSet){
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

    }

};





module.exports = UserControler; 