/**
 * Secratary Model will communicate with secretaries collection
 */

 'use strict'
var  mongoose = require('mongoose'),
     Schema   = mongoose.Schema;


var SecretarySchema = new Schema({
	full_name:{
		type:String,
	},
	gender:{
		type:String //M - Male | F- Female
	}

},{collection:"secretaries"});



mongoose.model('Secretary',SecretarySchema);