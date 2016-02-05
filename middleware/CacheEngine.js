var CacheEngine ={
	
	_memcached:null,
	init:function(){
		var Memcached = require('memcached');
		this._memcached = new Memcached(Config.CACHE_HOST);
		console.log("CONNECTED TO CACHE_HOST ON :",Config.CACHE_HOST);
	},

	/**
	 * Prepare cache key based on the parameter that pass.  
	 * @param object
	 */
	prepareCaheKey:function(_cacheKey){

		return _cacheKey;
		
	},
	/**
	 * Get chache Data based on the cache key
	 * @param cacheKey 
	 * return callBack
	 */
	getCachedDate:function(cacheKey,callBack){
		this._memcached.get(cacheKey,function(err,cacheData){
			if( err ){
				callBack(null);
			}else{
				callBack(cacheData);
			}
		});
	},

	/**
	 * Add Data to the cache based on the cache key
	 * @param cacheKey
	 * @data Data set
	 */
	addToCache:function(cacheKey,data,callBack){
		this._memcached.add(cacheKey,data,Config.CACHE_TTL,function(err,cacheData){
			if( err ){
				console.log(err);
				callBack(err);
			}else{
				console.log("ADD TO CACHE -- SUCESS");
				callBack(cacheData);
			}
		});

	}
};

module.exports = CacheEngine;
