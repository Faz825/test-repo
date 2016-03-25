'use strict';

var NewsController ={

    /**
     * Add new News Category
     * @param req
     * @param res
     */
    addNewsCategory:function(req,res){

        var News = require('mongoose').model('News');

        var categoryImage = req.body.categoryImg;
        var categoryName = req.body.categoryName;

        //TODO: Category Image Upload part

        var _category = {
            name:categoryName,
            image:categoryImage
        };

        News.addNewsCategory(_category,function(resultSet){
            if(resultSet.status == 200){
                res.status(200).send(ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS));
            }else{
                res.status(400).send(ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR));
            }
        });

    },

    /**
     * Get all News Categories
     * @param req
     * @param res
     */
    getNewsCategories:function(req,res){

        var News = require('mongoose').model('News');

        var criteria = {
            search:{},
            return_fields:{category:1, categoryImage:1} // for now only getting _id, category, categoryImage
        };

        News.findNews(criteria,function(resultSet){
            res.status(200).json(resultSet);
        });

    },

    /**
     * Get all news Cats. Including user favourites
     * @param req
     * @param res
     */
    allNewsCategories:function(req,res){
        var News = require('mongoose').model('News'),
            userFavNews = require('mongoose').model('favourite_news_categories');

        var userId = CurrentSession.id;

        
    },

    /**
     * Delete a News Category
     * @param req
     * @param res
     */
    deleteNewsCategory:function(req,res){

        var News = require('mongoose').model('News');

        var _categoryId = req.body.categoryId;

        //TODO: Category Image Delete from folder part

        News.deleteNewsCategory(_categoryId,function(resultSet){
            if(resultSet.status == 200){
                res.status(200).send(ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS));
            }else{
                res.status(400).send(ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR));
            }
        });

    },

    addNewsChannel:function(req,res){

        var News = require('mongoose').model('News');

        var categoryId = req.body.categoryId;
        var channelName = req.body.channelName;
        var channelUrl = req.body.channelUrl;
        var channelImage = req.body.channelImage;

        //TODO: Channel Image Upload part

        var channel = {
            name:channelName,
            channel_image:channelImage,
            url:channelUrl
        };

        News.addRecordToSubDocument({_id:categoryId},{channels:channel},function(resultSet){
            if(resultSet.status == 200){
                res.status(200).send(ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS));
            }else{
                res.status(400).send(ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR));
            }
        });

    },

    getNewsChannels:function(req,res){

        var News = require('mongoose').model('News');

        var categoryId = req.params.category;

        var criteria = {
            search:{_id:categoryId},
            return_fields:{channels:1} // for now only getting channels
        };

        News.findNews(criteria,function(resultSet){
            res.status(200).json(resultSet);
        });

    },

    deleteNewsChannel:function(req,res){

        var News = require('mongoose').model('News');

        var _categoryId = req.body.categoryId;
        var _channelId = req.body.channelId;

        //TODO: Channel Image Delete from folder part

        var criteria = {
            _id:_categoryId
        };

        var pullData = {
            channels:{_id:_channelId}
        };

        News.removeRecordFromSubDocument(criteria, pullData,function(resultSet){
            if(resultSet.status == 200){
                res.status(200).send(ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS));
            }else{
                res.status(400).send(ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR));
            }
        });

    },

    addNews:function(req,res){

        var News = require('mongoose').model('News');

        var categoryId = req.body.categoryId;
        var channelId = req.body.channelId;
        var articleHeading = req.body.articleHeading;
        var articleContent = req.body.articleContent;
        var articleImage = req.body.articleImage;
        var articleDate = req.body.articleDate;

        //var categoryId = "56cbeae0e975b0070ad200f8";
        //var channelId = "56cbf541a5a22e790dcac546";
        //var articleHeading = "First Heading Business";
        //var articleContent = "First Content Business";
        //var articleImage = "images/pg-signup-6_03.png";

        /*var categoryId = "56cbeae0e975b0070ad200f8";
        var channelId = "56cbf541a5a22e790dcac546";
        var articleHeading = "Third Heading Sports";
        var articleContent = "Third Content Sports";
        var articleImage = "images/pg-signup-6_03.png";*/

        //TODO: Article Image Upload part

        var article = {
            heading:articleHeading,
            article_image:articleImage,
            content:articleContent,
            article_date:articleDate
        };

        var criteria = {
            "_id":categoryId,
            "channels._id": channelId
        };
        News.addRecordToSubDocument(criteria,{"channels.$.articles":article},function(resultSet){
            if(resultSet.status == 200){
                res.status(200).send(ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS));
            }else{
                res.status(400).send(ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR));
            }
        });

    },

    getNews:function(req,res){

        var News = require('mongoose').model('News');

        var categoryId = req.params.category;
        var channelId = req.params.channel;

        var criteria = {
            search:{
                _id:categoryId,
                channels: { $elemMatch: { _id: channelId }}
            },
            return_fields:{"channels.$.articles":1} // for now only getting channels
        };


        News.findNews(criteria,function(resultSet){
            res.status(200).json(resultSet);
        });

    },

    deleteNews:function(req,res){

        var News = require('mongoose').model('News');

        //var _categoryId = req.body.categoryId;
        //var _channelId = req.body.channelId;
        //var _articleId = req.body.articleId;

        var _categoryId = "56cbeb3d703431a80ab2e1c4";
        var _channelId = "56cbf9643f65367f0e8f19f2";
        var _articleId = "56cc2e8fbefd3610158776eb";

        //TODO: Article Image Delete from folder part

        var criteria = {
            _id:_categoryId,
            "channels._id": _channelId
        };

        var pullData = {
            "channels.$.articles":{_id:_articleId}
        };

        News.removeRecordFromSubDocument(criteria, pullData,function(resultSet){
            if(resultSet.status == 200){
                res.status(200).send(ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS));
            }else{
                res.status(400).send(ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR));
            }
        });

    }

};

module.exports = NewsController;
