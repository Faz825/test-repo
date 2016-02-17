
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
                                res.status(200).json(_out_put)
                            });
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
                    total_result:resultSet.totla_result,
                    result_per_page:Config.CONNECTION_RESULT_PER_PAGE,
                    current_page:req.query.pg,
                    total_pages:Math.ceil(resultSet.totla_result/Config.CONNECTION_RESULT_PER_PAGE)
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
        CurrentSession['status']    = 4;
        CacheEngine.updateCache(_cache_key,CurrentSession,function(cacheData){
            var outPut ={};
            outPut['status'] =  ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
            outPut['user']=CurrentSession;

            var req_connected_users = JSON.parse(req.body.connected_users);

            if(req_connected_users.length >= 1 ) {

                var connected_users = [],
                    now = new Date(),
                    Connection = require('mongoose').model('Connection');


                for (var i = 0; req_connected_users.length > i; i++) {
                    connected_users.push({
                        user_id: CurrentSession.id,
                        connected_with: req_connected_users[i],
                        created_at: now
                    });
                }

                Connection.connect(connected_users, function (resultSet) {

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
            }else{
                res.status(200).json(outPut);
                return 0;
            }

        });
    },

    /**
     * Add new category to the user
     * @param req
     * @param res
     */
    addNewsCategory:function(req,res){
        var _cache_key = CacheEngine.prepareCacheKey(CurrentSession.token);
        CurrentSession['status']    = 5;
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
                CurrentSession['status'] = 6;
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

    retrieveEducationDetail:function(req, res){

        var User = require('mongoose').model('User');

        //var _userId = CurrentSession.id;

        var _userId = "56c2d6038c920a41750ac4db";

        var _education_id = "56c321a42ab09c7b09034e85";

        User.retrieveEducationDetail(_userId,_education_id,function(resultSet){

            res.status(200).json(resultSet);


        });

    },

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

    deleteEducationDetail:function(req, res){

        var User = require('mongoose').model('User');

        //var _userId = CurrentSession.id;

        var _userId = "56c2d6038c920a41750ac4db";

        var _education_id = "56c321a42ab09c7b09034e85";

        User.deleteEducationDetail(_userId,_education_id,function(resultSet){

            res.status(200).json(resultSet);


        });

    }



};




module.exports = UserControler; 