/*
* News COntainer Component
*/
import React from 'react';
import NewsArticalThumb from '../../components/elements/NewsArticalThumb';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';

let newsArticals = [{
    type : "business",
    news: [
            {"id": 1, "name": "Its Opening", "timeDuration": "4" , "imgLink": "images/news-page-sub-item-thumb-2.png",
                "content" :[
                    {
                        "title" : "News Artical Title",
                        "mainImgLink" : "images/pg-news-popup-tech-banner.png",
                        "description" : "<p>After over a year\’s worth of controversy around Facebook\’s real names policy, Facebook has announced a couple of changes to its process in order to better serve all of its members, including those in the LGBTQ community.</p><p>Last October, Facebook promised it would make changes to its real name policy after a number of false account flagging incidents led to the suspension of LGBTQ members\’ pages. Facebook requires people to use the names their friends and family know them by. For many drag performers, for example, their drag names are the names people know them by, but that didn’t prevent the suspension of their accounts.</p>"
                    }
                ]
            },
            {"id": 2, "name": "Google Work", "timeDuration": "2" , "imgLink": "images/news-page-sub-item-thumb-4.png",
                "content" :[
                    {
                        "title" : "News Artical Title",
                        "mainImgLink" : "images/pg-news-popup-tech-banner.png",
                        "description" : "<p>After over a year\’s worth of controversy around Facebook\’s real names policy, Facebook has announced a couple of changes to its process in order to better serve all of its members, including those in the LGBTQ community.</p><p>Last October, Facebook promised it would make changes to its real name policy after a number of false account flagging incidents led to the suspension of LGBTQ members\’ pages. Facebook requires people to use the names their friends and family know them by. For many drag performers, for example, their drag names are the names people know them by, but that didn’t prevent the suspension of their accounts.</p>"
                    }
                ]
            },
            {"id": 3, "name": "Google at Work", "timeDuration": "3" , "imgLink": "images/news-page-sub-item-thumb-3.png",
                "content" :[
                    {
                        "title" : "News Artical Title",
                        "mainImgLink" : "images/pg-news-popup-tech-banner.png",
                        "description" : "<p>After over a year\’s worth of controversy around Facebook\’s real names policy, Facebook has announced a couple of changes to its process in order to better serve all of its members, including those in the LGBTQ community.</p><p>Last October, Facebook promised it would make changes to its real name policy after a number of false account flagging incidents led to the suspension of LGBTQ members\’ pages. Facebook requires people to use the names their friends and family know them by. For many drag performers, for example, their drag names are the names people know them by, but that didn’t prevent the suspension of their accounts.</p>"
                    }
                ]
            },
            {"id": 4, "name": "Microsoft", "timeDuration": "1" , "imgLink": "images/news-page-sub-item-thumb-3.png",
                "content" :[
                    {
                        "title" : "News Artical Title",
                        "mainImgLink" : "images/pg-news-popup-tech-banner.png",
                        "description" : "<p>After over a year\’s worth of controversy around Facebook\’s real names policy, Facebook has announced a couple of changes to its process in order to better serve all of its members, including those in the LGBTQ community.</p><p>Last October, Facebook promised it would make changes to its real name policy after a number of false account flagging incidents led to the suspension of LGBTQ members\’ pages. Facebook requires people to use the names their friends and family know them by. For many drag performers, for example, their drag names are the names people know them by, but that didn’t prevent the suspension of their accounts.</p>"
                    }
                ]
            },
            {"id": 5, "name": "Google at Work", "timeDuration": "2" , "imgLink": "images/news-page-sub-item-thumb-3.png",
                "content" :[
                    {
                        "title" : "News Artical Title",
                        "mainImgLink" : "images/pg-news-popup-tech-banner.png",
                        "description" : "<p>After over a year\’s worth of controversy around Facebook\’s real names policy, Facebook has announced a couple of changes to its process in order to better serve all of its members, including those in the LGBTQ community.</p><p>Last October, Facebook promised it would make changes to its real name policy after a number of false account flagging incidents led to the suspension of LGBTQ members\’ pages. Facebook requires people to use the names their friends and family know them by. For many drag performers, for example, their drag names are the names people know them by, but that didn’t prevent the suspension of their accounts.</p>"
                    }
                ]
            },
            {"id": 1, "name": "Its Opening", "timeDuration": "4" , "imgLink": "images/news-page-sub-item-thumb-2.png",
                "content" :[
                    {
                        "title" : "News Artical Title",
                        "mainImgLink" : "images/pg-news-popup-tech-banner.png",
                        "description" : "<p>After over a year\’s worth of controversy around Facebook\’s real names policy, Facebook has announced a couple of changes to its process in order to better serve all of its members, including those in the LGBTQ community.</p><p>Last October, Facebook promised it would make changes to its real name policy after a number of false account flagging incidents led to the suspension of LGBTQ members\’ pages. Facebook requires people to use the names their friends and family know them by. For many drag performers, for example, their drag names are the names people know them by, but that didn’t prevent the suspension of their accounts.</p>"
                    }
                ]
            },
            {"id": 2, "name": "Google Work", "timeDuration": "2" , "imgLink": "images/news-page-sub-item-thumb-4.png",
                "content" :[
                    {
                        "title" : "News Artical Title",
                        "mainImgLink" : "images/pg-news-popup-tech-banner.png",
                        "description" : "<p>After over a year\’s worth of controversy around Facebook\’s real names policy, Facebook has announced a couple of changes to its process in order to better serve all of its members, including those in the LGBTQ community.</p><p>Last October, Facebook promised it would make changes to its real name policy after a number of false account flagging incidents led to the suspension of LGBTQ members\’ pages. Facebook requires people to use the names their friends and family know them by. For many drag performers, for example, their drag names are the names people know them by, but that didn’t prevent the suspension of their accounts.</p>"
                    }
                ]
            },
            {"id": 3, "name": "Google at Work", "timeDuration": "3" , "imgLink": "images/news-page-sub-item-thumb-3.png",
                "content" :[
                    {
                        "title" : "News Artical Title",
                        "mainImgLink" : "images/pg-news-popup-tech-banner.png",
                        "description" : "<p>After over a year\’s worth of controversy around Facebook\’s real names policy, Facebook has announced a couple of changes to its process in order to better serve all of its members, including those in the LGBTQ community.</p><p>Last October, Facebook promised it would make changes to its real name policy after a number of false account flagging incidents led to the suspension of LGBTQ members\’ pages. Facebook requires people to use the names their friends and family know them by. For many drag performers, for example, their drag names are the names people know them by, but that didn’t prevent the suspension of their accounts.</p>"
                    }
                ]
            },
            {"id": 4, "name": "Microsoft", "timeDuration": "1" , "imgLink": "images/news-page-sub-item-thumb-3.png",
                "content" :[
                    {
                        "title" : "News Artical Title",
                        "mainImgLink" : "images/pg-news-popup-tech-banner.png",
                        "description" : "<p>After over a year\’s worth of controversy around Facebook\’s real names policy, Facebook has announced a couple of changes to its process in order to better serve all of its members, including those in the LGBTQ community.</p><p>Last October, Facebook promised it would make changes to its real name policy after a number of false account flagging incidents led to the suspension of LGBTQ members\’ pages. Facebook requires people to use the names their friends and family know them by. For many drag performers, for example, their drag names are the names people know them by, but that didn’t prevent the suspension of their accounts.</p>"
                    }
                ]
            },
            {"id": 5, "name": "Google at Work", "timeDuration": "2" , "imgLink": "images/news-page-sub-item-thumb-3.png",
                "content" :[
                    {
                        "title" : "News Artical Title",
                        "mainImgLink" : "images/pg-news-popup-tech-banner.png",
                        "description" : "<p>After over a year\’s worth of controversy around Facebook\’s real names policy, Facebook has announced a couple of changes to its process in order to better serve all of its members, including those in the LGBTQ community.</p><p>Last October, Facebook promised it would make changes to its real name policy after a number of false account flagging incidents led to the suspension of LGBTQ members\’ pages. Facebook requires people to use the names their friends and family know them by. For many drag performers, for example, their drag names are the names people know them by, but that didn’t prevent the suspension of their accounts.</p>"
                    }
                ]
            }
        ]
},
{
    type : "sports",
    news: [
            {"id": 1, "name": "Its Opening", "timeDuration": "4" , "imgLink": "images/news-page-sub-item-thumb-2.png",
                "content" :[
                    {
                        "title" : "News Artical Title",
                        "mainImgLink" : "images/pg-news-popup-tech-banner.png",
                        "description" : "<p>After over a year\’s worth of controversy around Facebook\’s real names policy, Facebook has announced a couple of changes to its process in order to better serve all of its members, including those in the LGBTQ community.</p><p>Last October, Facebook promised it would make changes to its real name policy after a number of false account flagging incidents led to the suspension of LGBTQ members\’ pages. Facebook requires people to use the names their friends and family know them by. For many drag performers, for example, their drag names are the names people know them by, but that didn’t prevent the suspension of their accounts.</p>"
                    }
                ]
            },
            {"id": 2, "name": "Google Work", "timeDuration": "2" , "imgLink": "images/news-page-sub-item-thumb-4.png",
                "content" :[
                    {
                        "title" : "News Artical Title",
                        "mainImgLink" : "images/pg-news-popup-tech-banner.png",
                        "description" : "<p>After over a year\’s worth of controversy around Facebook\’s real names policy, Facebook has announced a couple of changes to its process in order to better serve all of its members, including those in the LGBTQ community.</p><p>Last October, Facebook promised it would make changes to its real name policy after a number of false account flagging incidents led to the suspension of LGBTQ members\’ pages. Facebook requires people to use the names their friends and family know them by. For many drag performers, for example, their drag names are the names people know them by, but that didn’t prevent the suspension of their accounts.</p>"
                    }
                ]
            },
            {"id": 3, "name": "Google at Work", "timeDuration": "3" , "imgLink": "images/news-page-sub-item-thumb-3.png",
                "content" :[
                    {
                        "title" : "News Artical Title",
                        "mainImgLink" : "images/pg-news-popup-tech-banner.png",
                        "description" : "<p>After over a year\’s worth of controversy around Facebook\’s real names policy, Facebook has announced a couple of changes to its process in order to better serve all of its members, including those in the LGBTQ community.</p><p>Last October, Facebook promised it would make changes to its real name policy after a number of false account flagging incidents led to the suspension of LGBTQ members\’ pages. Facebook requires people to use the names their friends and family know them by. For many drag performers, for example, their drag names are the names people know them by, but that didn’t prevent the suspension of their accounts.</p>"
                    }
                ]
            },
            {"id": 4, "name": "Microsoft", "timeDuration": "1" , "imgLink": "images/news-page-sub-item-thumb-3.png",
                "content" :[
                    {
                        "title" : "News Artical Title",
                        "mainImgLink" : "images/pg-news-popup-tech-banner.png",
                        "description" : "<p>After over a year\’s worth of controversy around Facebook\’s real names policy, Facebook has announced a couple of changes to its process in order to better serve all of its members, including those in the LGBTQ community.</p><p>Last October, Facebook promised it would make changes to its real name policy after a number of false account flagging incidents led to the suspension of LGBTQ members\’ pages. Facebook requires people to use the names their friends and family know them by. For many drag performers, for example, their drag names are the names people know them by, but that didn’t prevent the suspension of their accounts.</p>"
                    }
                ]
            },
            {"id": 5, "name": "Google at Work", "timeDuration": "2" , "imgLink": "images/news-page-sub-item-thumb-3.png",
                "content" :[
                    {
                        "title" : "News Artical Title",
                        "mainImgLink" : "images/pg-news-popup-tech-banner.png",
                        "description" : "<p>After over a year\’s worth of controversy around Facebook\’s real names policy, Facebook has announced a couple of changes to its process in order to better serve all of its members, including those in the LGBTQ community.</p><p>Last October, Facebook promised it would make changes to its real name policy after a number of false account flagging incidents led to the suspension of LGBTQ members\’ pages. Facebook requires people to use the names their friends and family know them by. For many drag performers, for example, their drag names are the names people know them by, but that didn’t prevent the suspension of their accounts.</p>"
                    }
                ]
            },
            {"id": 1, "name": "Its Opening", "timeDuration": "4" , "imgLink": "images/news-page-sub-item-thumb-2.png",
                "content" :[
                    {
                        "title" : "News Artical Title",
                        "mainImgLink" : "images/pg-news-popup-tech-banner.png",
                        "description" : "<p>After over a year\’s worth of controversy around Facebook\’s real names policy, Facebook has announced a couple of changes to its process in order to better serve all of its members, including those in the LGBTQ community.</p><p>Last October, Facebook promised it would make changes to its real name policy after a number of false account flagging incidents led to the suspension of LGBTQ members\’ pages. Facebook requires people to use the names their friends and family know them by. For many drag performers, for example, their drag names are the names people know them by, but that didn’t prevent the suspension of their accounts.</p>"
                    }
                ]
            },
            {"id": 2, "name": "Google Work", "timeDuration": "2" , "imgLink": "images/news-page-sub-item-thumb-4.png",
                "content" :[
                    {
                        "title" : "News Artical Title",
                        "mainImgLink" : "images/pg-news-popup-tech-banner.png",
                        "description" : "<p>After over a year\’s worth of controversy around Facebook\’s real names policy, Facebook has announced a couple of changes to its process in order to better serve all of its members, including those in the LGBTQ community.</p><p>Last October, Facebook promised it would make changes to its real name policy after a number of false account flagging incidents led to the suspension of LGBTQ members\’ pages. Facebook requires people to use the names their friends and family know them by. For many drag performers, for example, their drag names are the names people know them by, but that didn’t prevent the suspension of their accounts.</p>"
                    }
                ]
            },
            {"id": 3, "name": "Google at Work", "timeDuration": "3" , "imgLink": "images/news-page-sub-item-thumb-3.png",
                "content" :[
                    {
                        "title" : "News Artical Title",
                        "mainImgLink" : "images/pg-news-popup-tech-banner.png",
                        "description" : "<p>After over a year\’s worth of controversy around Facebook\’s real names policy, Facebook has announced a couple of changes to its process in order to better serve all of its members, including those in the LGBTQ community.</p><p>Last October, Facebook promised it would make changes to its real name policy after a number of false account flagging incidents led to the suspension of LGBTQ members\’ pages. Facebook requires people to use the names their friends and family know them by. For many drag performers, for example, their drag names are the names people know them by, but that didn’t prevent the suspension of their accounts.</p>"
                    }
                ]
            },
            {"id": 4, "name": "Microsoft", "timeDuration": "1" , "imgLink": "images/news-page-sub-item-thumb-3.png",
                "content" :[
                    {
                        "title" : "News Artical Title",
                        "mainImgLink" : "images/pg-news-popup-tech-banner.png",
                        "description" : "<p>After over a year\’s worth of controversy around Facebook\’s real names policy, Facebook has announced a couple of changes to its process in order to better serve all of its members, including those in the LGBTQ community.</p><p>Last October, Facebook promised it would make changes to its real name policy after a number of false account flagging incidents led to the suspension of LGBTQ members\’ pages. Facebook requires people to use the names their friends and family know them by. For many drag performers, for example, their drag names are the names people know them by, but that didn’t prevent the suspension of their accounts.</p>"
                    }
                ]
            },
            {"id": 5, "name": "Google at Work", "timeDuration": "2" , "imgLink": "images/news-page-sub-item-thumb-3.png",
                "content" :[
                    {
                        "title" : "News Artical Title",
                        "mainImgLink" : "images/pg-news-popup-tech-banner.png",
                        "description" : "<p>After over a year\’s worth of controversy around Facebook\’s real names policy, Facebook has announced a couple of changes to its process in order to better serve all of its members, including those in the LGBTQ community.</p><p>Last October, Facebook promised it would make changes to its real name policy after a number of false account flagging incidents led to the suspension of LGBTQ members\’ pages. Facebook requires people to use the names their friends and family know them by. For many drag performers, for example, their drag names are the names people know them by, but that didn’t prevent the suspension of their accounts.</p>"
                    }
                ]
            }
        ]
}
]

export default class Index extends React.Component{
    constructor(props){
        super(props);

        this.state={
            isShowingModal : false
        }

        this.onPopUp = this.onPopUp.bind(this);
    }

    handleClose() {
        this.setState({isShowingModal: false});
    }

    onPopUp(data){
        console.log(data);
        this.setState({isShowingModal: true});
    }

    getPopup(){
        return(
            <div>
                {this.state.isShowingModal &&
                    <ModalContainer onClose={this.handleClose.bind(this)} zIndex={9999}>
                        <ModalDialog onClose={this.handleClose.bind(this)} width="50%" style={{marginTop : "-100px"}}>
                            aiyooo sirisena!!
                        </ModalDialog>
                    </ModalContainer>
                }
            </div>
        )
    }

    render() {
        let _articalCats = newsArticals;
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

    onNewsThumbClick(data){
        this.props.onNewsThumbClick(data);
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
