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
import Moment from 'moment';

export default class Index extends React.Component{
    constructor(props) {
        super(props);
        if(Session.getSession('prg_lg') == null){
            window.location.href = "/";
        }

        let _newsFeed = false;
        this.checkWorkModeInterval = null;

        if(Session.getSession('prg_wm') != null){
            let _currentTime = new Date().getTime();
            let _finishTime = Session.getSession('prg_wm').endTime;

            if (_currentTime > _finishTime){
                Session.destroy("prg_wm");
            } else{
                let _this = this;
                _newsFeed = Session.getSession('prg_wm').newsFeed;
                if(_newsFeed == true){
                    this.checkWorkModeInterval = setInterval(function(){_this.checkWorkMode()}, 1000);
                }
            }
        }

        let user =  Session.getSession('prg_lg');
        this.state={
            uname:user.user_name,
            posts:[],
            news_articles:[],
            display_news_articles:[],
            display_articles_index:[],
            isShowingModal : false,
            popupData : {},
            blockNewsFeed:_newsFeed
        };
        this.refreshInterval = null;
        this.postType = 1; // [ PERSONAL_POST:1, GROUP_POST:2 ]
        this.postVisibleMode = 1; // [ PUBLIC:1, FRIEND_ONLY:2, ONLY_MY:3, SELECTED_USERS:4, GROUP_MEMBERS:5 ]

        this.current_date = this.getCurrentDate();
        this.selectedArtical = this.selectedArtical.bind(this);
        this.onSaveArticleIconClick = this.onSaveArticleIconClick.bind(this);
        this.updatePostTime = this.updatePostTime.bind(this);

        if(this.state.blockNewsFeed == false){
            this.loadPosts(0);
            this.loadNewsArticles();
        }
    }

    onLoadProfile(user_name){
        window.location.href = '/profile/'+user_name;
    }

    checkWorkMode(){
        //console.log("checkWorkMode from NewsFeed")
        if(Session.getSession('prg_wm') != null){
            let _currentTime = new Date().getTime();
            let _finishTime = Session.getSession('prg_wm').endTime;

            if (_currentTime > _finishTime){
                console.log("TIME UP from NewsFeed")
                this.setState({blockNewsFeed:false})
                Session.destroy("prg_wm");
                clearInterval(this.checkWorkModeInterval);
                this.checkWorkModeInterval = null;
                this.loadPosts(0);
                this.loadNewsArticles();
            }
        } else{
            this.setState({blockNewsFeed:false})
            clearInterval(this.checkWorkModeInterval);
            this.checkWorkModeInterval = null;
            this.loadPosts(0);
            this.loadNewsArticles();
        }
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
            if(this.state.blockNewsFeed == false){
                this.updatePostTime();
            }
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
                <ModalContainer onClose={this.handleClose.bind(this)} zIndex={9999} >
                    <ModalDialog onClose={this.handleClose.bind(this)} width="840" className="news-popup-holder">
                        <div className="modal-body pg-modal-body">
                            <div className="popup-img-holder">
                                <img className="img-responsive pg-main-pop-img" alt="" src={_articalImage} />
                            </div>
                            <div className="row row-clr pg-new-news-popup-inner-container">
                                <h3 className="pg-body-heading-title">{popupData.heading}</h3>
                                <div className="row row-clr pg-new-news-popup-inner-border" />
                                <Scrollbars style={{ height: 250 }} onScroll={this.handleScroll}>
                                    <div dangerouslySetInnerHTML={{__html: popupData.content}} />
                                </Scrollbars>
                            </div>
                            <img src={'/images/news/'+popupData.channel+'.png'} className="chanel-logo"/>
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
        let user = Session.getSession('prg_lg');
        let _secretary_image = user.secretary_image_url;
        const {uname,posts,display_news_articles}= this.state;
        console.log(user);

        console.log("=====NEWSFEED======"+this.state.blockNewsFeed);
        //TODO::
        // if blockNewsFeed true need to blur the screen and show secretary image
        let workmodeClass = (this.state.blockNewsFeed)?"workmode-switched":"";

        return(
            <section className="news-feed-container">
                {/*<div id="pg-newsfeed-page" className="pg-page">
                    <div className="row row-clr">
                        <div className="container" id="middle-content-wrapper">
                            <div className="row">
                                <div className="col-xs-4" id="news-middle-container-left-col">
                                    <div id="pg-news-middle-container-left-col-details">
                                        <h2 className="pg-newsfeed-left-title-section-txt">NEWS</h2>
                                        <NewsArtical display_news_articles = {display_news_articles} selected = {_this.selectedArtical} saveArtical={_this.onSaveArticleIconClick}/>
                                        {this.getPopup()}
                                    </div>
                                </div>
                                <div className="col-xs-8" id="newsfeed-middle-container-right-col">
                                    <div className="row pg-newsfeed-right-title-section">
                                        <div className="col-xs-5">
                                            <h2 className="pg-newsfeed-right-title-section-txt">Updates</h2>
                                        </div>
                                        <div className="col-xs-7">
                                            <h3 className="pg-newsfeed-right-title-section-date">{this.current_date}</h3>
                                        </div>
                                    </div>
                                    <AddPostElement
                                        workModeStyles={workmodeClass}
                                        onPostSubmitSuccess ={this.onPostSubmitSuccess.bind(this)}
                                        uname = {uname}
                                        profileUsr={user}
                                        connectionStatus={this.state.connectionStatus}
                                        postType={this.postType}
                                        postVisibleMode={this.postVisibleMode}
                                    />
                                    <ListPostsElement posts={this.state.posts}
                                                    uname = {uname}
                                                    onPostSubmitSuccess= {this.onPostSubmitSuccess.bind(this)}
                                                    onPostDeleteSuccess = {this.onPostDeleteSuccess.bind(this)}
                                                    onLikeSuccess = {this.onLikeSuccess.bind(this)}
                                                    onLoadProfile = {this.onLoadProfile.bind(this)}
                                    />
                                </div>
                                <div className="col-xs-6"></div>
                            </div>
                        </div>
                        {
                            (this.state.blockNewsFeed)?
                            <div className="workmode-overlay-holder">
                                <div className="row">
                                    <div className="container">
                                        <div className="secretary-holder">
                                            <img src={_secretary_image} alt="Secretary" className="img-responsive"/>
                                        </div>
                                        <div className="msg-holder">
                                            <h3>{user.first_name + " " + user.last_name}, Don't get distracted, get back to
                                                work!</h3>
                                            <img className="arrow" src="images/workmode_msg_arrow.png"/>
                                        </div>
                                    </div>
                                </div>
                            </div> : null
                        }
                    </div>
                </div>*/}
                <div className="container">
                    <div className="feed-container">
                        <div className="row">
                            <div className="col-sm-4">
                                <div className="news-feed-header-block">
                                    <div className="left-col pull-left">
                                        <p className="title">news</p>
                                        <div className="sub-title">
                                            <span className="option active">latest</span>
                                            <span className="slash">/</span>
                                            <span className="option">trending</span>
                                        </div>
                                    </div>
                                    <div className="right-col pull-right">
                                        <span className="options-button"></span>
                                    </div>
                                </div>
                                <div className="news-channels-section">
                                    <NewsArtical display_news_articles = {display_news_articles} selected = {_this.selectedArtical} saveArtical={_this.onSaveArticleIconClick}/>
                                    {this.getPopup()}
                                </div>
                            </div>
                            <div className="col-sm-8">
                                <div className="news-feed-header-block">
                                    <div className="left-col pull-left">
                                        <p className="title">updates</p>
                                        <div className="sub-title">
                                            <span className="option active">friends</span>
                                            <span className="slash">/</span>
                                            <span className="option">interests</span>
                                        </div>
                                    </div>
                                    <div className="right-col pull-right">
                                        <span className="settings-button"></span>
                                        <span className="date">{Moment().format("MMMM Do, YYYY")}</span>
                                    </div>
                                </div>
                                <div className="outer-wrapper clearfix">
                                    <AddPostElement
                                            workModeStyles={workmodeClass}
                                            onPostSubmitSuccess ={this.onPostSubmitSuccess.bind(this)}
                                            uname = {uname}
                                            profileUsr={user}
                                            connectionStatus={this.state.connectionStatus}
                                            postType={this.postType}
                                            postVisibleMode={this.postVisibleMode}
                                        />
                                    <ListPostsElement posts={this.state.posts}
                                                        uname = {uname}
                                                        onPostSubmitSuccess= {this.onPostSubmitSuccess.bind(this)}
                                                        onPostDeleteSuccess = {this.onPostDeleteSuccess.bind(this)}
                                                        onLikeSuccess = {this.onLikeSuccess.bind(this)}
                                                        onLoadProfile = {this.onLoadProfile.bind(this)}
                                        />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
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
            let news_logo= 'url(/images/news/'+newsItem.channel.toLowerCase()+'.png)';
            let _articalImage = '/images/image_not_found.png';
            if(typeof newsItem.article_image != 'undefined'){
                _articalImage = newsItem.article_image;
            }

            let _className = "bookmark";
            if(newsItem.isSaved){
                _className += " active";
            }

            let desc;
            if (newsItem.content.length > 59) {
                desc = newsItem.content.substring(0, 59) + "...";
            }
            return(
                <div className="news-block" onClick={event=>_this.onArticalSelect(newsItem)} key={key}>
                {/*<div className="row row-clr pg-newsfeed-left-post-item" onClick={event=>_this.onArticalSelect(newsItem)} key={key}>
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
                </div>*/}
                    <div className="news-thumb">
                        <img src={_articalImage} width="284" height="187"/>
                        <span className="channel-logo" style={{backgroundImage: news_logo, backgroundSize: "cover"}}></span>
                    </div>
                    <div className="news-body">
                        <p className="news-title">{newsItem.heading}</p>
                        <div className="news-description" dangerouslySetInnerHTML={{__html: desc}} />
                        <div className="news-block-footer">
                            <span className="date">{newsItem.article_date}</span>
                            <span className={_className} onClick={event=>_this.saveArticle(newsItem)}></span>
                        </div>
                    </div>
                </div>
            );
        });
        return(
            <div className="news-block-holder">
                {_news_item}
            </div>
        );
    }
}
