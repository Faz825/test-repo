
/**
 * This is date time related lib class that can use any where in the application
 */
'use strict'

var DateTime ={
    getServerTimeStamp :function(){
        return Math.floor(new Date() / 1000);
    }
}

module.exports = DateTime
