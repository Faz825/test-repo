
'use strict'

var SecretaryController ={

	getSeretaries:function(req,res){
		var Secretary = require('mongoose').model('Secretary');

		Secretary.getSecreties(function(dataSet){
			res.status(200).json(dataSet);
		})
	}

}
module.exports = SecretaryController; 