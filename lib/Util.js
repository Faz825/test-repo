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
    },
    /**
     * Random Number Generate based
     * @param length
     * @returns {string}
     * @constructor
     */
    IDGenerator:function(str_lenght) {

        var length = str_lenght,
            timestamp = +new Date,
            ts = timestamp.toString(),
            parts = ts.split( "" ).reverse(),
            id = "";

        for( var i = 0; i < length; ++i ) {
            var max     = parts.length - 1,
                index   = Math.floor( Math.random() * ( max - 0 + 1 ) ) + 0;
            id += parts[index];
        }

        return id;
    },
    /**
     * Get Unique User name
     */
    getUniqueUserName:function(data){
       return data.first_name+"."+data.last_name+"."+this.IDGenerator(5);

    }



}



module.exports = Util;