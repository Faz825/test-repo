/**
 * Authenticate class will handle to make user log in and maintain session
 */


exports.Authentication= function(req,res,next){

    console.log(req.originalUrl)

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

    if(notAuthURLs.indexOf(origURL) >= 0){
        if(typeof  req.session.user != 'undefined'  ){
            res.redirect('/');
            return;
        } else{
            res.render('index');
            return;
        }
    }

    if (AccessAllow.indexOf(origURL) >= 0) {
        res.render('index');
        return;
    }

    if(typeof req.session.user != 'undefined'  ){
        if(String(req.originalUrl).indexOf('logout') != -1){

            req.session.destroy(function(err){
                _out_put={
                    status:ApiHelper.getMessage(200,Alert.SUCCESS,Alert.SUCCESS),
                }
                res.status(200).json(_out_put);
            });
            return ;
        }
        //else{
        //    for (var i = 0; i < authURLS.length; i++) {
        //        if (req.originalUrl.indexOf(authURLS[i]) >= 0) {
        //            res.render('index');
        //            return;
        //        }
        //    }
        //}

        next();
        return;



    }else{

        console.log("ELSE")

        //for (var i = 0; i < authURLS.length; i++) {
        //    if (req.originalUrl.indexOf(authURLS[i]) >= 0) {
        //        res.redirect('/');
        //        return;
        //    }
        //}

        var _out_put= {
            status:'success',
            message:Alert.INVALID_TOKEN
        }
        res.status(401).json(_out_put);
        return ;
    }

 }



