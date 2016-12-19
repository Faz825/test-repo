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
            name:req.body.__notebookName,
            description:req.body.__description,
            color:req.body.__color,
            group_pic_link:req.body.__group_pic_link,
            shared_users:req.body.__shared_users,
            created_by:Util.getCurrentSession(req).id,
        };

        Groups.createGroup(_group,function(resultSet){
            if(resultSet.status == 200){
                res.status(200).send(ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS));
            }else{
                res.status(400).send(ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR));
            }
        });

    },

    addGroupPost:function(req,res){

        var outPut ={},CurrentSession = Util.getCurrentSession(req);
        var TimeLinePostHandler = require('../middleware/TimeLinePostHandler');
        var _async = require('async'),
            User = require('mongoose').model('User'),
            Groups = require('mongoose').model('Groups');

        var groupId = req.body.__groupId;

        _async.waterfall([
            function getGroupMembers(callBack){
                Groups.getGroupMembers(groupId, function (r) {
                    callBack(null, r.members);
                });
            },
            function addPost(members, callBack){
                var data ={
                    has_attachment:(typeof req.body.__hs_attachment != 'undefined')?req.body.__hs_attachment:false,
                    content:(typeof req.body.__content != 'undefined')?req.body.__content :"",
                    created_by:(req.body.__on_friends_wall === 'true')?req.body.__profile_user_id :CurrentSession.id,
                    post_owned_by:CurrentSession.id,
                    page_link:(typeof req.body.page_link != 'undefined')?req.body.page_link :"",
                    post_visible_mode:PostVisibleMode.GROUP_POST,
                    visible_users: members,
                    post_mode:(typeof req.body.__post_type != 'undefined')?req.body.__post_type:PostConfig.NORMAL_POST,
                    file_content:(typeof req.body.__file_content != 'undefined')?req.body.__file_content:"",
                    upload_id:(typeof req.body.__uuid  != 'undefined')? req.body.__uuid:"",
                    location:(typeof req.body.__lct  != 'undefined')?req.body.__lct:"",
                    life_event:(typeof req.body.__lf_evt  != 'undefined')?req.body.__lf_evt:"",
                    shared_post:""
                };
                console.log("GroupsController - addPost - data - ");
                TimeLinePostHandler.addNewPost(data,function(r){
                    callBack(null);
                });
            }
        ],function(err){
            outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
            res.status(200).send(outPut);
        });

    }

};

module.exports = GroupsController;
