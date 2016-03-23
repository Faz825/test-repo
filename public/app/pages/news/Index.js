/*
* News COntainer Component
*/
import React from 'react';
import NewsArticalThumb from '../../components/elements/NewsArticalThumb';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';

let newsArticals = [{
    type : "business",
    news: [
            {"id": 1, "name": "Its Opening", "timeDuration": "4" , "imgLink": "images/news-page-sub-item-thumb-2.png","title" : "News Artical Title","mainImgLink" : "images/pg-news-popup-tech-banner.png","description" : "<p>After over a year\’s worth of controversy around Facebook\’s real names policy, Facebook has announced a couple of changes to its process in order to better serve all of its members, including those in the LGBTQ community.</p><p>Last October, Facebook promised it would make changes to its real name policy after a number of false account flagging incidents led to the suspension of LGBTQ members\’ pages. Facebook requires people to use the names their friends and family know them by. For many drag performers, for example, their drag names are the names people know them by, but that didn’t prevent the suspension of their accounts.</p>"
            },
            {"id": 2, "name": "Google Work", "timeDuration": "2" , "imgLink": "images/news-page-sub-item-thumb-4.png","title" : "News Artical Title","mainImgLink" : "images/pg-news-popup-tech-banner.png","description" : "<p>After over a year\’s worth of controversy around Facebook\’s real names policy, Facebook has announced a couple of changes to its process in order to better serve all of its members, including those in the LGBTQ community.</p><p>Last October, Facebook promised it would make changes to its real name policy after a number of false account flagging incidents led to the suspension of LGBTQ members\’ pages. Facebook requires people to use the names their friends and family know them by. For many drag performers, for example, their drag names are the names people know them by, but that didn’t prevent the suspension of their accounts.</p>"
            },
            {"id": 3, "name": "Google at Work", "timeDuration": "3" , "imgLink": "images/news-page-sub-item-thumb-3.png","title" : "News Artical Title","mainImgLink" : "images/pg-news-popup-tech-banner.png","description" : "<p>After over a year\’s worth of controversy around Facebook\’s real names policy, Facebook has announced a couple of changes to its process in order to better serve all of its members, including those in the LGBTQ community.</p><p>Last October, Facebook promised it would make changes to its real name policy after a number of false account flagging incidents led to the suspension of LGBTQ members\’ pages. Facebook requires people to use the names their friends and family know them by. For many drag performers, for example, their drag names are the names people know them by, but that didn’t prevent the suspension of their accounts.</p>"
            },
            {"id": 4, "name": "Microsoft", "timeDuration": "1" , "imgLink": "images/news-page-sub-item-thumb-3.png","title" : "News Artical Title","mainImgLink" : "images/pg-news-popup-tech-banner.png","description" : "<p>After over a year\’s worth of controversy around Facebook\’s real names policy, Facebook has announced a couple of changes to its process in order to better serve all of its members, including those in the LGBTQ community.</p><p>Last October, Facebook promised it would make changes to its real name policy after a number of false account flagging incidents led to the suspension of LGBTQ members\’ pages. Facebook requires people to use the names their friends and family know them by. For many drag performers, for example, their drag names are the names people know them by, but that didn’t prevent the suspension of their accounts.</p>"
            },
            {"id": 5, "name": "Google at Work", "timeDuration": "2" , "imgLink": "images/news-page-sub-item-thumb-3.png","title" : "News Artical Title","mainImgLink" : "images/pg-news-popup-tech-banner.png","description" : "<p>After over a year\’s worth of controversy around Facebook\’s real names policy, Facebook has announced a couple of changes to its process in order to better serve all of its members, including those in the LGBTQ community.</p><p>Last October, Facebook promised it would make changes to its real name policy after a number of false account flagging incidents led to the suspension of LGBTQ members\’ pages. Facebook requires people to use the names their friends and family know them by. For many drag performers, for example, their drag names are the names people know them by, but that didn’t prevent the suspension of their accounts.</p>"
            },
            {"id": 6, "name": "Its Opening", "timeDuration": "4" , "imgLink": "images/news-page-sub-item-thumb-2.png","title" : "News Artical Title","mainImgLink" : "images/pg-news-popup-tech-banner.png","description" : "<p>After over a year\’s worth of controversy around Facebook\’s real names policy, Facebook has announced a couple of changes to its process in order to better serve all of its members, including those in the LGBTQ community.</p><p>Last October, Facebook promised it would make changes to its real name policy after a number of false account flagging incidents led to the suspension of LGBTQ members\’ pages. Facebook requires people to use the names their friends and family know them by. For many drag performers, for example, their drag names are the names people know them by, but that didn’t prevent the suspension of their accounts.</p>"
            },
            {"id": 7, "name": "Google Work", "timeDuration": "2" , "imgLink": "images/news-page-sub-item-thumb-4.png","title" : "News Artical Title","mainImgLink" : "images/pg-news-popup-tech-banner.png","description" : "<p>After over a year\’s worth of controversy around Facebook\’s real names policy, Facebook has announced a couple of changes to its process in order to better serve all of its members, including those in the LGBTQ community.</p><p>Last October, Facebook promised it would make changes to its real name policy after a number of false account flagging incidents led to the suspension of LGBTQ members\’ pages. Facebook requires people to use the names their friends and family know them by. For many drag performers, for example, their drag names are the names people know them by, but that didn’t prevent the suspension of their accounts.</p>"
            },
            {"id": 8, "name": "Google at Work", "timeDuration": "3" , "imgLink": "images/news-page-sub-item-thumb-3.png","title" : "News Artical Title","mainImgLink" : "images/pg-news-popup-tech-banner.png","description" : "<p>After over a year\’s worth of controversy around Facebook\’s real names policy, Facebook has announced a couple of changes to its process in order to better serve all of its members, including those in the LGBTQ community.</p><p>Last October, Facebook promised it would make changes to its real name policy after a number of false account flagging incidents led to the suspension of LGBTQ members\’ pages. Facebook requires people to use the names their friends and family know them by. For many drag performers, for example, their drag names are the names people know them by, but that didn’t prevent the suspension of their accounts.</p>"
            },
            {"id": 9, "name": "Microsoft", "timeDuration": "1" , "imgLink": "images/news-page-sub-item-thumb-3.png","title" : "News Artical Title","mainImgLink" : "images/pg-news-popup-tech-banner.png","description" : "<p>After over a year\’s worth of controversy around Facebook\’s real names policy, Facebook has announced a couple of changes to its process in order to better serve all of its members, including those in the LGBTQ community.</p><p>Last October, Facebook promised it would make changes to its real name policy after a number of false account flagging incidents led to the suspension of LGBTQ members\’ pages. Facebook requires people to use the names their friends and family know them by. For many drag performers, for example, their drag names are the names people know them by, but that didn’t prevent the suspension of their accounts.</p>"
            },
            {"id": 10, "name": "Google at Work", "timeDuration": "2" , "imgLink": "images/news-page-sub-item-thumb-3.png","title" : "News Artical Title","mainImgLink" : "images/pg-news-popup-tech-banner.png","description" : "<p>After over a year\’s worth of controversy around Facebook\’s real names policy, Facebook has announced a couple of changes to its process in order to better serve all of its members, including those in the LGBTQ community.</p><p>Last October, Facebook promised it would make changes to its real name policy after a number of false account flagging incidents led to the suspension of LGBTQ members\’ pages. Facebook requires people to use the names their friends and family know them by. For many drag performers, for example, their drag names are the names people know them by, but that didn’t prevent the suspension of their accounts.</p>"
            }
        ]
},
{
    type : "sports",
    news: [
            {"id": 11, "name": "Its Opening", "timeDuration": "4" , "imgLink": "images/news-page-sub-item-thumb-2.png","title" : "News Artical Title","mainImgLink" : "images/pg-news-popup-tech-banner.png","description" : "<p>After over a year\’s worth of controversy around Facebook\’s real names policy, Facebook has announced a couple of changes to its process in order to better serve all of its members, including those in the LGBTQ community.</p><p>Last October, Facebook promised it would make changes to its real name policy after a number of false account flagging incidents led to the suspension of LGBTQ members\’ pages. Facebook requires people to use the names their friends and family know them by. For many drag performers, for example, their drag names are the names people know them by, but that didn’t prevent the suspension of their accounts.</p>"
            },
            {"id": 12, "name": "Google Work", "timeDuration": "2" , "imgLink": "images/news-page-sub-item-thumb-4.png","title" : "News Artical Title","mainImgLink" : "images/pg-news-popup-tech-banner.png","description" : "<p>After over a year\’s worth of controversy around Facebook\’s real names policy, Facebook has announced a couple of changes to its process in order to better serve all of its members, including those in the LGBTQ community.</p><p>Last October, Facebook promised it would make changes to its real name policy after a number of false account flagging incidents led to the suspension of LGBTQ members\’ pages. Facebook requires people to use the names their friends and family know them by. For many drag performers, for example, their drag names are the names people know them by, but that didn’t prevent the suspension of their accounts.</p>"
            },
            {"id": 13, "name": "Google at Work", "timeDuration": "3" , "imgLink": "images/news-page-sub-item-thumb-3.png","title" : "News Artical Title","mainImgLink" : "images/pg-news-popup-tech-banner.png","description" : "<p>After over a year\’s worth of controversy around Facebook\’s real names policy, Facebook has announced a couple of changes to its process in order to better serve all of its members, including those in the LGBTQ community.</p><p>Last October, Facebook promised it would make changes to its real name policy after a number of false account flagging incidents led to the suspension of LGBTQ members\’ pages. Facebook requires people to use the names their friends and family know them by. For many drag performers, for example, their drag names are the names people know them by, but that didn’t prevent the suspension of their accounts.</p>"
            },
            {"id": 14, "name": "Microsoft", "timeDuration": "1" , "imgLink": "images/news-page-sub-item-thumb-3.png","title" : "News Artical Title","mainImgLink" : "images/pg-news-popup-tech-banner.png","description" : "<p>After over a year\’s worth of controversy around Facebook\’s real names policy, Facebook has announced a couple of changes to its process in order to better serve all of its members, including those in the LGBTQ community.</p><p>Last October, Facebook promised it would make changes to its real name policy after a number of false account flagging incidents led to the suspension of LGBTQ members\’ pages. Facebook requires people to use the names their friends and family know them by. For many drag performers, for example, their drag names are the names people know them by, but that didn’t prevent the suspension of their accounts.</p>"
            },
            {"id": 15, "name": "Google at Work", "timeDuration": "2" , "imgLink": "images/news-page-sub-item-thumb-3.png","title" : "News Artical Title","mainImgLink" : "images/pg-news-popup-tech-banner.png","description" : "<p>After over a year\’s worth of controversy around Facebook\’s real names policy, Facebook has announced a couple of changes to its process in order to better serve all of its members, including those in the LGBTQ community.</p><p>Last October, Facebook promised it would make changes to its real name policy after a number of false account flagging incidents led to the suspension of LGBTQ members\’ pages. Facebook requires people to use the names their friends and family know them by. For many drag performers, for example, their drag names are the names people know them by, but that didn’t prevent the suspension of their accounts.</p>"
            },
            {"id": 16, "name": "Its Opening", "timeDuration": "4" , "imgLink": "images/news-page-sub-item-thumb-2.png","title" : "News Artical Title","mainImgLink" : "images/pg-news-popup-tech-banner.png","description" : "<p>After over a year\’s worth of controversy around Facebook\’s real names policy, Facebook has announced a couple of changes to its process in order to better serve all of its members, including those in the LGBTQ community.</p><p>Last October, Facebook promised it would make changes to its real name policy after a number of false account flagging incidents led to the suspension of LGBTQ members\’ pages. Facebook requires people to use the names their friends and family know them by. For many drag performers, for example, their drag names are the names people know them by, but that didn’t prevent the suspension of their accounts.</p>"
            },
            {"id": 17, "name": "Google Work", "timeDuration": "2" , "imgLink": "images/news-page-sub-item-thumb-4.png","title" : "News Artical Title","mainImgLink" : "images/pg-news-popup-tech-banner.png","description" : "<p>After over a year\’s worth of controversy around Facebook\’s real names policy, Facebook has announced a couple of changes to its process in order to better serve all of its members, including those in the LGBTQ community.</p><p>Last October, Facebook promised it would make changes to its real name policy after a number of false account flagging incidents led to the suspension of LGBTQ members\’ pages. Facebook requires people to use the names their friends and family know them by. For many drag performers, for example, their drag names are the names people know them by, but that didn’t prevent the suspension of their accounts.</p>"
            },
            {"id": 18, "name": "Google at Work", "timeDuration": "3" , "imgLink": "images/news-page-sub-item-thumb-3.png","title" : "News Artical Title","mainImgLink" : "images/pg-news-popup-tech-banner.png","description" : "<p>After over a year\’s worth of controversy around Facebook\’s real names policy, Facebook has announced a couple of changes to its process in order to better serve all of its members, including those in the LGBTQ community.</p><p>Last October, Facebook promised it would make changes to its real name policy after a number of false account flagging incidents led to the suspension of LGBTQ members\’ pages. Facebook requires people to use the names their friends and family know them by. For many drag performers, for example, their drag names are the names people know them by, but that didn’t prevent the suspension of their accounts.</p>"
            },
            {"id": 19, "name": "Microsoft", "timeDuration": "1" , "imgLink": "images/news-page-sub-item-thumb-3.png","title" : "News Artical Title","mainImgLink" : "images/pg-news-popup-tech-banner.png","description" : "<p>After over a year\’s worth of controversy around Facebook\’s real names policy, Facebook has announced a couple of changes to its process in order to better serve all of its members, including those in the LGBTQ community.</p><p>Last October, Facebook promised it would make changes to its real name policy after a number of false account flagging incidents led to the suspension of LGBTQ members\’ pages. Facebook requires people to use the names their friends and family know them by. For many drag performers, for example, their drag names are the names people know them by, but that didn’t prevent the suspension of their accounts.</p>"
            },
            {"id": 20, "name": "Google at Work", "timeDuration": "2" , "imgLink": "images/news-page-sub-item-thumb-3.png","title" : "News Artical Title","mainImgLink" : "images/pg-news-popup-tech-banner.png","description" : "<p>After over a year\’s worth of controversy around Facebook\’s real names policy, Facebook has announced a couple of changes to its process in order to better serve all of its members, including those in the LGBTQ community.</p><p>Last October, Facebook promised it would make changes to its real name policy after a number of false account flagging incidents led to the suspension of LGBTQ members\’ pages. Facebook requires people to use the names their friends and family know them by. For many drag performers, for example, their drag names are the names people know them by, but that didn’t prevent the suspension of their accounts.</p>"
            }
        ]
}]

export default class Index extends React.Component{
    constructor(props){
        super(props);

        this.state={
            isShowingModal : false,
            popUpContent : {},
            popup: ""
        }

        this.articalCats = newsArticals;
        this.onPopUp = this.onPopUp.bind(this);
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

    render() {
        let _articalCats = this.articalCats;
        let _this = this;

        return (
            <div className="newsCatHolder container-fluid">
                <div className="row row-clr pg-news-page-content">
                    <div className="col-xs-10 col-xs-offset-1">
                        {
                            _articalCats.map(function(articalCat,index){
                                return(
                                    <NewsCategory catName={articalCat.type} articals={articalCat.news} onNewsThumbClick={_this.onPopUp} key={index} />
                                )
                            })
                        }
                    </div>
                </div>
                {this.getPopup()}
            </div>
        );
    }
}

export class NewsCategory extends React.Component{
    constructor(props){
        super(props);

        this.state={
            hiddenThumbsAreVisible : false
        }

        this.onNewsThumbClick = this.onNewsThumbClick.bind(this);
        this.onToggleView = this.onToggleView.bind(this);
    }

    onNewsThumbClick(data,type){
        this.props.onNewsThumbClick(data,type);
    }

    onToggleView(e){
        e.preventDefault();
        let thumbsAreVisible = this.state.hiddenThumbsAreVisible;

        this.setState({hiddenThumbsAreVisible : !thumbsAreVisible});
    }

    render() {
        let articalList = this.props.articals,
            thumbsAreVisible = this.state.hiddenThumbsAreVisible;

        return (
            <div className="row row-clr pg-news-page-content-item pg-box-shadow item2">
                <div className="col-xs-2 pg-news-page-content-item-left-thumb thumb-2"></div>
                <div className="col-xs-10 pg-news-page-content-item-right-thumbs">
                  <div className="pg-news-page-content-item-right-inner-box">
                    <div className="pg-news-item-main-row">

                        <NewsArticalThumb articals={articalList} type={this.props.catName} onNewsThumbClick={this.onNewsThumbClick} isHiddenBlockVisible={thumbsAreVisible} />

                        <div className="row row-clr">
                            <a href="#" className="pg-see-all-click" id="pg-see-all-click-2" onClick={this.onToggleView}>{(thumbsAreVisible)? "See Less" : "See All"}</a>
                        </div>
                    </div>
                  </div>
                </div>
            </div>
        );
    }
}
