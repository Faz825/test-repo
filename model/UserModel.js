/**
 * User Model for communicate users collection in Database
 */

'use strict'
var  mongoose = require('mongoose'),
     Schema   = mongoose.Schema,
     bCrypt	  = require('bcrypt-nodejs');


var ImageSchema = new Schema({
    profile_image_name:{
        type:String,
        trim:true,
        default:null
    },
    profile_image_type:{
        type:String,
        trim:true,
        default:null
    }
});

/**
 * User Basic information
 */
var UserSchema = new Schema({
	first_name:{ 
		type:String, 
		trim:true,

	},
	last_name:{ 
		type:String, 
		trim:true 
	},
	email:{
		type:String,
		unique:"Email should be unique",
		trim:true
	},
	password:{
		type:String,
		trim:true
	},
	status:{
		type:Number,
		default:1 // 1 - COMPLETED CREATE YOUR ACCOUNT | 2 - COMPLETED CHOOSE YOUR SECRETARY | 3 - COMPLETED GENERAL INFORMATION
	},
	secretary:{
		 type: Schema.ObjectId, 
		 ref: 'Secretary',
		 default:null
	},
	country:{
		type:String,
		trim:true,
		default:null
	},
	dob:{
		type:String,
		trim:true,
		default:null
	},
	zip_code:{
		type:String,
		trim:true,
		default:null
	},

    images:[ImageSchema],

	created_at:{
		type:Date
	},
	updated_at:{
		type:Date
	}

},{collection:"users"});





var createHash = function(password){
 return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

UserSchema.pre('save', function(next){
  var now = new Date();
  this.updated_at = now;
  if ( !this.created_at ) {
    this.created_at = now;
  }
  next();
});

/**
 * Create User
 */
UserSchema.statics.create = function(UserData,callBack){


	var newUser = new this();
	newUser.first_name 	= UserData.first_name;
	newUser.last_name  	= UserData.last_name;
	newUser.email		= UserData.email;
	newUser.password	= createHash(UserData.password);
	newUser.status		= UserData.status;
	newUser.secretary	= UserData.secretary;
	newUser.save(function(err,resultSet){

		if(!err){
			callBack({
				status:200,
				user:{
                    id:resultSet._id,
                    token:createHash(resultSet._id+"---"+resultSet.email),
                    first_name:resultSet.first_name,
                    last_name:resultSet.last_name,
                    email:resultSet.email,
                    status:resultSet.status
                }

			});
		}else{
			console.log("Server Error --------")
			console.log(err)
			callBack({status:400,error:err});
		}

	});
	
}

/**
 * Get User By Email ID
 */
UserSchema.statics.findByEmail = function(email,callBack){
	var _this = this;

	_this.findOne({
		email:email
	},function(err,resultSet){
		if(!err){
			callBack({
				status:200,
				user:resultSet

			});
		}else{
			console.log("Server Error --------")
			callBack({status:400,error:err});
		}
	});


}

/**
 * Add Secretary for the user
 */
UserSchema.statics.addSecretary =function(userId,secretaryId,callBack){

    var _this = this;
    _this.update({_id:userId},
        {$set:{
            secretary:secretaryId,
            status:2
        }},function(err,resultSet){

            if(!err){
                callBack({
                    status:200
                });
            }else{
                console.log("Server Error --------")
                callBack({status:400,error:err});
            }
        });

}

/**
 * Update User profile based on the criterais
 * @param userId
 * @param data
 * @param callBack
 */
UserSchema.statics.saveUpdates=function(userId,data,callBack){
    var _this = this;

    _this.update({_id:userId},
        {$set:data},function(err,resultSet){
            if(!err){
                callBack({
                    status:200
                });
            }else{
                console.log("Server Error --------")
                callBack({status:400,error:err});
            }
        });
}

/**
 * Get Connection Users based on the logged user
 * @param userId
 * @param criteria
 * @param callBack
 */
UserSchema.statics.getConnectionUsers=function(criteria,callBack){
    var _this = this;

   _this.count({country:criteria.country},function(err,count){

       _this.find({country:criteria.country})
           .limit(Config.CONNECTION_RESULT_PER_PAGE)
           .skip(Config.CONNECTION_RESULT_PER_PAGE * criteria.pg)
           .sort({
               country:'asc'
           })
           .exec(function(err,resultSet){
               if(!err){

                   callBack({
                       status:200,
                       total_result:count,
                       users:_this.formatConnectionUserDataSet(resultSet)
                   })

               }else{
                   console.log("Server Error --------");
                   console.log(err);
                   callBack({status:400,error:err});
               }

           });

   });

}


/**
 * Format Connection users data
 * @param resultSet
 * @returns {*}
 */
UserSchema.statics.formatConnectionUserDataSet=function(resultSet){
    return resultSet;
}
mongoose.model('User',UserSchema);