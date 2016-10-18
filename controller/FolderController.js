'use strict';

/**
 * Handle note related operation in the class
 */

var FolderController ={

    addNewFolder:function(req,res){

        var Folders = require('mongoose').model('Folders');

        var _folder = {
            name:req.body.folderName,
            color:req.body.folderColor,
            isDefault:req.body.isDefault,
            user_id:Util.getCurrentSession(req).id
        };

        Folders.addNewFolder(_folder,function(resultSet){
            if(resultSet.status == 200){
                res.status(200).send(ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS));
            }else{
                res.status(400).send(ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR));
            }
        });

    }

};

module.exports = FolderController;
