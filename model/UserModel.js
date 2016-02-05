/**
 * User Model for communicate users collection in Database
 */

'use strict'
var  mongoose = require('mongoose'),
     Schema   = mongoose.Schema,
     bCrypt	  = require('bcrypt-nodejs');




var UserSchema = new Schema({
	first_name:{ 
		type:String, 
		trim:true 
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
		default:1 // 1 - CREATE YOUR ACCOUNT | 2 - CHOOSE YOUR SECRETARY  
	},
	secretary:{
		 type: Schema.ObjectId, 
		 ref: 'Secretary',
		 default:null
	},
	created_at:{
		type:Date
	},
	upadted_at:{
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
	newUser.status		= 1;
	newUser.save(function(err,resultSet){

		if(!err){
			callBack({
				status:200,
				user:resultSet

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

mongoose.model('User',UserSchema);