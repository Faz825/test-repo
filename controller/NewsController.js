'use strict';

/**
 * TODO: This class is for temporary usage only. This is just for  take  hard coded news  articles. Entire class need to be re do based on the requirment
 *
 */
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

        var News = require('mongoose').model('News'),
            _async = require('async'),
            FavouriteNewsCategory = require('mongoose').model('FavouriteNewsCategory'),
            CurrentSession = Util.getCurrentSession(req);


        var user_id=CurrentSession.id;

        _async.waterfall([
            function getFavouriteNewsCategories(callBack){

                FavouriteNewsCategory.getNewsCategoriesByUserId(user_id,function(resultSet){

                    callBack(null,resultSet.news_categories);
                });

            },
            function getAllNewsCategories(newsCategories,callBack){
                var criteria = {
                    search:{},
                    return_fields:{category:1, categoryImage:1,articles:1}
                }
                News.findNews(criteria,function(resultSet){
                    var _tmpOutPut = [];
                    for(var a=0;a<resultSet.news_list.length;a++){
                        var _tmpData = resultSet.news_list[a];
                        _tmpData.is_favorite = 0;
                        for(var i = 0; i< newsCategories.length;i++ ) {



                            if(newsCategories[i].category.toString() == _tmpData._id.toString()){
                                _tmpData.is_favorite = 1;
                                break;
                            }

                        }

                        _tmpOutPut.push(_tmpData)

                    }
                    callBack(null,_tmpOutPut);
                });

            }

        ],function(err,resultSet){
            var outPut ={
                status:ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                news:resultSet
            }
            res.status(200).json(outPut);
        })


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

    },

    addToFavourite:function(req,res){

        var FavouriteNewsCategory = require('mongoose').model('FavouriteNewsCategory'),
            news_categories = [],
            now = new Date(),
          CurrentSession = Util.getCurrentSession(req);

        //REMOVE IF ALREADY DID FAVOURITE
        if(req.body.fav == 1){

            var param ={
                user_id: Util.toObjectId(CurrentSession.id),
                category: Util.toObjectId(req.body.nw_cat_id),
            }
            FavouriteNewsCategory.unFavourite(param,function(resultSet){
                var outPut = {};
                if (resultSet.status !== 200) {
                    outPut['status'] = ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR);
                    res.status(400).send(outPut);
                    return 0;
                }

                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                res.status(200).json(outPut);
            });
        }else{
            news_categories.push(req.body.nw_cat_id);
            FavouriteNewsCategory.addUserNewsCategory(CurrentSession.id,news_categories,[],function(resultSet){
                var outPut = {};
                if (resultSet.status !== 200) {
                    outPut['status'] = ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR);
                    res.status(400).send(outPut);
                    return 0;
                }

                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                res.status(200).json(outPut);
                return 0;
            });
        }


    },

    /**
     * Get users saved articles from the database
     * @param req
     * @param res
     */
    getMyNews:function(req,res){
        var News = require('mongoose').model('News'),
            _async = require('async'),
            FavouriteNewsCategory = require('mongoose').model('FavouriteNewsCategory'),
            UsersSavedArticle = require('mongoose').model('UsersSavedArticle'),
            CurrentSession = Util.getCurrentSession(req);

        var user_id=CurrentSession.id;

        var dateArr = DateTime.oneWeekDate();

        _async.waterfall([
            function getMySavedArticles(callBack){

                var criteria ={
                    user_id:user_id,
                    created_at:{
                        $gte:dateArr.weekAgo,
                        $lte:dateArr.today
                    }
                };
                UsersSavedArticle.findSavedArticle(criteria,function(resultSet){
                    callBack(null,resultSet.news_list);
                })

            },
            function getFavouriteNewsCategories(saved_articles, callBack){

                FavouriteNewsCategory.getNewsCategoriesByUserId(user_id,function(resultSet){
                    callBack(null,saved_articles,resultSet.news_categories);
                });

            },
            function getAllNewsCategories(saved_articles,newsCategories,callBack){
                var criteria = {
                    search:{},
                    return_fields:{category:1, categoryImage:1}
                };
                News.findNews(criteria,function(resultSet){
                    var _tmpOutPut = [];

                    for(var a=0;a<resultSet.news_list.length;a++){
                        var _tmpData = resultSet.news_list[a];

                        for(var i = 0; i< newsCategories.length;i++ ) {
                            if(newsCategories[i].category.toString() == _tmpData._id.toString()){

                                //NESTED LOOPS USED FOR THIS SCENARIO ONLY
                                //CHANGE THIS FOR ACTUAL IMPLEMENTATION
                                for(var x = 0;x <_tmpData.channels.length;x++){

                                    if(_tmpData.channels[x].url != ""){

                                        var _channel = {
                                            id:_tmpData.channels[x]._id,
                                            name:_tmpData.channels[x].name,
                                            url:_tmpData.channels[x].url
                                        };

                                        var articles = [];

                                        for(var y = 0; y < saved_articles.length; y++){
                                            if(saved_articles[y].article.channel == _tmpData.channels[x].name){
                                                var _article = {
                                                    heading:saved_articles[y].article.heading,
                                                    article_date:saved_articles[y].article.article_date
                                                };
                                                articles.push(_article);
                                            }
                                        }
                                        _channel.articles = articles;
                                        _tmpOutPut.push(_channel)
                                    }
                                }
                                break;

                            }
                        }
                    }
                    callBack(null,_tmpOutPut);
                });
            }

        ],function(err,resultSet){

            NewsFeed.getNewsFeed(resultSet, function(data){
                var outPut ={
                    status:ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                    news:data
                };
                res.status(200).json(outPut);
            });
        })
    },

    /**
     * Save news Articles
     * @param req
     * @param res
     */
    saveMyNews:function(req,res){

        var SavedArticle = require('mongoose').model('SavedArticle'),
            UsersSavedArticle = require('mongoose').model('UsersSavedArticle'),
            _async = require('async'),
            CurrentSession = Util.getCurrentSession(req);
        //req.body.user_id = CurrentSession.id;

        var criteria ={
            heading:req.body.heading,
            article_date:req.body.article_date,
            channel:req.body.channel
        };

        _async.waterfall([
            function saveArticle(callBack){
                SavedArticle.findSavedArticle(criteria,function(resultSet){
                    if(resultSet.news_list.length>0){
                        callBack(null, resultSet.news_list[0]._id);
                    }else{
                        SavedArticle.saveArticle(req.body,function(resultSet){
                            callBack(null, resultSet.article._id);
                        });
                    }
                });

            },
            function saveUsersArticle(article_id,callBack){
                var data = {
                    user_id:CurrentSession.id,
                    article:article_id
                }
                UsersSavedArticle.saveArticle(data, function(resultSet){
                    callBack(null);
                });
            }

        ],function(err){
            var outPut ={
                status:ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS)
            };
            res.status(200).json(outPut);
        });

    },
    /**
     * Get saved Articles
     * @param req
     * @param res
     */

    getSavedArticles:function(req,res){
        var UsersSavedArticle = require('mongoose').model('UsersSavedArticle'), CurrentSession = Util.getCurrentSession(req);

        var criteria ={
            user_id:CurrentSession.id
        }
        UsersSavedArticle.findSavedArticle(criteria,function(resultSet){
            console.log(resultSet.news_list.article);
            var outPut ={
                status:ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                news_list:resultSet.news_list
            }
            res.status(200).json(outPut);
        })
    }

};

module.exports = NewsController;
