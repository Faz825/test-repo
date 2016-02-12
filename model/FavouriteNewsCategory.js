/**
 * Handle Favourite news Categories
 */
'use strict'
var  mongoose = require('mongoose'),
    Schema   = mongoose.Schema;



var FavouriteNewsCategorySchema = new Schema({
    user_id:{
        type: Schema.ObjectId,
        ref: 'User',
        default:null
    },
    category:{
        type: String,
        default:null
    },
    created_at:{
        type:Date
    },
    updated_at:{
        type:Date
    }
},{collection:"favourite_news_categories"});



FavouriteNewsCategorySchema.pre('save', function(next){
    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }
    next();
});

/**
 * Add news category
 * @param userId
 * @param criteria
 * @param callBack
 */
FavouriteNewsCategorySchema.statics.addUserNewsCategory =function(data,callBack){
    this.collection.insert(data,function(err,resultSet){
        if(! err){
            callBack({status:200,
                connected:resultSet.result.ok});
        }else{
            console.log("Server Error --------");
            console.log(err);
            callBack({status:400,error:err});
        }

    });
}



mongoose.model('FavouriteNewsCategory',FavouriteNewsCategorySchema)
