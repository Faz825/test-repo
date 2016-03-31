/**
 * Authenticate class will handle to make user log in and maintain session
 */


exports.Authentication= function(req,res,next){

	/**
	 * Pass public URLs from the route
	 */
	for (var i = 0; i < publicURLs.length; i++) {
        if (req.originalUrl.indexOf(publicURLs[i]) >= 0) {
            next()
            return;
        }
    }

	var origURL =  String(req.originalUrl).split('?')[0];
    if (AccessAllow.indexOf(origURL) >= 0) {
        res.render('index');
        return;
    }



    if(typeof  req.session.user != 'undefined'  ){
        if(String(req.originalUrl).indexOf('logout') != -1){

            req.session.destroy(function(err){
                _out_put={
                    status:ApiHelper.getMessage(200,Alert.SUCCESS,Alert.SUCCESS),
                }
                res.status(200).json(_out_put);
            });
            return ;
        }

        next();
        return;



    }else{

        var _out_put= {
            status:'success',
            message:Alert.INVALID_TOKEN
        }
        res.status(401).json(_out_put);
        return ;
    }

    /**
     * Handle Logged User sessions

    if(typeof req.headers['prg-auth-header'] != 'undefined'){

        //Handle Logout
        if(String(req.originalUrl).indexOf('logout') != -1){

            CacheEngine.deleteCache("sess:"+req.headers['prg-auth-header'],function(cachedUser){
                var _out_put={};

                if(typeof cachedUser == 'undefined'){

                    _out_put={
                        status:ApiHelper.getMessage(401,Alert.INVALID_TOKEN,Alert.SUCCESS),
                    }
                    res.status(401).json(_out_put);
                    return ;
                }

                _out_put={
                    status:ApiHelper.getMessage(200,Alert.SUCCESS,Alert.SUCCESS),
                }
                res.status(200).json(_out_put);
                return;
            });
            return ;
        }


        CacheEngine.getCachedDate("sess:"+req.headers['prg-auth-header'],function(cachedUser){


            if(typeof cachedUser == 'undefined'){
                var _out_put= {
                    status:'error',
                    message:Alert.INVALID_TOKEN
                }
                res.status(401).json(_out_put);
                return ;
            }

            req.CurrentSession = cachedUser;

            next();
            return;
        });

    }else{

        var _out_put= {
            status:'success',
            message:Alert.INVALID_TOKEN
        }
        res.status(401).json(_out_put);
        return ;
    }

    */

 }



