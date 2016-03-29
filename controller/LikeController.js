/**
 * Like controller
 */
var LikeController ={


    /**
     * Add Like to selected post
     * @param req
     * @param res
     */
    doLike:function(req,res){
        var outPut = {}
        if(typeof req.body.__post_id == 'undefined' || typeof req.body.__post_id == ""){
            outPut['status']    = ApiHelper.getMessage(400, Alert.POST_ID_EMPTY, Alert.ERROR);
            res.status(400).send(outPut);
            return 0;
        }

        var Like = require('mongoose').model('Like');

        var _like ={
            post_id:req.body.__post_id,
            user_id:CurrentSession.id
        }

        Like.addLike(_like,function(resultSet){
            if(resultSet.status == 200){
                outPut['status']    = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                res.status(200).send(outPut);
            }
        });
    }


}


module.exports = LikeController