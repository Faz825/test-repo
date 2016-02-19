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
    }
}



module.exports = TestController;