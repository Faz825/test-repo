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


    /*if(String(req.originalUrl).indexOf('test') != -1){
        next();
        return ;
    }*/



    /**
     * Handle Logged User sessions
     */
    if(typeof req.headers['prg-auth-header'] != 'undefined'){


        CacheEngine.getCachedDate(req.headers['prg-auth-header'],function(cachedUser){


            if(typeof cachedUser == 'undefined'){
                var _out_put= {
                    status:'success',
                    message:Alert.INVALID_TOKEN
                }
                res.status(401).json(_out_put);
                return ;
            }

            CurrentSession = cachedUser;

            //console.log("SESSION USER")
            //console.log(cachedUser)
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



 }



