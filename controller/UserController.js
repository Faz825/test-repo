
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
            secretary:req.body.secretary,
            user_name:req.body.email.replace(/@.*$/,"")
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

                    var _cache_key = CacheEngine.prepareCacheKey(_ResultSet.user.token);
                    CacheEngine.addToCache(_cache_key,_ResultSet.user,function(cacheData){

                        var _out_put= {
                            status:'success',
                            message:Alert.ACCOUNT_CREATION_SUCCESS
                        }
                        if(!cacheData){
                            _out_put['extra']=Alert.CACHE_CREATION_ERROR
                        }

                        _out_put['user']=_ResultSet.user;

                        res.render('email-templates/signup', {
                            name: _ResultSet.user.first_name,
                        }, function(err, emailHTML) {

                            var sendOptions = {
                                to: _ResultSet.user.email,
                                subject: 'Proglobe Signup',
                                html: emailHTML
                            };
                            EmailEngine.sendMail(sendOptions, function(err){
                                if(!err){
                                    console.log("Email Send")
                                } else{
                                    console.log("EMAIL Sending Error");
                                    console.log(err);
                                }
                            });
                            res.status(200).json(_out_put);
                            return 0
                        });
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
                var _cache_key = CacheEngine.prepareCacheKey(CurrentSession.token);
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
            var _cache_key = CacheEngine.prepareCacheKey(CurrentSession.token);
            CurrentSession['status']        = 3;
            CurrentSession['country']       = req.body.country;
            CurrentSession['dob']           = req.body.dob;
            CurrentSession['zip']           = req.body.zip;


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
            country:CurrentSession.country,
            user_id:CurrentSession.id,
            status: [ConnectionStatus.REQUEST_ACCEPTED, ConnectionStatus.REQUEST_SENT]
        };


        User.getConnectionUsers(criteria,function(resultSet){

            var outPut	={};

            if(resultSet.status !== 400){

                outPut['status'] = ApiHelper.getMessage(200,Alert.SUCCESS,Alert.SUCCESS);
                outPut['header'] ={
                    total_result:resultSet.total_result,
                    result_per_page:Config.CONNECTION_RESULT_PER_PAGE,
                    total_pages:Math.ceil(resultSet.total_result/Config.CONNECTION_RESULT_PER_PAGE)
                };

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
     * Connect Peoples
     * Even though connected_users object empty nothing but user hit skip button, Current session should be set to 4.
     * @param req
     * @param res
     */
    connect:function(req,res){
        var _cache_key = CacheEngine.prepareCacheKey(CurrentSession.token);
        CurrentSession['status']    = 5;
        CacheEngine.updateCache(_cache_key,CurrentSession,function(cacheData){
            var outPut ={};
            outPut['status'] =  ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
            outPut['user']=CurrentSession;

            var req_connected_users = JSON.parse(req.body.connected_users);
            var req_unconnected_users = JSON.parse(req.body.unconnected_users);



            var Connection = require('mongoose').model('Connection');

            Connection.sendConnectionRequest(req_connected_users,req_unconnected_users, function (resultSet) {

                if (resultSet.status !== 200) {
                    outPut['status'] = ApiHelper.getMessage(400, Alert.CONNECT_ERROR, Alert.ERROR);
                    res.status(400).send(outPut);
                    return 0;
                }

                if (!cacheData) {
                    outPut['extra'] = Alert.CACHE_CREATION_ERROR
                }

                res.status(200).json(outPut);
                return 0;
            });

        });
    },

    /**
     * Add new category to the user
     * @param req
     * @param res
     */
    addNewsCategory:function(req,res){
        var _cache_key = CacheEngine.prepareCacheKey(CurrentSession.token);
        CurrentSession['status']    = 6;

        CacheEngine.updateCache(_cache_key,CurrentSession,function(cacheData){
            var outPut ={};
            outPut['status'] =  ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
            outPut['user']=CurrentSession;

            var req_news_categories = JSON.parse(req.body.news_categories);

            if(req_news_categories.length >= 1 ) {

                var FavouriteNewsCategory = require('mongoose').model('FavouriteNewsCategory');
                var news_categories = [],
                    now = new Date();

                for (var i = 0; req_news_categories.length > i; i++) {
                    news_categories.push({
                        user_id: CurrentSession.id.toObjectId(),
                        category: null,
                        created_at: now
                    });
                }


                FavouriteNewsCategory.addUserNewsCategory(news_categories,function(resultSet){

                    if (resultSet.status !== 200) {
                        outPut['status'] = ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR);
                        res.status(400).send(outPut);
                        return 0;
                    }
                    if (!cacheData) {
                        outPut['extra'] = Alert.CACHE_CREATION_ERROR
                    }

                    res.status(200).json(outPut);
                    return 0;
                });

            }else{
                res.status(200).json(outPut);
                return 0;
            }
        });
    },

    uploadProfileImage:function(req,res){


        if(typeof req.body.profileImg == 'undefined' || typeof req.body.profileImg == "") {
            var outPut={
                status: ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR)
            };
            res.status(400).send(outPut);
            return 0;
        }
        var User = require('mongoose').model('User');
        var data ={
            content_title:"Profile Image",
            file_name:req.body.profileImg,
            is_default:1,
            entity_id:CurrentSession.id,
            entity_tag:UploadMeta.PROFILE_IMAGE
        }
        ContentUploader.uploadFile(data,function (payLoad) {

            if (payLoad.status != 400) {
                var _cache_key = CacheEngine.prepareCacheKey(CurrentSession.token);
                CurrentSession['status'] = 7;
                CurrentSession['profile_image'] = payLoad.http_url;


                CacheEngine.updateCache(_cache_key, CurrentSession, function (cacheData) {
                    var outPut = {
                        status: ApiHelper.getMessage(200, Alert.ADDED_PROFILE_IMAGE, Alert.SUCCESS)
                    }
                    if (!cacheData) {
                        outPut['extra'] = Alert.CACHE_CREATION_ERROR
                    }
                    outPut['user'] = CurrentSession;

                    //ADD TO CACHE
                    User.addUserToCache(CurrentSession.id,function(csResult){});


                    res.status(200).json(outPut);
                });




            } else {
                var outPut={
                    status: ApiHelper.getMessage(400, Alert.ERROR_UPLOADING_IMAGE, Alert.ERROR)
                };
                res.status(400).send(outPut);
            }
        });

    },

    /**
     * Upload cover image
     * @param req
     * @param res
     */
    uploadCoverImage:function(req,res){
        if(typeof req.body.cover_img == 'undefined' || typeof req.body.cover_img == "") {
            var outPut={
                status: ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR)
            };
            res.status(400).send(outPut);
            return 0;
        }

        var User = require('mongoose').model('User');
        var data ={
            content_title:"Cover Image",
            file_name:req.body.cover_img,
            is_default:1,
            entity_id:CurrentSession.id,
            entity_tag:UploadMeta.COVER_IMAGE
        }
        ContentUploader.uploadFile(data,function (payLoad) {

            if (payLoad.status != 400) {
                var _cache_key = CacheEngine.prepareCacheKey(CurrentSession.token);
                CurrentSession['cover_image'] = payLoad.http_url;


                CacheEngine.updateCache(_cache_key, CurrentSession, function (cacheData) {
                    var outPut = {
                        status: ApiHelper.getMessage(200, Alert.ADDED_PROFILE_IMAGE, Alert.SUCCESS)
                    }
                    if (!cacheData) {
                        outPut['extra'] = Alert.CACHE_CREATION_ERROR
                    }
                    outPut['user'] = CurrentSession;

                    //ADD TO CACHE
                    User.addUserToCache(CurrentSession.id,function(csResult){});

                    res.status(200).json(outPut);
                });




            } else {
                var outPut={
                    status: ApiHelper.getMessage(400, Alert.ERROR_UPLOADING_IMAGE, Alert.ERROR)
                };
                res.status(400).send(outPut);
            }
        });



    },

    /**
     * Add educational details to a user
     * @param req
     * @param res
     */
    addEducationDetail:function(req, res){

        var User = require('mongoose').model('User');

        //var educationDetails = req.body.educationDetails;

        //var _educationDetails = {
        //    school:"Westminster",
        //    date_attended_from:"2012",
        //    date_attended_to:"2015",
        //    degree:"MSc in Advanced Software Engineering",
        //    grade:"Merit",
        //    activities_societies:"Debate Team",
        //    description:"It was wonderful"
        //};

        var _educationDetails = {
            school:"Middlesex",
            date_attended_from:"2007",
            date_attended_to:"2010",
            degree:"BSc in IT",
            grade:"Merit",
            activities_societies:"Debate Team",
            description:"It was wonderful"
        };

        //var _userId = CurrentSession.id;

        var _userId = "56c2d6038c920a41750ac4db";

        User.addEducationDetail(_userId,_educationDetails,function(resultSet){
            res.status(200).json(resultSet);
        });

    },

    /**
     * Retrieve particular educational detail of a user
     * @param req
     * @param res
     */
    retrieveEducationDetail:function(req, res){

        var User = require('mongoose').model('User');

        if(typeof req.params['uname'] == 'undefined'){
            var outPut ={};
            outPut['status']    = ApiHelper.getMessage(400, Alert.CANNOT_FIND_PROFILE, Alert.ERROR);
            res.status(400).send(outPut);
        }



        var criteria = {user_name:req.params['uname']},
            showOptions ={
                w_exp:true,
                edu:true,
                skill:false
            };
        User.getUser(criteria,showOptions,function(resultSet){
            var outPut ={};
            if(resultSet.status != 200){
                outPut['status'] = ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR);
                res.status(400).json(outPut);
                return 0;
            }

            outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
            outPut['user'] =resultSet.user;
            res.status(200).send(outPut);



        });

    },

    /**
     * Update particular educational detail of a user
     * @param req
     * @param res
     */
    updateEducationDetail:function(req, res){

        var User = require('mongoose').model('User');

        //var _userId = CurrentSession.id;

        var _userId = CurrentSession.id;

        var _educationDetails = {
            school:req.body.school,
            date_attended_from:req.body.date_attended_from,
            date_attended_to:req.body.date_attended_to,
            degree:req.body.degree,
            grade:req.body.grade,
            activities_societies:req.body.activities_societies,
            description:req.body.description
        };
        if(req.body.edu_id){
            _educationDetails['_id'] = req.body.edu_id;
            User.updateEducationDetail(_userId,_educationDetails,function(resultSet){

                var outPut ={};
                if(resultSet.status != 200){
                    outPut['status'] = ApiHelper.getMessage(400, Alert.DATA_UPDATE_ERROR, Alert.ERROR);
                    res.status(400).json(outPut);
                    return 0;
                }

                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['user'] =resultSet.user;
                res.status(200).send(outPut);


            });
        }else{
            User.addEducationDetail(_userId,_educationDetails,function(resultSet){

                var outPut ={};
                if(resultSet.status != 200){
                    outPut['status'] = ApiHelper.getMessage(400, Alert.DATA_INSERT_ERROR, Alert.ERROR);
                    res.status(400).json(outPut);
                    return 0;
                }

                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['user'] =resultSet.user;
                res.status(200).send(outPut);


            });
        }



    },

    /**
     * delete particular educational detail of a user
     * @param req
     * @param res
     */
    deleteEducationDetail:function(req, res){

        var User = require('mongoose').model('User');

        //var _userId = CurrentSession.id;

        var _userId = "56c2d6038c920a41750ac4db";

        var _education_id = "56c321a42ab09c7b09034e85";

        User.deleteEducationDetail(_userId,_education_id,function(resultSet){
            res.status(200).json(resultSet);
        });

    },

    addCollageAndJob:function(req,res){
        var _cache_key = CacheEngine.prepareCacheKey(CurrentSession.token);
        CurrentSession['status']        = 4;
        CurrentSession['school']        = (req.body.school)?req.body.school:null;
        CurrentSession['grad_date']     = (req.body.grad_date)?req.body.grad_date:null;
        CurrentSession['job_title']     = (req.body.job_title)?req.body.job_title:null;
        CurrentSession['company_name']  = (req.body.company_name)?req.body.company_name:null;

        CacheEngine.updateCache(_cache_key,CurrentSession,function(cacheData){

            var User = require('mongoose').model('User'),
                _collageAndJob={
                    school:req.body.school,
                    grad_date:req.body.grad_date,
                    job_title:req.body.job_title,
                    company_name:req.body.company_name,
                };

            User.addCollageAndJob(CurrentSession.id,_collageAndJob,function(resultSet){
                var outPut ={};

                if(resultSet.status != 200){
                    outPut['status'] = ApiHelper.getMessage(400, Alert.FAILED_TO_ADD_JOB_AND_COLLAGE, Alert.ERROR);
                    res.status(200).json(outPut);
                    return 0;
                }
                if(!cacheData){
                    outPut['extra']=Alert.CACHE_CREATION_ERROR
                }
                outPut['status']    = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['user']      = CurrentSession;
                res.status(200).json(outPut);




            });

        });
    },

    /**
     * add / delete skills of a user
     * @param req
     * @param res
     * @param next
     */
    saveSkillInfo:function(req,res){

        var async = require('async'),
            User = require('mongoose').model('User');

        // Need to COMMENT these

        var skill_sets = JSON.parse(req.body.skill_set);

        //GET EXPERIENCED SKILLS
        var existing_skills =[],deleted_skills=[];


        for(var a =0;a<skill_sets.experienced.add.length;a++){
            existing_skills.push({
                skill_id:skill_sets.experienced.add[a],
                is_day_to_day_comfort:0

            })
        }


        for(var a =0;a<skill_sets.day_to_day_comforts.add.length;a++){
            existing_skills.push({
                skill_id:skill_sets.day_to_day_comforts.add[a],
                is_day_to_day_comfort:1
            })
        }
        for(var a =0;a<skill_sets.experienced.remove.length;a++){
            deleted_skills.push(skill_sets.experienced.remove[a])
        }
        for(var a =0;a<skill_sets.day_to_day_comforts.remove.length;a++){
            deleted_skills.push(skill_sets.day_to_day_comforts.remove[a])
        }
        var userId = CurrentSession.id;

        //TODO : If user added new skills that are not in Skill Collection



        async.parallel([

            function(callback){

                if(existing_skills.length > 0){
                    User.addSkills(userId, existing_skills, function(resultSet){
                        callback(null);
                    })
                } else{
                    callback(null);
                }

            },
            function(callback){

                if(deleted_skills.length > 0){
                    User.deleteSkills(userId, deleted_skills, function(resultSet){
                        callback(null);
                    })
                } else{
                    callback(null);
                }
            }

        ], function(err){
            if (!err){
                res.status(200).send(ApiHelper.getMessage(200, Alert.SKILL_SAVED, Alert.SUCCESS));
            }else{
                res.status(400).send(ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR));
            };
        })

    },

    /**
     * Get Skills
     * @param req
     * @param ress
     */
    getSkills:function(req,res){
        var User = require('mongoose').model('User');

        var criteria = {user_name:req.params['uname']},
            showOptions ={
                skill:true
            };
        User.getUser(criteria,showOptions,function(resultSet) {
            var outPut = {};
            if (resultSet.status != 200) {
                outPut['status'] = ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR);
                res.status(400).json(outPut);
                return 0;
            }


            User.formatSkills(resultSet.user,function(skillsData){
                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['user'] = resultSet.user;
                outPut['user']['skills'] = skillsData;

                res.status(200).send(outPut);
            })

        })

    },
    forgotPassword:function(req,res){

        var async = require('async'),
            crypto = require('crypto'),
            User = require('mongoose').model('User');

        async.waterfall([
            // Generate random token
            function(done) {
                crypto.randomBytes(20, function(err, buffer) {
                    var token = buffer.toString('hex');
                    done(null, token);
                });
            },
            // Lookup user by username
            function(token, done) {
                //if (req.body.email) {
                if (req.params.email) {
                    //var email = req.body.email;
                    var email = req.params.email;

                    User.findByEmail(email,function(ResultSet) {

                        if (ResultSet.status == 200 && ResultSet.user != null) {

                            var generalInfo ={
                                resetPasswordToken:token,
                                resetPasswordExpires:Date.now() + 3600000  // 1 hour from requested time
                            }
                            User.saveUpdates(ResultSet.user._id,generalInfo,function(resultSet){
                                done(null, token, ResultSet.user);
                            });

                        } else{
                            res.status(400).json(ApiHelper.getMessage(400, Alert.NO_ACCOUNT_FOUND, Alert.ERROR));
                        }
                    });

                } else {
                    res.status(400).json(ApiHelper.getMessage(400, Alert.EMAIL_EMPTY, Alert.ERROR));
                }
            },
            function(token, user, done) {

                res.render('email-templates/resetPassword', {
                    name: user.first_name,
                    url: 'http://'+req.headers.host + '/forgot-password/reset/' + token
                }, function(err, emailHTML) {
                    done(null, emailHTML, user);
                });

            },
            // If valid email, send reset email using service
            function(emailHTML, user) {

                var sendOptions = {
                    to: user.email,
                    subject: 'Password Reset',
                    html: emailHTML
                };
                EmailEngine.sendMail(sendOptions, function(err){
                    if(!err){
                        res.status(200).json(ApiHelper.getMessage(200, Alert.FORGOT_PASSWORD_EMAIL_SENT, Alert.SUCCESS));
                    } else{
                        res.status(400).json(ApiHelper.getMessage(400, Alert.FAILED_TO_SEND_EMAIL, Alert.ERROR));
                    }
                });

            }
        ], function(err) {
            if (err) return next(err);
        });

    },

    /**
     * to test valid reset password request
     * @param req
     * @param res
     */
    validateToken:function(req,res){

        var User = require('mongoose').model('User');

        User.findByCriteria({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: {
                $gt: Date.now()
            }
        }, function(ResultSet) {

                if (ResultSet.status == 200 && ResultSet.user != null) {
                    //Don't need to send any response. need to do redirection
                    res.status(200).json(ApiHelper.getMessage(200, Alert.VALID_TOKEN, Alert.SUCCESS));
                    //res.redirect('/#!/password/reset/' + req.params.token);
                } else{
                    //Don't need to send any response. need to do redirection
                    res.status(400).json(ApiHelper.getMessage(400, Alert.INVALID_TOKEN, Alert.ERROR));
                    //res.redirect('/#!/password/reset/invalid');
                }

        });

    },

    resetPassword:function(req,res){

        var User = require('mongoose').model('User');

        //var password = req.body.password;
        var password = "abcdefg";
        User.findByCriteria({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: {
                $gt: Date.now()
            }
        }, function(ResultSet) {

            if (ResultSet.status == 200 && ResultSet.user != null) {

                User.updatePassword(ResultSet.user._id,password,function(resultSet){

                    if(resultSet.status ==200){
                        res.status(200).json(ApiHelper.getMessage(200, Alert.RESET_PASSWORD_SUCCESS, Alert.SUCCESS));
                    } else{
                        res.status(400).json(ApiHelper.getMessage(400, Alert.RESET_PASSWORD_FAIL, Alert.ERROR));
                    }

                });

            } else{
                //Don't need to send any response. need to do redirection
                res.status(400).json(ApiHelper.getMessage(400, Alert.INVALID_TOKEN, Alert.ERROR));
                //res.redirect('/#!/password/reset/invalid');
            }

        });

    },
    /**
     * Get Connection count
     * @param req
     * @param res
     */
    connectionCount:function(req,res){
        var Connection = require('mongoose').model('Connection');


        Connection.getConnectionCount(CurrentSession.id,function(connectionCount){
            var outPut = {};
            outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
            outPut['connection_count'] = connectionCount;
            res.status(200).send(outPut);
            return 0;
        });

    },
    /**
     * Get Profile
     * @param req
     * @param res
     */
    getProfile:function(req,res){
        var _async = require('async'),
            Connection = require('mongoose').model('Connection'),
            User = require('mongoose').model('User'),
            Upload = require('mongoose').model('Upload') ;

        if(typeof req.params['uname'] == 'undefined'){
            var outPut ={};
            outPut['status']    = ApiHelper.getMessage(400, Alert.CANNOT_FIND_PROFILE, Alert.ERROR);
            res.status(400).send(outPut);
        }


        var _uname =req.params['uname'];
        _async.waterfall([
            function getUserById(callBack){
                var _search_param = {
                    user_name:_uname
                },
                    showOptions ={
                        w_exp:false,
                        edu:false
                    };
                User.getUser(_search_param,showOptions,function(resultSet){
                    if(resultSet.status ==200 ){
                        callBack(null,resultSet.user)
                    }
                })
            },
            function getConnectionCount(profileData,callBack){

                if( profileData!= null){
                    Connection.getFriendsCount(profileData.user_id,function(connectionCount){
                        profileData['connection_count'] = connectionCount;
                        callBack(null,profileData);
                        return 0
                    });
                }else{
                    callBack(null,null)
                }



            },
            function getProfileImage(profileData,callBack){

                if(profileData != null){
                    Upload.getProfileImage(profileData.user_id.toString(),function(profileImageData){
                        profileData['images'] = profileImageData.image;
                        callBack(null,profileData)
                        return 0;
                    });
                }else{
                    callBack(null,null)
                }


            }



        ],function(err,profileData){
            var outPut ={};
            if(!err){

                outPut['status']    = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['profile_data']      = profileData;
                res.status(200).send(outPut);
            }else{
                outPut['status']    = ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR);
                res.status(200).send(outPut);
            }
        })


    },

    /**
     * Get news categories of a user
     * @param req
     * @param res
     */
    getNewsCategories:function(req,res){

        var FavouriteNewsCategory = require('mongoose').model('FavouriteNewsCategory');

        var user_id = "56c2d6038c920a41750ac4db";
        //var user_id = CurrentSession.id;

        var criteria = {
            search:{user_id:user_id.toObjectId()},
            populate:'category',
            populate_field:'category'
        };

        FavouriteNewsCategory.findFavouriteNewsCategory(criteria,function(resultSet){
            res.status(resultSet.status).json(resultSet);
        });

    },

    /**
     * Delete a news category of a user
     * @param req
     * @param res
     */
    deleteNewsCategory:function(req,res){

        var FavouriteNewsCategory = require('mongoose').model('FavouriteNewsCategory');

        var user_id = "56c2d6038c920a41750ac4db";
        //var user_id = CurrentSession.id;

        var categoryId = "56cbeae0e975b0070ad200f8";
        //var categoryId = req.body.categoryId;

        var criteria = {
            user_id:user_id.toObjectId(),
            category:categoryId.toObjectId()
        };

        FavouriteNewsCategory.deleteNewsCategory(criteria,function(resultSet){
            if(resultSet.status == 200){
                res.status(200).send(ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS));
            }else{
                res.status(400).send(ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR));
            }
        });

    },

    /**
     * Add user's channel for a category
     * @param req
     * @param res
     */
    addNewsChannel:function(req,res){

        var user_id = "56c6aeaa6e1ac13e18b2400d";
        //var user_id = CurrentSession.id;

        var categoryId = "56cbeae0e975b0070ad200f8";
        //var categoryId = req.body.categoryId;

        //var channels = req.body.channels;
        var channels = ["56cbf55f09e38d870d1df691".toObjectId()];

        var FavouriteNewsCategory = require('mongoose').model('FavouriteNewsCategory');

        var criteria = {
            user_id:user_id.toObjectId(),
            category:categoryId.toObjectId()
        };

        var data = {
            channels:{$each:channels}
        };

        FavouriteNewsCategory.addUserNewsChannel(criteria, data, function(resultSet){
            if(resultSet.status == 200){
                res.status(200).send(ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS));
            }else{
                res.status(400).send(ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR));
            }
        });

    },

    /**
     * Get user's channels for a category
     * @param req
     * @param res
     */
    getNewsChannels:function(req,res){

        var user_id = "56c6aeaa6e1ac13e18b2400d";
        //var user_id = CurrentSession.id;

        var categoryId = req.params.category;

        var criteria = {
            search:{user_id:user_id.toObjectId(), category:categoryId.toObjectId()},
        };

        var FavouriteNewsCategory = require('mongoose').model('FavouriteNewsCategory');

        FavouriteNewsCategory.findFavouriteNewsChannel(criteria,function(resultSet){
                res.status(resultSet.status).json(resultSet);
        });

    },

    /**
     * Delete user's news channel for a category
     * @param req
     * @param res
     */

    deleteNewsChannel:function(req,res){

        var user_id = "56c6aeaa6e1ac13e18b2400d";
        //var user_id = CurrentSession.id;

        //var categoryId = req.body.categoryId;
        var categoryId = "56cbeae0e975b0070ad200f8";

        //var channelId = req.body.channelId;
        //var channelId = "56cbf4ed221d355c0d063183";
        var channels = ["56cbf4ed221d355c0d063183".toObjectId()];

        var FavouriteNewsCategory = require('mongoose').model('FavouriteNewsCategory');

        var criteria = {
            user_id:user_id.toObjectId(),
            category:categoryId.toObjectId()
        };

        var pullData = {
            channels: {$in:channels}
        };

        FavouriteNewsCategory.deleteNewsChannel(criteria, pullData,function(resultSet){
            if(resultSet.status == 200){
                res.status(200).send(ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS));
            }else{
                res.status(400).send(ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR));
            }
        });

    },

    /**
     * save an article to a user
     * @param req
     * @param res
     */
    saveArticle:function(req,res){

        var req_saved_articles = JSON.parse(req.body.saved_articles);

        var SavedArticle = require('mongoose').model('SavedArticle');

        SavedArticle.saveArticle(req_saved_articles, function(resultSet){
            if(resultSet.status == 200){
                res.status(200).send(ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS));
            }else{
                res.status(400).send(ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR));
            }
        });

    },

    /**
     * get all saved articles of a user
     * @param req
     * @param res
     */
    getSavedArticles:function(req,res){

        var user_id = "56c6aeaa6e1ac13e18b2400d";
        //var user_id = CurrentSession.id;

        var criteria = {
            search:{user_id:user_id.toObjectId()},
        };

        var SavedArticle = require('mongoose').model('SavedArticle');

        SavedArticle.findSavedArticle(criteria,function(resultSet){
            res.status(resultSet.status).json(resultSet);
        });

    },

    /**
     * delete a saved article of a user
     * @param req
     * @param res
     */
    deleteSavedArticle:function(req,res) {

        var SavedArticle = require('mongoose').model('SavedArticle');

        var _id = "56d5216ea2d6542b334da0b8";
        //var _id = req.body.id;

        var criteria = {
            _id: _id.toObjectId()
        };

        SavedArticle.deleteSavedArticle(criteria, function (resultSet) {
            if (resultSet.status == 200) {
                res.status(200).send(ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS));
            } else {
                res.status(400).send(ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR));
            }
        });
    },


    /**
     * Get WOrk Experinces
     * @param req
     * @param res
     */
    retrieveWorkExperience:function(req,res){
        var User = require('mongoose').model('User');

        if(typeof req.params['uname'] == 'undefined'){
            var outPut ={};
            outPut['status']    = ApiHelper.getMessage(400, Alert.CANNOT_FIND_PROFILE, Alert.ERROR);
            res.status(400).send(outPut);
        }

        var criteria = {user_name:req.params['uname']},
            showOptions ={
                w_exp:true,
                edu:false
            };
        User.getUser(criteria,showOptions,function(resultSet){
            var outPut ={};
            if(resultSet.status != 200){
                outPut['status'] = ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR);
                res.status(400).json(outPut);
                return 0;
            }

            outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
            outPut['user'] =resultSet.user;
            res.status(200).send(outPut);
        })
    },

    /**
     * Update Working Experinces
     * @param req
     * @param res
     */
    updateWorkExperience:function(req,res){
        var User = require('mongoose').model('User');

        //var _userId = CurrentSession.id;

        var _userId = CurrentSession.id;

        var _weDetails = {
            company_name:req.body.company,
            title:req.body.title,
            left_date:{
                year:(req.body.toYear != null && !req.body.currentPlc)?req.body.toYear:0,
                month:(req.body.toMonth != null && !req.body.currentPlc)?req.body.toMonth:0,
            },
            start_date:{
                year:(req.body.fromYear != null)?req.body.fromYear:0,
                month:(req.body.fromMonth != null)?req.body.fromMonth:0,
            },
            description:req.body.description,
            location:req.body.location,
            is_current_work_place:req.body.currentPlc
        };


        if(req.body.exp_id){
            _weDetails['_id'] = req.body.exp_id
            User.updateWorkingExperience(_userId,_weDetails,function(resultSet){

                var outPut ={};
                if(resultSet.status != 200){
                    outPut['status'] = ApiHelper.getMessage(400, Alert.DATA_UPDATE_ERROR, Alert.ERROR);
                    res.status(400).json(outPut);
                    return 0;
                }

                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['user'] =resultSet.user;
                res.status(200).send(outPut);


            });
        }else{
            User.addWorkingExperience(_userId,_weDetails,function(resultSet){

                var outPut ={};
                if(resultSet.status != 200){
                    outPut['status'] = ApiHelper.getMessage(400, Alert.DATA_INSERT_ERROR, Alert.ERROR);
                    res.status(400).json(outPut);
                    return 0;
                }

                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['user'] =resultSet.user;
                res.status(200).send(outPut);


            });
        }

    }



};

module.exports = UserControler;
