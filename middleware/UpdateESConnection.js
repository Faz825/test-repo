/**
 * Created by phizuupc on 10/5/2016.
 */

var UpdateESConnection = {

    updateConnectedTime:function(callBack){
        var _async = require('async'),
            Connection =require('mongoose').model('Connection'),CurrentSession = Util.getCurrentSession(req);

        Connection.getFriends(CurrentSession.id,status,function(myFriendIds){
            
            callBack(null)
        });
    }

}