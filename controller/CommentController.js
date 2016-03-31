/**
 * Handle comment related operation in the class
 */


var CommentController ={

    /**
     * Add New Comments
     * @param req
     * @param res
     * @returns {number}
     */
    addComment:function(req,res){
        var outPut ={}
        if(typeof req.body.__content == 'undefined' || typeof req.body.__content == ""){
            outPut['status']    = ApiHelper.getMessage(400, Alert.COMMENT_CONTENT_EMPTY, Alert.ERROR);
            res.status(400).send(outPut);
            return 0;
        }

        if(typeof req.body.__post_id == 'undefined' || typeof req.body.__post_id == ""){
            outPut['status']    = ApiHelper.getMessage(400, Alert.COMMENT_POST_ID_EMPTY, Alert.ERROR);
            res.status(400).send(outPut);
            return 0;
        }

        var Comment = require('mongoose').model('Comment'),CurrentSession = Util.getCurrentSession(req);


        var _comment ={
            post_id:req.body.__post_id,
            user_id:CurrentSession.id,
            comment:req.body.__content

        }
        Comment.addComment(_comment,function(resultSet){
            if(resultSet.status != 200){

                outPut['status']    = ApiHelper.getMessage(200, Alert.ERROR, Alert.ERROR);
                outPut['error']     = resultSet.error;
            }

            outPut['status']    = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
            outPut['comment']   = resultSet.comment;
            res.status(200).send(outPut);
            return ;
        })
    },

    /**
     * Get Comments
     * @param req
     * @param res
     */
    getComment:function(req,res){

        if(typeof req.query['__post_id'] == 'undefined' || typeof req.query['__post_id'] == ""){
            var outPut ={};
            outPut['status']    = ApiHelper.getMessage(400, Alert.COMMENT_POST_ID_EMPTY, Alert.ERROR);
            res.status(400).send(outPut);
            return 0;
        }


        var Comment = require('mongoose').model('Comment'),
            post_id = req.query['__post_id'];
        Comment.getComments(post_id,0,function(resultSet){
            var outPut ={};
            outPut['status']    = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
            outPut['comments']  = resultSet
            res.status(200).send(outPut);
        });

    }

}

module.exports =  CommentController;