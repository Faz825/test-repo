/**
 * All Unit functional test will implement in side this controller
 */

var TestController ={

    uploadTest:function(req,res){

        var fs = require('fs');

        /*var Upload = require('mongoose').model('Upload');

        Upload.saveOnDb(data,function(dataSet){
            res.status(200).json(dataSet);
            return 0;
        });*/
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
        Upload.getProfileImage("56c03b4bebaef5fa11b00acc",function(dataSet){
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

        if(typeof req.params['email'] == 'undefined'){
            var outPut ={};
            outPut['status']    = ApiHelper.getMessage(400, Alert.CANNOT_FIND_PROFILE, Alert.ERROR);
            res.status(400).send(outPut);
        }


        var _uname =req.params['email'];
        _async.waterfall([
            function getUserById(callBack){
                var _search_param = {
                    email:_uname,

                }
                User.getUser(_search_param,function(resultSet){
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
            }else{
                outPut['status']    = ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR);
                res.status(200).send(outPut);
            }
        })


    }



}



module.exports = TestController;