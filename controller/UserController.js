
'use strict'

var UserControler ={

	doSignup:function(req,res){
		var User = require('mongoose').model('User');

		var user ={
			first_name:"Piusha",
			last_name:"Kalyana",
			email:"piusha2@gmail.com",
			password:"1234",
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

					var _cache_key = CacheEngine.prepareCaheKey(_ResultSet.user._id);
					CacheEngine.addToCache(_cache_key,_ResultSet.user,function(cacheData){
						
						var _out_put= {
							status:'sucess',
							message:Alert.ACCOUNT_CREATION_SUCCESS
						}	
						if(cacheData){
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
		
	}

};


module.exports = UserControler; 