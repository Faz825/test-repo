/**
 * Upload controller will handle all Uploads for anu content upload for the system
 * TODO : This service should be separate from the main thread if this is dealing with larg user base
 */


var UploadController = {

    uploadTimeLinePhoto:function(req,res){
        var outPut ={};
        if(typeof req.body.image_name == 'undefined' || typeof req.body.image_name == ""){
            outPut['status']    = ApiHelper.getMessage(400, Alert.POST_CONTENT_EMPTY, Alert.ERROR);
            res.status(400).send(outPut);
            return 0;
        }


        var uuid = require('node-uuid');

        var data ={
            content_title:"Post Image",
            file_name:req.body.image_name,
            entity_id:req.body.upload_id,
            entity_tag:UploadMeta.TIME_LINE_IMAGE,
            upload_index:req.body.upload_index
        }


        ContentUploader.tempUpload(data,function(resultSet){
            outPut['status']    = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
            outPut['upload']   = resultSet
            res.status(200).json(outPut);
        })



    }

}

module.exports = UploadController;