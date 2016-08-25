/**
 * Application configuration properties will be listed here
 */
 var Config = {
 	DB_HOST:"localhost",
 	DB_NAME:"proglobe",
 	RESULT_PER_PAGE:50,
 	SITE_PATH:'http://proglobe.loc',
 	SECRET:"4951965c-e128-424e-980a-710f42f928a6",
 	CDN_URL:"https://s3.amazonaws.com/proglobe/",
    NOTIFICATION_RESULT_PER_PAGE:10,

 	//Cache Configuration
 	CACHE_HOST:"localhost:11211",
 	CACHE_TTL:86400,
 	AWS_KEY:"AKIAJKNZZ63HCXAU5NFA",
    AWS_SECRET:"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",
    CDN_BUCKET_NAME:'proglobe/',
	CDN_UPLOAD_PATH:"dev/",

	MAILER: {
	  FROM: 'contact@proglobe.com',
	  OPTIONS: {
	   HOST: 'smtp.mandrillapp.com',
	   SERVICE:'Mandrill',
	   PORT:587,
	   AUTH: {
	    USER: 'sohamkhaitan@gmail.com',
	    PASS: 'n_u1fn_slFgrKn3lPuTxuA'
	   }
	  }
	 },

	 //Cache Configuration
	  CACHE_HOST:"localhost",
	    CACHE_PORT:"6379",
	  CACHE_TTL:86400,

  //Elastic search configurations
    ES_HOST:"localhost",
    ES_PORT:9200

 }
 module.exports = Config;
