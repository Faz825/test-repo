/**
 * Post controller is use for handle all the post related actions
 */

var PostController ={

    /**
     * Add New post to the system
     * @param req
     * @param res
     * @returns {number}
     */
    addPost:function(req,res){

        var outPut ={};
        if(typeof req.body.__content == 'undefined' || typeof req.body.__content == ""){
            outPut['status']    = ApiHelper.getMessage(400, Alert.POST_CONTENT_EMPTY, Alert.ERROR);
            res.status(400).send(outPut);
            return 0;
        }


        var Post = require('mongoose').model('Post');
        var data ={
            has_attachment:req.body.has_attachment,
            content:req.body.__content,
            created_by:CurrentSession.id,
            page_link:req.body.page_link,
            post_visible_mode:PostVisibleMode.PUBLIC,
            post_mode:PostConfig.NORMAL_POST
        }

        Post.create(data,function(resultSet){
            outPut['status']    = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
            outPut['post']      = resultSet;
            res.status(200).send(outPut);
            return 0;
        });
    },
    /**
     * Get Posts
     * @param req
     * @param res
     */
    ch_getPost:function(req,res){
        var _id     = CurrentSession.id;
        var _page   = req.query.__pg;

        var Post = require('mongoose').model('Post'),
            payLoad ={
                _page:_page,
                q:"*",
            };

        Post.ch_getPost(_id,payLoad,function(resultSet){
            var outPut ={};
            outPut['status']    = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
            outPut['posts']      =resultSet
            res.status(200).send(outPut);
            return 0;
        });
    }



}

module.exports = PostController
