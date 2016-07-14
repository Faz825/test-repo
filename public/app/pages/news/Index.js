/**
 * This is news index class that handle all
 */

import React from 'react';
import AddPostElement from '../../components/timeline/AddPostElement';
import ListPostsElement from '../../components/timeline/ListPostsElement';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import { Scrollbars } from 'react-custom-scrollbars';
import Session  from '../../middleware/Session';
import Lib from '../../middleware/Lib';

export default class Index extends React.Component{
    constructor(props) {
        super(props);
        if(Session.getSession('prg_lg') == null){
            window.location.href = "/";
        }

        let user =  Session.getSession('prg_lg');
        this.state={
            uname:user.user_name,
            posts:[],
            news_articles:[],
            display_news_articles:[],
            display_articles_index:[],
            isShowingModal : false,
            popupData : {}
        };
        this.refreshInterval = null;
        this.loadPosts(0);
        this.loadNewsArticles();
        this.current_date = this.getCurrentDate();
        this.selectedArtical = this.selectedArtical.bind(this);
        this.onSaveArticleIconClick = this.onSaveArticleIconClick.bind(this);
        this.updatePostTime = this.updatePostTime.bind(this);
    }

    onPostSubmitSuccess(data){
        let _posts = this.state.posts;
        _posts.unshift(data);
        this.setState({posts:_posts});
    }

    onPostDeleteSuccess(index){
        let _posts = this.state.posts;
        _posts.splice(index,1);
        this.setState({posts:_posts});
    }

    loadPosts(page){
        let user = Session.getSession('prg_lg');
        let _this =  this;
        $.ajax({
            url: '/pull/posts',
            method: "GET",
            dataType: "JSON",
            data:{__pg:page,uname:_this.state.uname,__own:"all"},
            success: function (data, text) {
                if(data.status.code == 200){
                    this.setState({posts:data.posts})
                }

            }.bind(this),
            error: function (request, status, error) {
                console.log(status);
                console.log(error);
            }.bind(this)
        });
    }

    getRandomNewsArticles(){
        let _dis_art = [];
        let _dis_art_in = [];

        for( let j = 0; j < 10; j++){
            let _index = Math.floor(Math.random()*this.state.news_articles.length);
            _dis_art_in.push(_index);
            let _art = this.state.news_articles[_index];
            _dis_art.push(_art);
        }
        this.setState({display_articles_index:_dis_art_in});
        this.setState({display_news_articles:_dis_art});
    }

    componentDidMount(){
        window.setInterval(function () {
            this.updatePostTime();
        }.bind(this), 10000);
    }

    updatePostTime(){

        let _posts = this.state.posts;
        let _updatedPosts = [];
        for(var i = 0; i < _posts.length; i++){
            var data = _posts[i];
            var _timeAgo = Lib.timeAgo(data.date.time_stamp)
            data.date.time_a_go = _timeAgo;
            _updatedPosts.push(data);
        }

        this.setState({posts:_updatedPosts});

    }

    loadNewsArticles(){
        let _this = this;

        let loggedUser = Session.getSession('prg_lg');
        $.ajax({
            url: '/news/get/my/news-articles',
            method: "GET",
            dataType: "JSON",
            data:{__pg:0,__own:"all"},
            headers: { 'prg-auth-header':loggedUser.token }
        }).done( function (data, text) {
            if(data.status.code == 200){
                this.setState({news_articles:data.news});
                //this.setState({display_news_articles:data.news});
                _this.getRandomNewsArticles();
                if(data.news.length > 10){
                    this.refreshInterval = setInterval(function(){_this.getRandomNewsArticles()}, 60000);
                }else{
                    this.setState({display_news_articles:data.news});
                }
            }
        }.bind(this));
    }

    getCurrentDate(){
        let _current_date = new Date(),
            date = _current_date.getDate(),
            month = "January,February,March,April,May,June,July,August,September,October,November,December"
                .split(",")[_current_date.getMonth()];
        return month+" " +date+this._nth(date) +" "+_current_date.getFullYear()
    }

    _nth(date){
        if(date>3 && date<21) return 'th';
        switch (date % 10) {
            case 1:  return "st";
            case 2:  return "nd";
            case 3:  return "rd";
            default: return "th";
        }
    }

    handleClose() {
        let _this = this;
        this.setState({isShowingModal: false});
        this.refreshInterval = setInterval(function(){_this.getRandomNewsArticles()}, 60000);
    }
    saveArticle(){
        let _this = this;
        if(!this.state.popupData.isSaved){

            let dis_articles = this.state.display_news_articles;
            for(let i=0; i<dis_articles.length; i++){
                if(dis_articles[i].channel === this.state.popupData.channel && dis_articles[i].article_date === this.state.popupData.article_date && dis_articles[i].heading === this.state.popupData.heading){
                    dis_articles[i].isSaved = 1;
                    this.setState({display_news_articles:dis_articles});
                    let _index = this.state.display_articles_index[i];
                    let _news_art = this.state.news_articles;
                    _news_art[_index].isSaved = 1;
                    this.setState({news_articles:_news_art});
                }
            }

            let loggedUser = Session.getSession('prg_lg');
            $.ajax({
                url: '/news/articles/save',
                method: "POST",
                dataType: "JSON",
                data:this.state.popupData,
                headers: { 'prg-auth-header':loggedUser.token }
            }).done( function (data, text) {
                if(data.status.code == 200){
                    this.setState({isShowingModal: false});
                    this.refreshInterval = setInterval(function(){_this.getRandomNewsArticles()}, 60000);
                }
            }.bind(this));
        }
    }

    getPopup(){
        let popupData = this.state.popupData;

        let _articalImage = '/images/image_not_found.png';
        if(typeof popupData.article_image != 'undefined'){
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
                        <div className="save-news">
                            <a href="javascript:void(0)" onClick={this.saveArticle.bind(this)} className="artical-save-btn btn btn-default">Save</a>
                        </div>

                    </ModalDialog>
                </ModalContainer>
                }
            </div>
        )
    }


    selectedArtical(data){
        clearInterval(this.refreshInterval);
        this.setState({isShowingModal : true, popupData : data});
    }

    onSaveArticleIconClick(data){
        if(!data.isSaved){
            let _this = this;
            _this.setState({popupData : data},function(){
                clearInterval(this.refreshInterval);
                _this.saveArticle();
            });
        }
    }

    onLikeSuccess(index){
        let _posts = this.state.posts;
        _posts[index].is_i_liked=true;
        this.setState({posts:_posts});
    }

    render(){
        let _this = this;
        const {uname,posts,display_news_articles}= this.state;
        return(
            <div id="pg-newsfeed-page" className="pg-page">
                <div className="row row-clr">
                    <div className="container-fluid">
                        <div className="col-xs-10 col-xs-offset-1" id="middle-content-wrapper">
                            <div className="col-xs-4" id="news-middle-container-left-col">
                                <div id="pg-news-middle-container-left-col-details">
                                    <h2 className="pg-newsfeed-left-title-section-txt">NEWS</h2>
                                    <NewsArtical display_news_articles = {display_news_articles} selected = {_this.selectedArtical} saveArtical={_this.onSaveArticleIconClick}/>
                                    {this.getPopup()}
                                </div>
                            </div>
                            <div className="col-xs-8" id="newsfeed-middle-container-right-col">
                                <div className="row pg-newsfeed-right-title-section">
                                    <div className="col-xs-6">
                                        <h2 className="pg-newsfeed-right-title-section-txt">Updates</h2>
                                    </div>
                                    <div className="col-xs-6">
                                        <h3 className="pg-newsfeed-right-title-section-date">{this.current_date}</h3>
                                    </div>
                                </div>
                                <AddPostElement onPostSubmitSuccess ={this.onPostSubmitSuccess.bind(this)}
                                                uname = {uname}/>
                                <ListPostsElement posts={posts}
                                                  uname = {uname}
                                                  onPostSubmitSuccess= {this.onPostSubmitSuccess.bind(this)}
                                                  onPostDeleteSuccess = {this.onPostDeleteSuccess.bind(this)}
                                                  onLikeSuccess = {this.onLikeSuccess.bind(this)}/>
                            </div>
                            <div className="col-xs-6"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

}




export class NewsArtical extends React.Component{

    constructor(props){
        super(props);

    }


    onArticalSelect(newsItem){
        this.props.selected(newsItem);
    }

    saveArticle(newsItem){
        if(!newsItem.isSaved){
            this.props.saveArtical(newsItem);
        }
    }

    render(){
        let _this = this;
        if(this.props.display_news_articles.length <0){
            return(<div />);
        }

        let _news_item = this.props.display_news_articles.map(function(newsItem,key){
            let news_logo= "/images/news/"+newsItem.channel.toLowerCase()+".png";
            let _articalImage = '/images/image_not_found.png';
            if(typeof newsItem.article_image != 'undefined'){
                _articalImage = newsItem.article_image;
            }

            let _className = "fa fa-bookmark";
            if(newsItem.isSaved){
                _className += " blue_i";
            }
            return(
                <div className="row row-clr pg-newsfeed-left-post-item" onClick={event=>_this.onArticalSelect(newsItem)} key={key}>
                    <div className="row row-clr pg-newsfeed-left-post-item-main-img-wrapper">
                        <img src={_articalImage} className="img-responsive  pg-newsfeed-left-post-item-main-img"/>
                        <div className="pg-newsfeed-left-post-item-logo-wrapper">
                            <img src={news_logo} alt="" className="img-responsive"/>
                        </div>
                    </div>
                    <div className="row row-clr pg-newsfeed-left-post-item-main-content">
                        <h4 className="pg-newsfeed-left-post-item-main-content-title">
                            {newsItem.heading}
                        </h4>
                        <div className="artical-content-holder" dangerouslySetInnerHTML={{__html: newsItem.content}} />
                        <h5 className="pg-newsfeed-left-post-item-main-content-time">{newsItem.article_date}</h5>
                    </div>
                    <div className="row row-clr pg-newsfeed-left-post-item-status-section">
                        <div className="col-xs-4 rm-side-padding save-artical-btn">
                            <a href="#" className="pg-newsfeed-left-post-item-status-section-right-links" onClick={event=>_this.saveArticle(newsItem)}><i className={_className}></i> Save</a>
                        </div>
                    </div>
                </div>

            );
        });
        return(
            <div className="row row-clr pg-newsfeed-left-post-container">
                {_news_item}
            </div>
        );
    }
}
