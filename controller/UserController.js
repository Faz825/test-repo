
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
            user_id:CurrentSession.id
        };

        if(typeof req.query.pg  != 'undefined' &&
            req.query.pg != "" && req.query.pg > 1){
            criteria['pg'] = req.query.pg -1;
        }


        User.getConnectionUsers(criteria,function(resultSet){

            var outPut	={};

            if(resultSet.status !== 400){

                outPut['status'] = ApiHelper.getMessage(200,Alert.SUCCESS,Alert.SUCCESS);
                outPut['header'] ={
                    total_result:resultSet.total_result,
                    result_per_page:Config.CONNECTION_RESULT_PER_PAGE,
                    current_page:req.query.pg,
                    total_pages:Math.ceil(resultSet.total_result/Config.CONNECTION_RESULT_PER_PAGE)
                };

                outPut['connections'] = resultSet.users

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

            Connection.connect(req_connected_users,req_unconnected_users, function (resultSet) {

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

                var news_categories = [],
                    now = new Date(),
                    FavouriteNewsCategory = require('mongoose').model('FavouriteNewsCategory');
                for (var i = 0; req_news_categories.length > i; i++) {
                    news_categories.push({
                        user_id: CurrentSession.id,
                        connected_with: req_news_categories[i],
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
                console.log(CurrentSession);

                CacheEngine.updateCache(_cache_key, CurrentSession, function (cacheData) {
                    var outPut = {
                        status: ApiHelper.getMessage(200, Alert.ADDED_PROFILE_IMAGE, Alert.SUCCESS)
                    }
                    if (!cacheData) {
                        outPut['extra'] = Alert.CACHE_CREATION_ERROR
                    }
                    outPut['user'] = CurrentSession;
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

        //var _userId = CurrentSession.id;

        var _userId = "56c2d6038c920a41750ac4db";

        var _education_id = "56c321a42ab09c7b09034e85";

        User.retrieveEducationDetail(_userId,_education_id,function(resultSet){

            res.status(200).json(resultSet);


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

        var _userId = "56c2d6038c920a41750ac4db";

        var _education_id = "56c321a42ab09c7b09034e85";

        var _educationDetails = {
            _id:_education_id,
            school:"Hindu Ladies College",
            date_attended_from:"1996",
            date_attended_to:"2014",
            degree:"G.C.E.A/L",
            grade:"Merit",
            activities_societies:"Played Tennis",
            description:"It was wonderful"
        };

        User.updateEducationDetail(_userId,_educationDetails,function(resultSet){

            res.status(200).json(resultSet);


        });

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

        var userId = "56c2d6038c920a41750ac4db";
        //var req_skills = ["PHP"]; // skills that are newly added by the user, but which are not in skill collection
        //"56c43351f468ba8913f3d129", "56c44e88d7ffcaa91867862e", "56c44e88d7ffcaa91867862f"
        var existing_skills = ["56c43351f468ba8913f3d12a", "56c44ddefd4ec41e18ab4e6d", "56c44ddefd4ec41e18ab4e6e"]; // skills that are newly added by the user, but which are available in skill collection
        var deleted_skills = ["56c44e88d7ffcaa91867862e", "56c44e88d7ffcaa91867862f"]; // skills that are deleted by the user

        // Need to UNCOMMENT these
        //var userId = req.body.userId;
        //var req_skills = req.body.new_skills; // skills that are newly added by the user, but which are not in skill collection
        //var existing_skills = req.body.existing_skills; // skills that are newly added by the user, but which are available in skill collection
        //var deleted_skills = req.body.deleted_skills; // skills that are deleted by the user

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
                res.status(200).send({status:"success"});
            }else{
                res.status(400).send(err);
            };
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

                            res.status(400).json({
                                status:"error",
                                message:Alert.NO_ACCOUNT_FOUND
                            });
                        }
                    });

                } else {
                    res.status(400).json({
                        status:"error",
                        message:Alert.EMAIL_EMPTY
                    });
                }
            },
            function(token, user, done) {

                console.log(user.first_name);
                console.log(user.email);

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
                        res.status(200).json({
                            status:"error",
                            message:Alert.FORGOT_PASSWORD_EMAIL_SENT
                        });
                    } else{
                        res.status(400).json({
                            status:"error",
                            message:Alert.FAILED_TO_SEND_EMAIL
                        });
                    }
                });

            }
        ], function(err) {
            if (err) return next(err);
        });

    },

    validateToken:function(req,res){

        var User = require('mongoose').model('User');

        User.findByCriteria({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: {
                $gt: Date.now()
            }
        }, function(ResultSet) {

                if (ResultSet.status == 200 && ResultSet.user != null) {
                    res.status(200).json({
                        status:"success",
                        message:"valid token. need to redirect to password reset page"
                    });
                    //res.redirect('/#!/password/reset/' + req.params.token);
                } else{
                    res.status(400).json({
                        status:"error",
                        message:"Invalid token. need to redirect to invalid page"
                    });
                    //res.redirect('/#!/password/reset/invalid');
                }

        });

    },

    resetPassword:function(req,res){

        var User = require('mongoose').model('User');

        console.log(req.params.token);
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
                        res.status(200).json({
                            status:"error",
                            message:Alert.RESET_PASSWORD_SUCCESS
                        });

                    } else{
                        res.status(400).json({
                            status:"error",
                            message:Alert.RESET_PASSWORD_FAIL
                        });
                    }

                });


            } else{
                res.status(400).json({
                    status:"error",
                    message:"Invalid token. need to redirect to invalid page"
                });
                //res.redirect('/#!/password/reset/invalid');
            }

        });

    }


};

module.exports = UserControler;
