/**
 * Created by phizuupc on 12/19/2016.
 */
'use strict';

/**
 * Handle All Groups related functions
 */

var GroupsController ={

    createGroup:function(req,res){

        var Groups = require('mongoose').model('Groups');

        var _group = {
            name:req.body.notebookName,
            description:req.body.description,
            color:req.body.color,
            group_pic_link:req.body.group_pic_link,
            shared_users:req.body.shared_users,
            created_by:Util.getCurrentSession(req).id,
        };

        Groups.createGroup(_group,function(resultSet){
            if(resultSet.status == 200){
                res.status(200).send(ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS));
            }else{
                res.status(400).send(ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR));
            }
        });

    }

};

module.exports = GroupsController;
