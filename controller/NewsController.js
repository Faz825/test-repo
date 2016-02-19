'use strict'

var NewsController ={

    /**
     * Add new News Category
     * @param req
     * @param res
     */
    addNewsCategory:function(req,res){

        var News = require('mongoose').model('News');

        //var categoryImage = req.body.categoryImg;
        //var _categoryName = req.body.categoryName;
        //TODO: Category Image Upload part

        var _category = {
            name:"Business",
            image:"images/pg-signup-6_03.png"
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
            return_fields:{category:1, categoryImage:1} // for now only getting _id, category, categoryImage only
        };


        News.findNews(criteria,function(resultSet){
            res.status(200).json(resultSet);
        });

    },

    /**
     * Delete a News Category
     * @param req
     * @param res
     */
    deleteNewsCategory:function(req,res){

        var News = require('mongoose').model('News');

        //var _categoryId = req.body.categoryId;
        var _categoryId = "56c704bc6a1888efb2d86549";

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

        //var categoryId = req.body.categoryId;
        //var channelName = req.body.channelName;
        //var channelUrl = req.body.channelUrl;
        //var channelImage = req.body.channelImage;

        var categoryId = "56c6ff13719ba417200e8671";
        var channelName = "Entrepreneur";
        var channelUrl = "http://www.entrepreneur.com/";
        var channelImage = "images/pg-signup-6_03.png";

        //TODO: Channel Image Upload part

        var channel = {
            name:channelName,
            channel_image:channelImage,
            url:channelUrl
        };

        News.addRecordToSubDocument(categoryId,{channels:channel},function(resultSet){
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

        //var categoryId = "56c6ff13719ba417200e8671";

        var criteria = {
            search:{_id:categoryId},
            return_fields:{channels:1} // for now only getting _id, category, categoryImage only
        };


        News.findNews(criteria,function(resultSet){
            res.status(200).json(resultSet);
        });

    },

    deleteNewsChannel:function(req,res){

    },

    addNews:function(req,res){

    },

    getNews:function(req,res){

    },

    deleteNews:function(req,res){

    }

};

module.exports = NewsController;