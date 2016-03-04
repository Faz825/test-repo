/**
 * Utill js file
 */

var Util = {
    /**
     * Get image Detaild from base 64 image data
     * @param dataString
     * @returns {*}
     */
    decodeBase64Image:function(dataString) {
        var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
            response = {};

        if (matches.length !== 3) {
            return new Error('Invalid input string');
        }
        var imgExt = {
            "image/gif" : ".gif",
            "image/jpg" : ".jpg",
            "image/png" : ".png",
            "image/jpeg" : ".jpeg"
        }
        response.type = matches[1];
        response.extension = imgExt[response.type.toLocaleLowerCase()];
        response.data = new Buffer(matches[2], 'base64');

        return response;
    },
    /**
     * Convert String to Object Id
     * @param id
     * @returns {*|ObjectID}
     */
    toObjectId:function(id){

        var ObjectId = (require('mongoose').Types.ObjectId);
        return new ObjectId(id.toString());
    }



}



module.exports = Util;