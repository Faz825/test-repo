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
        }


        this.onPopUp = this.onPopUp.bind(this);

        this.loadCategories();
    }

    loadCategories(){
        $.ajax({
            url: '/news/get-categories',
            method: "GET",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.state.loggedUser.token },
        }).done(function (data, text) {
            if (data.status.code == 200) {

                this.setState({news_categories:data.news})
            }
        }.bind(this));
    }

    handleClose() {
        this.setState({isShowingModal: false});
    }

    onPopUp(id,type){
        console.log(id,type);

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

        console.log(popupData);
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
            loggedUser:Session.getSession('prg_lg')
        };

        this.loadArticles();
        this.popUpArtical = this.popUpArtical.bind(this);
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

    popUpArtical(data){
        this.setState({popupData: data, isShowingModal: true});
    }

    render(){
        let _this = this;
        let _channel_template = this.state.articles.map(function(articles,key){
            if(key <= 5){
                return (
                    <div className="col-xs-2 pg-col-20 pg-news-item" key={key} onClick={_this.popUpArtical.bind(this, articles)}>
                          <div className="row row-clr pg-news-inner-full various">
                            <img src={articles.article_image} alt={articles.channel} className="img-responsive pg-pg-news-inner-img" />
                            <div className="artical-heading-holder">
                                <p className="artical-name">{articles.heading}</p>
                            </div>
                        </div>
                    </div>
                )
            }

        });
        let _more_articals = this.state.articles.map(function(articles,key){
            if(key > 5){
                return (
                    <div className="col-xs-2 pg-col-20 pg-news-item" key={key} onClick={_this.popUpArtical.bind(this, articles)}>
                          <div className="row row-clr pg-news-inner-full various">
                            <img src={articles.article_image} alt={articles.channel} className="img-responsive pg-pg-news-inner-img" />
                            <div className="artical-heading-holder">
                                <p className="artical-name">{articles.heading}</p>
                            </div>
                        </div>
                    </div>
                )
            }
        });

        console.log(this.state.articles);
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
                            {_channel_template}
                            {
                                (_more_articals)?
                                <div className="more-articals">
                                    {_more_articals}
                                </div>
                                :
                                null
                            }
                        </div>
                    </div>
                </div>
                {this.getPopup()}
            </div>

        )
    }

}
