/*
* News COntainer Component
*/

import React from 'react';
import NewsArticalThumb from '../../components/elements/NewsArticalThumb';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import Session  from '../../middleware/Session';
import { Scrollbars } from 'react-custom-scrollbars';


export default class NewsSettings extends React.Component{
    constructor(props){
        super(props);

        this.state={
            loggedUser:Session.getSession('prg_lg'),
            data: {},
            isShowingModal : false,
            popUpContent : {},
            popup: "",
            news_categories :[]
        };

        this.onPopUp = this.onPopUp.bind(this);
        this.addNewsChannel = this.addNewsChannel.bind(this);
        this.removeNewsChannel = this.removeNewsChannel.bind(this);

        this.loadCategories();
        this.addNewsChannel();
        // this.removeNewsChannel();
    }

    loadCategories(){
        $.ajax({
            url: '/news/get-categories',
            method: "GET",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.state.loggedUser.token }
        }).done(function (data, text) {
            if (data.status.code == 200) {
                this.setState({news_categories:data.news})
            }
        }.bind(this));
    }

    addNewsChannel(){

        let channelData ={
            __channel_id: '56cbf9e18e015cad0e8a2ff8',
            __category_id: '56f7a1f596688d640db5b95c'
        };

        $.ajax({
            url: '/news/user-channel/composer',
            method: "POST",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.state.loggedUser.token },
            data: channelData,
            success: function (data, text) {
                if (data.status.code == 200) {
                    this.loadCategories();
                }
            }.bind(this),
            error: function (request, status, error) {
                console.log(status);
                console.log(error);
            }
        });

    }

    removeNewsChannel(){
        let channelData ={
            __channel_name: 'FoxNews',
            __category_id: '56f7a1fe96688d640db5b95d'
        };

        $.ajax({
            url: '/news/user-channel/remove',
            method: "POST",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.state.loggedUser.token },
            data: channelData,
            success: function (data, text) {
                if (data.status.code == 200) {
                    this.loadCategories();
                }
            }.bind(this),
            error: function (request, status, error) {
                console.log(status);
                console.log(error);
            }
        });
    }

    handleClose() {
        this.setState({isShowingModal: false});
    }

    onPopUp(id,type){

        let popupdata = this.articalCats,
            popup;

        for(var key in popupdata){
            popupdata[key].news.map(function(news){
                if (news.id === id) {
                    popup = news;
                }
            })
        }

        this.setState({isShowingModal: true, popup: popup});
    }

    getPopup(){
        let popupData = this.state.popup;

        return(
            <div>
                {this.state.isShowingModal &&
                    <ModalContainer onClose={this.handleClose.bind(this)} zIndex={9999}>
                        <ModalDialog onClose={this.handleClose.bind(this)} width="50%" style={{marginTop : "-100px"}}>
                            <div className="modal-body pg-modal-body">
                                <img className="img-responsive pg-main-pop-img" alt src={popupData.mainImgLink} />
                                <div className="row row-clr pg-new-news-popup-inner-container">
                                <h3 className="pg-body-heading-title">{popupData.title}</h3>
                                <div className="row row-clr pg-new-news-popup-inner-border" />
                                {}
                                <div dangerouslySetInnerHTML={{__html: popupData.description}} />
                                </div>
                            </div>

                        </ModalDialog>
                    </ModalContainer>
                }
            </div>
        )
    }
    onNewsCategoryClick(is_favourite,category_id){


        $.ajax({
            url: '/user/news/add-category',
            method: "POST",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.state.loggedUser.token },
            data:{nw_cat_id:category_id,fav:is_favourite}
        }).done(function (data, text) {
            console.log(data)
            if (data.status.code == 200) {
                this.loadCategories();

            }
        }.bind(this));

    }
    render() {

        const {
            news_categories
            } = this.state;

        let _this= this;
        let _news_category_template = news_categories.map(function(newsCategory,key){

            return(
                <NewsCategory newsCategory={newsCategory}
                              onCategorySelect={_this.onNewsCategoryClick.bind(_this)}
                              key={key} />
            )
        });


        return (
            <div className="newsCatHolder container-fluid">
                <div className="row row-clr pg-news-page-content">
                    <div className="row row-clr pg-news-page-header">
                        <div className="col-xs-10 col-xs-offset-1">
                            <div className="row">
                                <div className="col-xs-6">
                                    <h2 className="pg-connections-page-header-title">News</h2>
                                </div>
                                <div className="col-xs-6">
                                    <div className="row row-clr pg-interest-options-row">
                                        <div className="pg-my-con-option">
                                            <a href="#" className="pb-t-note-head-button pb-find-job-upload-button">Add new topic</a>
                                        </div>
                                        <div className="pg-my-con-option pg-my-con-option-sort pg-interest-options-sort">
                                            <select>
                                                <option>Sort by</option>
                                            </select>
                                        </div>
                                        <div className="pg-my-con-option pg-my-con-option-view pg-interest-options-view">
                                            <div className="pb-t-note-head-list pb-t-note-head-list-replica">
                                                <div className="pb-t-note-head-list-item pb-t-note-head-active">
                                                    <a href="#">
                                                        <img alt src="images/grid.png" />
                                                    </a>
                                                </div>
                                                <div className="pb-t-note-head-list-item">
                                                    <a href="#">
                                                        <i className="fa fa-bars" />
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="pg-my-con-option pg-my-con-option-search pg-interest-options-search">
                                            <input type="text" placeholder="Search..." />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xs-10 col-xs-offset-1">
                        <SavedArticles />
                        {
                            _news_category_template
                        }
                    </div>
                </div>
            </div>
        );
    }
}





const NewsCategory = ({newsCategory,onCategorySelect})=>{

    let _opt_class = newsCategory.category.toLowerCase();

    let _channel_template = newsCategory.channels.map(function(channel,key){
        return (
            <NewsChannels newsChannel ={channel}
                          key={key}/>
        )
    });

    let _selected = (newsCategory.is_favorite)?"selected":"";
    return (
        <div className={"row row-clr pg-news-page-content-item pg-box-shadow "+ _selected + " "+ _opt_class}
             onClick ={event=>onCategorySelect(newsCategory.is_favorite,newsCategory._id)}>

            <div className={"col-xs-2 pg-news-page-content-item-left-thumb "+_opt_class }>
                <div className="cat-icon-holder">
                    <span className="cat-icon"></span>
                    <h3 className="cat-title">{newsCategory.category}</h3>
                </div>
            </div>
            <div className="col-xs-10 pg-news-page-content-item-right-thumbs">
                <div className="pg-news-page-content-item-right-inner-box">
                    <div className="pg-news-item-main-row">

                        {_channel_template}
                    </div>
                </div>
            </div>
        </div>
    )

}


const NewsChannels = ({newsChannel})=>{

    let _channel_img = "/images/news/channels/"+newsChannel.channel_image;
    return (
        <div className="col-xs-2 pg-col-20 pg-news-item" >
            <div className="row row-clr pg-news-inner-full various">
                <img src={_channel_img} alt="" className="img-responsive pg-pg-news-inner-img" />
                <span className="delete-icon">
                    <i className="fa fa-times" aria-hidden="true"></i>
                </span>
            </div>
        </div>
    )
}


export class SavedArticles extends React.Component{

    constructor(props){
        super(props);
        this.state={
            articles:[],
            isShowingModal : false,
            popupData:"",
            allArticalsAreVisible: false,
            loggedUser:Session.getSession('prg_lg')
        };

        this.loadArticles();
        this.popUpArtical = this.popUpArtical.bind(this);
        this.showMoreArticals = this.showMoreArticals.bind(this);
    }

    loadArticles(){
        $.ajax({
            url: '/news/saved/articles',
            method: "GET",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.state.loggedUser.token }
        }).done(function (data, text) {
            if (data.status.code == 200) {
                this.setState({articles:data.news_list})
            }
        }.bind(this));
    }

    handleClose() {
        this.setState({isShowingModal: false});
    }

    getPopup(){
        let popupData = this.state.popupData;

        let _articalImage = '/images/image_not_found.png';
        if(popupData.article_image != null){
            _articalImage = popupData.article_image;
        }

        return(
            <div>
                {this.state.isShowingModal &&
                    <ModalContainer onClose={this.handleClose.bind(this)} zIndex={9999}>
                        <ModalDialog onClose={this.handleClose.bind(this)} width="50%">
                            <div className="modal-body pg-modal-body">
                                <div className="popup-img-holder">
                                    <img className="img-responsive pg-main-pop-img" alt src={_articalImage} />
                                </div>
                                <div className="row row-clr pg-new-news-popup-inner-container">
                                <h3 className="pg-body-heading-title">{popupData.heading}</h3>
                                <div className="row row-clr pg-new-news-popup-inner-border" />
                                <Scrollbars style={{ height: 250 }} onScroll={this.handleScroll}>
                                    <div dangerouslySetInnerHTML={{__html: popupData.content}} />
                                </Scrollbars>
                                </div>
                            </div>
                        </ModalDialog>
                    </ModalContainer>
                }
            </div>
        )
    }

    popUpArtical(data){
        this.setState({popupData: data, isShowingModal: true});
    }

    showMoreArticals(){
        let visibilityState = this.state.allArticalsAreVisible;
        this.setState({allArticalsAreVisible : !visibilityState});
    }

    render(){
        let _this = this;
        let _more_articals = "";
        let _channel_template = this.state.articles.map(function(articles,key){
            let _articalImage = '/images/image_not_found.png';
            if(articles.article.article_image != null){
                _articalImage = articles.article.article_image;
            }

            if(key < 5){
                return (
                    <div className="col-xs-2 pg-col-20 pg-news-item" key={key} onClick={_this.popUpArtical.bind(this, articles.article)}>
                          <div className="row row-clr pg-news-inner-full various">
                            <img src={_articalImage} alt={articles.article.channel} className="img-responsive pg-pg-news-inner-img" />
                            <div className="artical-heading-holder">
                                <p className="artical-name">{articles.article.heading}</p>
                            </div>
                        </div>
                    </div>
                )
            }

        });

        if (this.state.articles.length > 5) {
            _more_articals = this.state.articles.map(function(articles,key){
            let _articalImage = '/images/image_not_found.png';
            if(articles.article.article_image != null){
                _articalImage = articles.article.article_image;
            }
                if(key >= 5){
                    return (
                        <div className="col-xs-2 pg-col-20 pg-news-item" key={key} onClick={_this.popUpArtical.bind(this, articles.article)}>
                            <div className="row row-clr pg-news-inner-full various">
                                <img src={_articalImage} alt={articles.article.channel} className="img-responsive pg-pg-news-inner-img" />
                                <div className="artical-heading-holder">
                                    <p className="artical-name">{articles.article.heading}</p>
                                </div>
                            </div>
                        </div>
                    )
                }
            });
        }
        return(
            <div className="row row-clr pg-news-page-content-item pg-box-shadow">
                <div className="col-xs-2 pg-news-page-content-item-left-thumb saved-articals-holder">
                    <div className="cat-icon-holder">
                        <h3 className="cat-title">Saved Articles</h3>
                    </div>
                </div>
                <div className="col-xs-10 pg-news-page-content-item-right-thumbs">
                    <div className="pg-news-page-content-item-right-inner-box">
                        <div className="pg-news-item-main-row">
                            <div className="articals">
                                {_channel_template}
                            </div>
                            {
                                (this.state.allArticalsAreVisible)?
                                <div className="more-articals">
                                    {_more_articals}
                                </div>
                                :
                                null
                            }
                        </div>
                        {
                            (_more_articals)?
                            <div className="show-more-btn" onClick={this.showMoreArticals.bind(this)}>
                                {this.state.allArticalsAreVisible? "Show Less" : "Show More"}
                            </div>
                            :
                            null
                        }
                    </div>
                </div>
                {this.getPopup()}
            </div>

        )
    }

}
