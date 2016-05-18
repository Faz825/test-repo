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

        console.log("addPost - PostController");

        var outPut ={},CurrentSession = Util.getCurrentSession(req);

        var TimeLinePostHandler = require('../middleware/TimeLinePostHandler');
        var data ={
            has_attachment:(typeof req.body.__hs_attachment != 'undefined')?req.body.__hs_attachment:false,
            content:(typeof req.body.__content != 'undefined')?req.body.__content :"",
            created_by:CurrentSession.id,
            page_link:(typeof req.body.page_link != 'undefined')?req.body.page_link :"",
            post_visible_mode:PostVisibleMode.PUBLIC,
            post_mode:(typeof req.body.__post_type != 'undefined')?req.body.__post_type:PostConfig.NORMAL_POST,
            file_content:(typeof req.body.__file_content != 'undefined')?req.body.__file_content:"",
            upload_id:(typeof req.body.__uuid  != 'undefined')? req.body.__uuid:"",
            location:(typeof req.body.__lct  != 'undefined')?req.body.__lct:"",
            life_event:(typeof req.body.__lf_evt  != 'undefined')?req.body.__lf_evt:"",
            shared_post:""
        };

        TimeLinePostHandler.addNewPost(data,function(resultSet){
            console.log("TimeLinePostHandler.addNewPost==================================");
            console.log(resultSet);
            outPut['status']    = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
            outPut['post']      = resultSet;
            res.status(200).send(outPut);
            return 0;
        });

    },
    /**
     * Get Posts
     * In order to  Load my post then set _own param to me otherwise set it all
     * @param req
     * @param res

     */
    getPost:function(req,res){

        console.log("getPost");

        console.log(req.query.uname);

        var query={
            q:"user_name:"+req.query.uname,
            index:'idx_usr'
        };

        ES.search(query,function(esResultSet){

            console.log("ES.search");console.log(esResultSet);

            var _id     = esResultSet.result[0].user_id;console.log(_id);
            var _page   = req.query.__pg;

            var Post = require('mongoose').model('Post'),

            payLoad ={
                _page:_page,
                q:(req.query.__own =="me")?"created_by:"+_id:"*"
            };

            console.log(payLoad);

            Post.ch_getPost(_id,payLoad,function(resultSet){
                console.log("Post.ch_getPost");
                var outPut ={};
                console.log(resultSet);


                if(resultSet == null){
                    outPut['status']    = ApiHelper.getMessage(200, Alert.LIST_EMPTY, Alert.SUCCESS);
                    outPut['posts']     = [];
                    res.status(200).send(outPut);
                    return 0;
                }
                outPut['status']    = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['posts']      =resultSet;

                res.status(200).send(outPut);
                return 0;
            });
        });

    },

    /**
     * Share post on time line
     * @param res
     * @param res
     */
    sharePost:function(req,res){
        var CurrentSession = Util.getCurrentSession(req);
        var data ={
            content:req.body.__content,
            created_by:CurrentSession.id,
            shared_post_id:req.body.__pid,
            post_visible_mode:PostVisibleMode.PUBLIC,
            post_mode:(typeof req.body.__post_type != 'undefined')?req.body.__post_type:PostConfig.SHARED_POST,
            post_owner:req.body.__own
        }
        var TimeLinePostHandler = require('../middleware/TimeLinePostHandler');
        TimeLinePostHandler.sharePost(data,function(resultSet){
            var outPut ={};
            outPut['status']    = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
            outPut['post']      = resultSet;
            res.status(200).send(outPut);
            return 0;
        });
    }



}

module.exports = PostController
