/**
 * All Unit functional test will implement in side this controller
 */

var TestController ={

    uploadTest:function(req,res){

        var fs = require('fs');

        var attachment = "/web/ProGlob/Docs/ProGlobe-Main/2015-12-30/images/pg-professional-networks_08.png";

        fs.readFile(attachment, function(err, data) {


            var base64data = new Buffer(data, 'binary').toString('base64'),
                prefix = "data:image/png;base64,";

            var data ={
                content_title:"Test Album",
                file_name:prefix+base64data,
                file_type:"image/png",
                is_default:0,
                entity_id:"56b98fe8a546494c18b576d3",
                entity_tag:UploadMeta.COVER_IMAGE

            }

            ContentUploader.uploadFile(data,function(dataSet){
                res.status(200).json(dataSet);
                return 0;
            })
        });


    },
    getImageTest:function(req,res){
        var Upload = require('mongoose').model('Upload');
        var _usrId = req.params['id'];
        Upload.getProfileImage(_usrId,function(dataSet){
            res.status(200).json(dataSet);
            return 0;
        });
    },
    sendMailTest:function(req,res){
        res.render('email-templates/signup', {
            name: "piusha@eigth25media.com",
        }, function(err, emailHTML) {

            var sendOptions = {
                to: "piusha@eigth25media.com",
                subject: 'Proglobe Signup',
                html: emailHTML
            };
            EmailEngine.sendMail(sendOptions, function(err){
                if(!err){
                    res.status(200).json("EMAIL SENT");
                    return 0
                } else{
                    console.log("EMAIL Sending Error");
                    res.status(200).json(err);
                    return 0
                }
            });

        });
    },
    getProfile:function(req,res){
        var _async = require('async'),
            Connection = require('mongoose').model('Connection'),
            User = require('mongoose').model('User'),
            Upload = require('mongoose').model('Upload') ;

        if(typeof req.params['id'] == 'undefined'){
            var outPut ={};
            outPut['status']    = ApiHelper.getMessage(400, Alert.CANNOT_FIND_PROFILE, Alert.ERROR);
            res.status(400).send(outPut);
            return 0;
        }


        var _id =req.params['id'];
        _async.waterfall([
            function getUserById(callBack){
                var _search_param = {
                    _id:Util.toObjectId(_id),

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
                    Connection.getConnectionCount(profileData.user_id,function(connectionCount){
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
                return 0
            }else{
                outPut['status']    = ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR);
                res.status(200).send(outPut);
                return 0;
            }
        })


    },
    retrieveEducationDetail:function(req,res){
        var User = require('mongoose').model('User');

        //var _userId = CurrentSession.id;

        var criteria = {user_name:req.params['uname']};

        var _education_id = "56c321a42ab09c7b09034e85";

        User.retrieveEducationDetail(criteria,function(resultSet){

            res.status(200).send(resultSet);


        });
    },
    retrieveWorkExperience:function(req,res){
        var User = require('mongoose').model('User');

        //var _userId = CurrentSession.id;

        var criteria = {user_name:req.params['uname']},
            showOptions ={
                w_exp:true,
                edu:false
            };

        var _education_id = "56c321a42ab09c7b09034e85";

        User.getUser(criteria,showOptions,function(resultSet){
            res.status(200).send(resultSet);
        })
    },
    esCreateIndex:function(req,res){

        var _async = require('async'),
            Connection = require('mongoose').model('Connection'),
            User = require('mongoose').model('User'),
            Upload = require('mongoose').model('Upload') ;

        if(typeof req.params['id'] == 'undefined'){
            var outPut ={};
            outPut['status']    = ApiHelper.getMessage(400, Alert.CANNOT_FIND_PROFILE, Alert.ERROR);
            res.status(400).send(outPut);
            return 0;
        }


        var _id =req.params['id'];
        _async.waterfall([
            function getUserById(callBack){
                var _search_param = {
                        _id:Util.toObjectId(_id),
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
                    Connection.getConnectionCount(profileData.user_id,function(connectionCount){
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

                var payLoad={
                    index:"idx_usr",
                    id:profileData.user_id,
                    type: 'user',
                    data:profileData,
                    tag_fields:['first_name','last_name','email','user_name','country']
                }
                ES.createIndex(payLoad,function(resultSet){
                    res.status(200).send(resultSet);
                    return 0;
                });

            }else{
                outPut['status']    = ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR);
                res.status(200).send(outPut);
                return 0;
            }
        })

    },
    esSearch:function(req,res){
        var query={
            q:req.query.q,
            index:'idx_usr'
        };

        ES.search(query,function(resultSet){
            res.status(200).send(resultSet);
            return 0;
        });
    },

    myConnections:function(req,res){
        var Connection = require('mongoose').model('Connection');
        var _id =req.params['id'];
        Connection.getConnectedUsers(_id,function(resultSet){
            res.status(200).send(resultSet);
            return 0;
        });

    }



}



module.exports = TestController;