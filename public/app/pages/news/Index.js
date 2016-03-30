/**
 * This is news index class that handle all
 */


import React from 'react';
import AddPostElement from '../../components/timeline/AddPostElement';
import ListPostsElement from '../../components/timeline/ListPostsElement';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import { Scrollbars } from 'react-custom-scrollbars';
import Session  from '../../middleware/Session';

export default class Index extends React.Component{
    constructor(props) {
        super(props);
        let user =  Session.getSession('prg_lg');
        this.state={
            uname:user.user_name,
            posts:[],
            news_articles:[]
        }
        this.loadPosts(0);
        this.loadNewsArticles();
        this.current_date = this.getCurrentDate();

    }
    onPostSubmitSuccess(data){

        let _posts = this.state.posts;
        _posts.unshift(data);
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

    loadNewsArticles(){
        let loggedUser = Session.getSession('prg_lg');
        $.ajax({
            url: '/news/get/my/news-articles',
            method: "GET",
            dataType: "JSON",
            data:{__pg:0,__own:"all"},
            headers: { 'prg-auth-header':loggedUser.token },
        }).done( function (data, text) {
            if(data.status.code == 200){
                this.setState({news_articles:data.news})
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
    render(){
        const {uname,posts,news_articles}= this.state;
        return(
            <div id="pg-newsfeed-page" className="pg-page">
                <div className="row row-clr">
                    <div className="container-fluid">
                        <div className="col-xs-10 col-xs-offset-1" id="middle-content-wrapper">

                            <div className="col-xs-4" id="news-middle-container-left-col">


                                <div id="pg-news-middle-container-left-col-details">
                                    <h2 className="pg-newsfeed-left-title-section-txt">NEWS</h2>

                                    <NewsArtical news_articles = {news_articles}/>
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
                                                  onPostSubmitSuccess= {this.onPostSubmitSuccess.bind(this)}/>
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
        this.state={
            news_articles:this.props.news_articles,
            isShowingModal : false,
            popupData : ""
        }

        this.selectedArtical = this.selectedArtical.bind(this);

    }

    handleClose() {
        this.setState({isShowingModal: false});
    }

    getPopup(){
        let popupData = this.state.popupData;

        return(
            <div>
                {this.state.isShowingModal &&
                    <ModalContainer onClose={this.handleClose.bind(this)} zIndex={9999}>
                        <ModalDialog onClose={this.handleClose.bind(this)} width="50%">
                            <div className="modal-body pg-modal-body">
                                <div className="popup-img-holder">
                                    <img className="img-responsive pg-main-pop-img" alt src={popupData.article_image} />
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


    selectedArtical(data){
        console.log(data);
        this.setState({isShowingModal : true, popupData : data});
    }

    render(){
        let _this = this;
        if(this.props.news_articles.length <0){
            return(<div />);
        }

        let _news_item = this.props.news_articles.map(function(newsItem,key){
            return(
                <NewsItem newsItem ={newsItem} selected={_this.selectedArtical}
                          key={key}/>
            );
        });
        return(
            <div className="row row-clr pg-newsfeed-left-post-container">
                {_news_item}
                {this.getPopup()}
            </div>
        );
    }
}


export const NewsItem =({newsItem,selected})=>{


    let news_logo= "/images/news/"+newsItem.channel.toLowerCase()+".png";

    function createMarkup() { return {__html: newsItem.content}; };

    function onArticalSelect(){
            selected(newsItem);
    }

    return(
        <div className="row row-clr pg-newsfeed-left-post-item" onClick={event=>onArticalSelect(event)}>
            <div className="row row-clr pg-newsfeed-left-post-item-main-img-wrapper">
                <img src={newsItem.article_image} className="img-responsive  pg-newsfeed-left-post-item-main-img"/>
                <div className="pg-newsfeed-left-post-item-logo-wrapper">
                    <img src={news_logo} alt="" className="img-responsive"/>
                </div>
            </div>
            <div className="row row-clr pg-newsfeed-left-post-item-main-content">
                <h4 className="pg-newsfeed-left-post-item-main-content-title">
                    {newsItem.heading}
                </h4>
                <div className="artical-content-holder" dangerouslySetInnerHTML={createMarkup()} />
                <h5 className="pg-newsfeed-left-post-item-main-content-time">December 08 at 3:20pm</h5>
            </div>
            <div className="row row-clr pg-newsfeed-left-post-item-status-section">

                <div className="col-xs-4 rm-side-padding">
                    <a href="#" className="pg-newsfeed-left-post-item-status-section-right-links"><i className="fa fa-bookmark"></i> Save</a>
                </div>
            </div>

        </div>
    );

};
