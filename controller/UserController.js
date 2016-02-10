
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
            zip:req.body.zip
        }
        User.saveUpdates(CurrentSession.id,generalInfo,function(resultSet){

            if(resultSet.status != 200){

                res.status(400).json({
                    status:"error",
                    message:Alert.ERROR_ON_GENERAL_INFO_ADDING
                });

            }

            res.status(200).json({
                status:"success",
                message:Alert.ADDED_GENERAL_INFO
            });

            return 0;


        });
    }

};





module.exports = UserControler; 