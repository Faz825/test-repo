/**
 * User Model for communicate users collection in Database
 */

'use strict'
var  mongoose = require('mongoose'),
     Schema   = mongoose.Schema,
     bCrypt	  = require('bcrypt-nodejs'),
     uuid = require('node-uuid');

/**
 * Date Schema
 */
var DateObject ={
    year:{
        type:Number,
        trim:true,
        default:0
    },
    month:{
        type:Number,
        trim:true,
        default:0
    },
    date:{
        type:Number,
        trim:true,
        default:0
    }
}
/**
 * Education information
 */
var EducationSchema = new Schema({
    school:{
        type:String,
        trim:true,
        default:null
    },
    date_attended_from:{
        type:String,
        trim:true,
        default:null
    },
    date_attended_to:{
        type:String,
        trim:true,
        default:null
    },
    degree:{
        type:String,
        trim:true,
        default:null
    },
    grade:{
        type:String,
        trim:true,
        default:null
    },
    activities_societies:{
        type:String,
        trim:true,
        default:null
    },
    description:{
        type:String,
        trim:true,
        default:null
    }
});

/**
 * WorkingExperience Schema
 */
var WorkingExperienceSchema = new Schema({
    company_name:{
        type:String,
        trim:true,
        default:null
    },
    title:{
        type:String,
        trim:true,
        default:null
    },
    location:{
        type:String,
        trim:true,
        default:null
    },
    start_date:DateObject,
    left_date:DateObject,
    description:{
        type:String,
        trim:true,
        default:null
    },
    is_current_work_place:{
        type:Boolean,
        trim:true,
        default:true,
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
    user_name:{
        type:String,
        unique:"Username should be unique",
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

    education_details:[EducationSchema],

    skills:[{
        type: Schema.ObjectId,
        ref: 'Skill',
        default:null
    }],

    working_experiences:[WorkingExperienceSchema],

    /* For reset password */
    resetPasswordToken: {
        type:String,
        trim:true,
        default:null
    },
    resetPasswordExpires: {
        type: Date,
        default:null
    },

	created_at:{
		type:Date
	},
	updated_at:{
		type:Date
	}

},{collection:"users"});





var createHash = function(password){
 return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};

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
    newUser.user_name	= UserData.user_name;
	newUser.save(function(err,resultSet){

		if(!err){
			callBack({
				status:200,
				user:{
                    id:resultSet._id,
                    token:uuid.v1(),
                    first_name:resultSet.first_name,
                    last_name:resultSet.last_name,
                    email:resultSet.email,
                    status:resultSet.status,
                    user_name:resultSet.user_name
                }

			});
		}else{
			console.log("Server Error --------")
			console.log(err)
			callBack({status:400,error:err});
		}

	});
	
};

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


};

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

};

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
};

/**
 * Get Connection Users based on the logged user
 * @param userId
 * @param criteria
 * @param callBack
 */
UserSchema.statics.getConnectionUsers=function(criteria,callBack){

    var _async = require('async'),
        Connection = require('mongoose').model('Connection'),
        _this = this;

    _async.waterfall([
        function getUsersConnections(callBack){
            Connection.getConnectedUserIds(criteria.user_id,function(usersConnection){

                if(usersConnection.status == 200){
                    callBack(null,usersConnection.connected_user_ids)
                }
            });
        },
        function getAllUsers(connectedUserIds,callBack){


            var _criteria ={
                country:criteria.country,
                _id: { $ne: criteria.user_id }
            };

            _this.count(_criteria,function(err,count){

                _this.find(_criteria)
                    .limit(Config.CONNECTION_RESULT_PER_PAGE)
                    .skip(Config.CONNECTION_RESULT_PER_PAGE * criteria.pg)
                    .sort({
                        country:'asc'
                    })
                    .exec(function(err,resultSet){
                        if(!err){


                            callBack(null,{
                                total_result:count,
                                users:_this.formatConnectionUserDataSet(resultSet),
                                connected_user_ids:connectedUserIds
                            })

                        }else{
                            console.log("Server Error --------");
                            console.log(err);
                            callBack({status:400,error:err});
                        }

                    });
            });
        },
        function mergeConnection(connections,callBack){
            var _connected_user_ids =connections. connected_user_ids,
                _formattedConnection =[],
                _connectedUsers = connections.users;



            for(var i =0;i<_connectedUsers.length;i++){
                var _c_users ={};
                _c_users = _connectedUsers[i];
                _connectedUsers[i]['is_connected'] = 0;


                if(_connected_user_ids.indexOf(_c_users.user_id.toString()) != -1){
                    _connectedUsers[i]['is_connected'] = 1;


                }

                _formattedConnection.push(_connectedUsers[i]);

            }
            callBack(null,{
                total_result: connections.total_result,
                users:_formattedConnection
            })
        }


    ],function(err,resultSet){

        if(!err){
            callBack(resultSet)
        }else{
            console.log("LOOP ERROR")
            console.log(err)
        }

    });

};



/**
 * Add Education Details to a user
 * @param userId
 * @param educationDetails
 * @param callBack
 */
UserSchema.statics.addEducationDetail = function(userId, educationDetails, callBack){

    var _this = this;

    var _educationDetails = {
        school:educationDetails.school,
        date_attended_from:educationDetails.date_attended_from,
        date_attended_to:educationDetails.date_attended_to,
        degree:educationDetails.degree,
        grade:educationDetails.grade,
        activities_societies:educationDetails.activities_societies,
        description:educationDetails.description
    };

    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }

    _this.update(
        {_id:userId},
        {
            $set:{
                created_at:this.created_at,
                updated_at:this.updated_at
            },
            $push:{
                education_details:_educationDetails
            }
        },function(err,resultSet){
            if(!err){
                callBack({
                    status:200
                });
            }else{
                console.log("Server Error --------")
                callBack({status:400,error:err});
            }
        });

};


/**
 * retrieve particular educational detail of a user
 * @param userId
 * @param _education_id
 * @param callBack
 */
UserSchema.statics.retrieveEducationDetail = function(criteria, callBack){

    var _this = this;
    _this.findOne(criteria)
        .exec(function(err,resultSet){
            var ue = _this.formatEducation(resultSet);
            if(!err){
                callBack({
                    status:200,
                    user:ue

                });
            }else{
                console.log("Server Error --------")
                callBack({status:400,error:err});
            }
        });


};


/**
 * update particular educational detail of a user
 * @param userId
 * @param educationDetails
 * @param callBack
 */
UserSchema.statics.updateEducationDetail = function(userId, educationDetails, callBack){

    var _this = this;
    _this.update({_id:userId,"education_details._id":educationDetails._id},
        {$set:{
            "education_details.$.school":educationDetails.school,
            "education_details.$.date_attended_from":educationDetails.date_attended_from,
            "education_details.$.date_attended_to":educationDetails.date_attended_to,
            "education_details.$.degree":educationDetails.degree,
            "education_details.$.grade":educationDetails.grade,
            "education_details.$.activities_societies":educationDetails.activities_societies,
            "education_details.$.description":educationDetails.description,
        }},function(err,resultSet){
            if(!err){
                callBack({
                    status:200
                });
            }else{
                console.log("Server Error --------")
                console.log(err)
                callBack({status:400,error:err});
            }
        });

};


/**
 * delete particular educational detail of a user
 * @param userId
 * @param educationId
 * @param callBack
 */
UserSchema.statics.deleteEducationDetail = function(userId, educationId, callBack){

    var _this = this;

    _this.update({_id:userId},
        { $pull: { education_details: { _id: educationId } } },function(err,resultSet){
            if(!err){
                callBack({
                    status:200
                });
            }else{
                console.log("Server Error --------")
                callBack({status:400,error:err});
            }
        });

};


/**
 * WORKING EXPERIENCE SECTION
 */


/**
 * Add Working Experience Details
 * @param userId
 * @param workingExperienceDetails
 * @param callBack
 */
UserSchema.statics.addWorkingExperience =function(userId,workingExperienceDetails,callBack){

    var _this = this;

    var _workingExperienceDetails = {
        company_name:workingExperienceDetails.company_name,
        title:workingExperienceDetails.title,
        location:workingExperienceDetails.location,
        start_date:workingExperienceDetails.start_date,
        end_date:workingExperienceDetails.end_date,
        is_current_work_place:workingExperienceDetails.is_current_work_place,
        description:workingExperienceDetails.description
    }

console.log(_workingExperienceDetails);
    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }

    _this.update(
        {_id:userId},
        {
            $set:{
                created_at:this.created_at,
                updated_at:this.updated_at
            },
            $push:{
                working_experiences:_workingExperienceDetails
            }
        },function(err,resultSet){
            if(!err){
                callBack({
                    status:200
                });
            }else{
                console.log("Server Error --------")
                console.log(err)
                callBack({status:400,error:err});
            }
        });

}

/**
 * Update Working Experience
 * @param userId
 * @param workingExperienceDetails
 * @param callBack
 */
UserSchema.statics.updateWorkingExperience =function(userId, workingExperienceDetails, callBack){
    var _this = this;
    _this.update({_id:userId,"working_experiences._id":workingExperienceDetails._id},
        {$set:{
            "working_experiences.$.company_name":workingExperienceDetails.company_name,
            "working_experiences.$.title":workingExperienceDetails.title,
            "working_experiences.$.location":workingExperienceDetails.location,
            "working_experiences.$.start_date":workingExperienceDetails.start_date,
            "working_experiences.$.left_date":workingExperienceDetails.left_date,
            "working_experiences.$.is_current_work_place":workingExperienceDetails.is_current_work_place,
            "working_experiences.$.description":workingExperienceDetails.description,
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
 * Delete Working Experience
 * @param userId
 * @param workingExperienceId
 * @param callBack
 */
UserSchema.statics.deleteWorkingExperience = function(userId, workingExperienceId, callBack){

    var _this = this;

    _this.update({_id:userId},
        { $pull: { working_experiences: { _id: workingExperienceId } } },function(err,resultSet){
            if(!err){
                callBack({
                    status:200
                });
            }else{
                console.log("Server Error --------")
                callBack({status:400,error:err});
            }
        });
};

/**
 * Add Collage and Nob detail summery
 * This function is only for add genral information about Job and Collage information.
 * Other fields are in set to null
 * @param userId
 * @param data
 * @param callBack
 */
UserSchema.statics.addCollageAndJob = function(userId,data,callBack) {
    var _this = this;

    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }


    var _educationDetails = {
        school:data.school,
        date_attended_to:data.grad_date,
    }

    var _workingExperienceDetails = {
        company_name:data.company_name,
        title:data.job_title,

    }
    _this.update({_id:userId},
        {$unset:{
            "education_details":[],
            "working_experiences":[]}},{multi:true},
        function(err,resultSet) {


            if (!err) {
                _this.update(
                    {_id: userId},
                    {
                        $set: {
                            created_at: _this.created_at,
                            updated_at: _this.updated_at
                        },
                        $push: {
                            education_details: _educationDetails,
                            working_experiences: _workingExperienceDetails
                        }
                    }, function (err, resultSet) {
                        console.log(resultSet)
                        if (!err) {
                            callBack({
                                status: 200
                            });
                        } else {
                            console.log("Server Error --------")
                            callBack({status: 400, error: err});
                        }
                    });
            } else {
                console.log("Server Error --------")
                console.log(err)
                callBack({status: 400, error: err});
            }
        });


};


/**
 * Add skills to a user
 * @param userId
 * @param skills
 * @param callBack
 */
UserSchema.statics.addSkills = function(userId, skills, callBack){

    var _this = this;

    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }

    _this.update(
        {_id:userId},
        {
            $set:{
                created_at:this.created_at,
                updated_at:this.updated_at
            },
            $push:{
                skills:{$each:skills}
            }
        },function(err,resultSet){
            if(!err){
                callBack({
                    status:200
                });
            }else{
                console.log("Server Error --------", err);
                callBack({status:400,error:err});
            }
        });

};


/**
 * delete skills from a user
 * @param userId
 * @param skills
 * @param callBack
 */
UserSchema.statics.deleteSkills = function(userId, skills, callBack){

    var _this = this;

    _this.update({_id:userId},
        { $pull: { skills: {$in:skills} } },function(err,resultSet){
            if(!err){
                callBack({
                    status:200
                });
            }else{
                console.log("Server Error --------")
                callBack({status:400,error:err});
            }
        });


};


/**
 * Get User By Search Criteria
 */
UserSchema.statics.findByCriteria = function(criteria,callBack){
    var _this = this;

    _this.findOne(criteria,function(err,resultSet){

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

};



/**
 * Update User profile based on the criteria
 * @param userId
 * @param data
 * @param callBack
 */
UserSchema.statics.updatePassword=function(userId,password,callBack){
    var _this = this;

    var info = {
        password:createHash(password),
        resetPasswordToken:null,
        resetPasswordExpires:null
    }

    _this.update({_id:userId},
        {$set:info},function(err,resultSet){
            if(!err){
                callBack({
                    status:200
                });
            }else{
                console.log("Server Error --------")
                callBack({status:400,error:err});
            }
        });
};

/**
 * Get user Based on User Id
 * @param userId
 * @param callBack
 */
UserSchema.statics.getUser=function(criteria,showOptions,callBack){
    var _this = this;

    _this.findOne(criteria)
        .exec(function(err,resultSet){
            if(!err){
                callBack({
                    status:200,
                    user:_this.formatUser(resultSet,showOptions)

                });
            }else{
                console.log("Server Error --------")
                callBack({status:400,error:err});
            }
    });
}

/**
 * DATA FORMATTER HELPER FUNCTION WILL DEFINE HERE
 */




/**
 * Format User object
 * @param userObject
 * @returns {*}
 */
UserSchema.statics.formatUser=function(userObject,showOptions){

    if(userObject){
        var _temp_user = {
            user_id: userObject._id.toString(),
            email: userObject.email,
            first_name: userObject.first_name,
            last_name: userObject.last_name,
            zip_code: userObject.zip_code,
            dob: userObject.dob,
            country:userObject.country
        };
        for(var i=0;i<userObject.working_experiences.length;i++){
            if(userObject.working_experiences[i].is_current_work_place){
                _temp_user['cur_working_at']=userObject.working_experiences[i].company_name;
                _temp_user['cur_designation']=userObject.working_experiences[i].title;
            }

        }
        if(typeof showOptions != 'undefined' && showOptions.w_exp){
            _temp_user['working_experiences'] = [];
            _temp_user['working_experiences'] = this.formatWorkingExperiences(userObject);
        }
        if(typeof showOptions != 'undefined' && showOptions.edu){
            _temp_user['education_details'] =[];
            _temp_user['education_details'] = this.formatEducation(userObject);
        }


        return _temp_user
    }

    return null;
}

/**
 * Format Education Detail
 * @param userObject
 */
UserSchema.statics.formatEducation = function(userObject){
        var _temp_user = []
        for(var i=0;i<userObject.education_details.length;i++){
            _temp_user.push({
                "edu_id" :userObject.education_details[i]._id,
                "description" : userObject.education_details[i].description,
                "activities_societies" : userObject.education_details[i].activities_societies,
                "grade" : userObject.education_details[i].grade,
                "degree" : userObject.education_details[i].degree,
                "date_attended_to" : userObject.education_details[i].date_attended_to,
                "date_attended_from" : userObject.education_details[i].date_attended_from,
                "school" :userObject.education_details[i].school
            });
        }
        return _temp_user;

}


UserSchema.statics.formatWorkingExperiences = function(userObject){
    var _temp_we = [],
        _tmp_start_years=[],

        _tmp_we_by_year ={};
    for(var i=0;i<userObject.working_experiences.length;i++){


        if(userObject.working_experiences[i].is_current_work_place){
            _temp_we.push({
                "exp_id" :userObject.working_experiences[i]._id,
                "company_name" : userObject.working_experiences[i].company_name,
                "title" : userObject.working_experiences[i].title,
                "location" : userObject.working_experiences[i].location,
                "start_date" : userObject.working_experiences[i].start_date,
                "left_date" : userObject.working_experiences[i].left_date,
                "description" : userObject.working_experiences[i].description,
                "is_current_work_place" :userObject.working_experiences[i].is_current_work_place
            });
        }else{
            var _strt_year = userObject.working_experiences[i].start_date.year;
            if(_tmp_start_years.indexOf(Number(_strt_year)) == -1)
                _tmp_start_years.push(Number(_strt_year));

            if( typeof _tmp_we_by_year[_strt_year] == 'undefined' )
                _tmp_we_by_year[_strt_year] =[];
            _tmp_we_by_year[_strt_year].push({
                "exp_id" :userObject.working_experiences[i]._id,
                "company_name" : userObject.working_experiences[i].company_name,
                "title" : userObject.working_experiences[i].title,
                "location" : userObject.working_experiences[i].location,
                "start_date" : userObject.working_experiences[i].start_date,
                "left_date" : userObject.working_experiences[i].left_date,
                "description" : userObject.working_experiences[i].description,
                "is_current_work_place" :userObject.working_experiences[i].is_current_work_place
            });
        }

    }

    _tmp_start_years.sort(function(a,b){
        return b - a;
    });
    for(var i = 0 ; i< _tmp_start_years.length;i++){
        var _year = _tmp_start_years[i];
        for(var a = 0 ; a< _tmp_we_by_year[_year].length;a++){
            _temp_we.push(_tmp_we_by_year[_year][a]);
        }


    }




    return _temp_we;

}
/**
 * Format Connection users data
 * @param resultSet
 * @returns {*}
 */
UserSchema.statics.formatConnectionUserDataSet=function(resultSet){
    var _tmp_object =[];
    for(var i=0;i<resultSet.length;i++){

        _tmp_object.push(this.formatUser(resultSet[i]));
    }
    return _tmp_object;
};


mongoose.model('User',UserSchema);