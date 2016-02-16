/**
 * Clusters file willbe use to define all Third party server clustors configurations and initilaizations
 */

 var Clusters ={

 	 init:function(){

 	 	/**
 	 	 * Initilizec Cache Engine
 	 	 */
		GLOBAL.CacheEngine = require('../middleware/CacheEngine');
		CacheEngine.init();
 	 }

 }

module.exports = Clusters;