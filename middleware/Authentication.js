/**
 * Authenticate class will handle to make user log in and maintain session
 * When front end request came with auth as first part of the URL (/auth/*), it will go through auth module
 * in order to allow logged user to access releven service calls  from the server it check 
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


 }



