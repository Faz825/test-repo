/**
 * List Posts element is for list all posts from the service.
 */

import React from 'react';
import InfiniteScroll from  'react-infinite-scroll';
import Session  from '../../middleware/Session';
import Lib    from '../../middleware/Lib';
import CommentElement from './CommentElement';
import ProgressBar from '../elements/ProgressBar';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
const ListPostsElement  = ({posts,onPostSubmitSuccess})=>{

        if(posts.length <= 0){
            return (<div />)
        }

        let _postElement = posts.map((post,key)=>{

            return (<SinglePost postItem = {post} key={key} onPostSubmitSuccess ={(post)=>onPostSubmitSuccess(post)} />)
        });

        return (
                <div>
                    {
                        _postElement
                    }

                </div>

        );

}
export default ListPostsElement;



class SinglePost extends React.Component{
    constructor(props){
        super(props);
        this.state={
            postItem :this.props.postItem,
            profile:this.props.postItem.created_by,
            showCommentPane:false,
            comments:[],
            is_i_liked:this.props.postItem.is_i_liked,
            liked_users : [],
            isShowingModal:false,
            iniTextisVisible:false,
            text:"",

        };
        this.loggedUser= Session.getSession('prg_lg');

        this.lifeEvent="";
        this.sharedPost = false;
    }


    onLikeClick(event){

        let _this =  this;
        $.ajax({
            url: '/like/composer',
            method: "POST",
            dataType: "JSON",
            data:{__post_id:this.props.postItem.post_id},
            headers: { 'prg-auth-header':this.loggedUser.token },
        }).done(function (data, text) {
            if(data.status.code == 200){
               this.setState({is_i_liked:true});
            }
        }.bind(this));

    }
    onShareClick(event){

        this.setState({isShowingModal : true});


    }
    onCommentClick(event){
        if(this.state.showCommentPane){
            this.setState({showCommentPane:false});
        }else{
            this.loadComment();
        }
    }
    loadComment(postId){
        let _this =  this;
        $.ajax({
            url: '/pull/comments',
            method: "GET",
            dataType: "JSON",
            data:{__pg:0,__post_id:this.props.postItem.post_id},
            headers: { 'prg-auth-header':this.loggedUser.token},
            success: function (data, text) {
                if(data.status.code == 200){
                    this.setState({
                        comments:data.comments,
                        showCommentPane:true,
                        comment_count:data.comments.length
                    })
                }
            }.bind(this),
            error: function (request, status, error) {
                console.log(status);
                console.log(error);
            }.bind(this)
        });
    }
    onCommentAddSuccess(){
        this.loadComment();
    }
    handleClose() {
        this.setState({isShowingModal: false});
    }
    onContentAdd(event){
        let _text  = Lib.sanitize(event.target.innerHTML);
        let visibilityStat = (_text)? false : true;
        this.setState({text:_text, iniTextisVisible: visibilityStat});

    }
    onSharedPost(event){

        let post_data ={
            __content :this.state.text,
            __pid:this.props.postItem.post_id,
            __own:this.props.postItem.created_by.user_id
        }

        let _this = this;

        $.ajax({
            url: '/post/share',
            method: "POST",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.loggedUser.token },
            data:post_data,
            success:function(data){

                if (data.status.code == 200) {
                    _this.props.onPostSubmitSuccess(data.post);
                    _this.setState({
                        text:"",
                        isShowingModal:false,
                        iniTextisVisible:false,
                    });
                    document.getElementById('input').innerHTML = "";
                    

                }
            }

        });
    }
    handleAjaxSuccess(data){

        if (data.status.code == 200) {
            this.props.onPostSubmitSuccess(data.post);
            this.setState({
                text:"",
                isShowingModal:false,
                iniTextisVisible:false,
            });
            document.getElementById('input').innerHTML = "";

        }
    }
    getPopup(){

        const _post = this.props.postItem;
        let post_content = "";
        if (_post.post_mode == "NP" ){
            post_content = _post.content;
        }else if(_post.post_mode == "LE"){
            post_content = _post.life_event;
            this.lifeEvent = post_content.toLowerCase().replace(/ /g,"-");
        }else if(_post.post_mode == "SP"){
            post_content = _post.content;
        }else if(_post.post_mode == "AP"){
            post_content = _post.content;
        }

        let _profile = _post.created_by;
        let postImgLength = _post.upload.length;
        let profile_image =  (typeof _profile.images.profile_image != 'undefined')?
            _profile.images.profile_image.http_url:"";


        let _show_share_button = (_profile.user_id != this.loggedUser.id)?true:false;

        var uploaded_files = _post.upload.map((upload,key)=>{
            if(key <= 3){
                return (
                    <div className="pg-newsfeed-post-upload-image" key={key}>
                        <img src = {upload.http_url}/>
                        {(key == 3 && postImgLength > 4)? <div className="pg-post-img-hover pg-profile-img-hover pg-profile-img-hover-1"><p>{"+" + (postImgLength - 4)}</p></div> : null}
                    </div>
                )
            }
        });

        return(
            <div>
                {this.state.isShowingModal &&
                <ModalContainer onClose={this.handleClose.bind(this)} zIndex={9999}>

                    <ModalDialog onClose={this.handleClose.bind(this)} width="50%">
                        <div className="share-popup-holder">
                            <AddPostElementPopupText onContentAdd = {event=>this.onContentAdd(event)}
                                                     iniTextisVisible = {this.state.iniTextisVisible}
                                                    loggedUser = {this.loggedUser}
                                                     onSubmitPost = {event=>this.onSharedPost(event)}/>

                            <div className="row row-clr pg-newsfeed-section-common-content-post-info share-popup-post-view">
                                <div className="pg-user-pro-pic">
                                    <img src={profile_image} alt={_profile.first_name + " " + _profile.last_name} className="img-responsive"/>
                                </div>
                                <div className="pg-user-pro-info">
                                    <h5 className="pg-newsfeed-profile-name">{_profile.first_name + " " + _profile.last_name}</h5>
                                    <p className="pg-newsfeed-post-time">{_post.date.time_a_go}</p>
                                    {
                                        (typeof _post.location != 'undefined' && _post.location != null)?
                                            <p className="location_text">at - {_post.location} </p>:
                                            null
                                    }
                                </div>
                                <div className="row row-clr pg-newsfeed-common-content-post-content">
                                    <p className="pg-newsfeed-post-description">{post_content}</p>
                                </div>

                                <div id="image_display" className="row row_clr pg-newsfeed-post-uploads-images  clearfix">
                                    {uploaded_files}
                                </div>
                            </div>
                        </div>
                    </ModalDialog>
                </ModalContainer>
                }
            </div>
        )
    }

    render(){

        if(typeof  this.props.postItem == 'undefined'){
            return(<div />);
        }

        const _post = this.props.postItem;

        let _profile = _post.created_by;
        let postImgLength = _post.upload.length;
        let profile_image =  (typeof _profile.images.profile_image != 'undefined')?
            _profile.images.profile_image.http_url:"";


        var uploaded_files = _post.upload.map((upload,key)=>{
            if(key <= 3){
                return (
                    <div className="pg-newsfeed-post-upload-image" key={key}>
                        <img src = {upload.http_url}/>
                        {(key == 3 && postImgLength > 4)? <div className="pg-post-img-hover pg-profile-img-hover pg-profile-img-hover-1"><p>{"+" + (postImgLength - 4)}</p></div> : null}
                    </div>
                )
            }
        });

        return (

            <div className="pg-timeline-white-box pg-top-round-border pg-add-margin-top">
                <div className="row row-clr pg-newsfeed-section-common-content-inner pg-rm-padding-bottom">
                    <div className="row row-clr pg-newsfeed-section-common-content-post-info">
                        <div className="pg-user-pro-pic">
                            <img src={profile_image} alt={_profile.first_name + " " + _profile.last_name} className="img-responsive"/>
                        </div>
                        <div className="pg-user-pro-info">
                            <h5 className="pg-newsfeed-profile-name"><span className="pro-name">{_profile.first_name + " " + _profile.last_name + " "}</span>

                                <SharedPostTitle post={_post}
                                                 loggedUser={this.loggedUser}/>

                            </h5>
                            <p className="pg-newsfeed-post-time">{_post.date.time_a_go}</p>

                                <LocationPostTitle post={_post}
                                                   loggedUser={this.loggedUser}/>

                        </div>

                        <div className="row row-clr pg-newsfeed-common-content-post-content">
                            <PostContentBody post={_post}
                                             loggedUser={this.loggedUser}/>

                        </div>

                        <div id="image_display" className="row row_clr pg-newsfeed-post-uploads-images  clearfix">
                            {uploaded_files}
                        </div>

                        <SharedPostBody  post={_post}
                                     loggedUser={this.loggedUser}/>


                        <PostActionBar comment_count={_post.comment_count}
                                       onLikeClick = {event=>this.onLikeClick()}
                                       onShareClick = {event=>this.onShareClick()}
                                       onCommentClick = {event=>this.onCommentClick()}
                                       OnLikeHover = {event=>this.loadLikedUsers()}
                                       is_i_liked = {this.state.is_i_liked}
                                       liked_users = {_post.liked_user}
                                       show_share_button ={true}/>

                        {
                            (typeof _post.liked_use != 'undefined' &&  _post.liked_user.length > 0)?
                                <LikeSummery
                                    visibility={true}
                                    likes ={_post.liked_user}/>
                                :null
                        }

                        {
                            (this.state.showCommentPane) ? <CommentElement
                                visibility = {this.state.showCommentPane}
                                postId = {_post.post_id}
                                comments = {this.state.comments}
                                onCommentAddSuccess = {this.onCommentAddSuccess.bind(this)}/>
                            : ""
                        }

                        {this.getPopup()}
                    </div>
                </div>
            </div>
        );
    }
}



/**
 * Post Action bar
 * @param onLike
 * @param onShare
 * @param onComment
 * @constructor
 */
const PostActionBar =({comment_count,onLikeClick,onShareClick,onCommentClick,liked_users,is_i_liked,show_share_button})=>{
    let __opt ={};
    if(is_i_liked){
        __opt['style'] = {color:"#61b3de", "pointerEvents": "none",cursor: "default"}
    }

    return (
        <div className="row pg-newsfeed-common-content-post-status">
            <div className="pg-newsfeed-status-left-section">
                <a href="javascript:void(0)"
                   onClick ={(event)=>{onLikeClick(event)}}
                   className="pg-newsfeed-status-left-section-icon" {...__opt}><i className="fa fa-heart"></i> Like</a>
                <a href="javascript:void(0)"
                   onClick ={(event)=>{onCommentClick(event)}}
                   className="pg-newsfeed-status-left-section-icon"><i className="fa fa-comment"></i> Comment</a>
                {
                    (show_share_button)?
                        <a href="javascript:void(0)"
                           onClick ={(event)=>{onShareClick(event)}}
                           className="pg-newsfeed-status-left-section-icon"><i className="fa fa-share-alt"></i> Share</a>
                        :null
                }
            </div>
            <div className="pg-newsfeed-status-right-section">
                <a href="#" className="pg-newsfeed-status-right-section-view-comment">{comment_count}</a>
            </div>
        </div>
    );
};

/**
 * Display Like Sumery
 * @param likes
 * @returns {XML}
 * @constructor
 */
const LikeSummery=({likes,visibility}) =>{
    let opt={
        style:{display:"none"}
    }
    if(visibility){
        opt['style'] ={display:"block"}
    }



    return (
        <div className="row pg-newsfeed-common-content-like-status" {...opt}>
            <div className="col-xs-12">
                <p className="pg-newsfeed-common-content-like-status-paragraph">
                    <a href={"/profile/"+likes[0]} className="pg-newsfeed-common-content-like-status-profile-links">{likes[0].name}</a>
                    {
                        (likes.length == 2)?
                            <a href={"/profile/"+likes[1]} className="pg-newsfeed-common-content-like-status-profile-links"> and  {likes[1].name}</a>
                            :(likes.length > 2)?
                                <a href="#" className="pg-newsfeed-common-content-like-status-profile-links"> and {likes.length}</a>
                            :null

                    } like this...
                </p>
            </div>
        </div>
    )
};




const AddPostElementPopupText =({loggedUser,onContentAdd,onSubmitPost})=>{
    let full_name = loggedUser.first_name + " " +loggedUser.last_name;
    return (
        <div id="pg_content_1" className="row row_clr pg-newsfeed-post-content tab_info clearfix">
            <div className="pg-user-pro-pic">
                <img src={loggedUser.profile_image} alt={full_name} className="img-responsive" />
            </div>


            <div className="editerHolder">
                <div id="input" contentEditable={true}
                     className="containable-div"
                     onInput={(event)=>{onContentAdd(event)}}></div>
            </div>
            <a href="javascript:void(0)" onClick={(event)=>onSubmitPost(event)} className="pg-status-post-btn btn btn-default">post</a>
        </div>
    )
};


const SharedPostTitle = ({loggedUser,post}) =>{

    if(post.post_mode == "SP"){
        return (
            (loggedUser.id == post.shared_post.created_by.user_id)?
                <span className="own-post-share">shared own post</span>
                :   <span className="post-owner-name">
                        <i className="fa fa-caret-right"></i>
                        <span className="pro-name">
                            {" "+post.shared_post.created_by.first_name + " " + post.shared_post.created_by.last_name}
                        </span>'s post
                    </span>
        )
    }
    return (<span />);


};


const PostContentBody = ({loggedUser,post})=>{
    if(post.post_mode == "LE"){
        let lifeEvent = post.life_event.toLowerCase().replace(/ /g,"-");
        return (
            <div className="life-event-holder">
                <img src={"/images/life-events/" + lifeEvent + ".png"} alt={post.life_event} className="event-img"/>
                <p className="life-event-title">{post.life_event}</p>
            </div>
        )
    }
    return <p className="pg-newsfeed-post-description">{post.content}</p>;

};


export const LocationPostTitle = ({loggedUser,post})=>{
    if(post.post_mode == "LP"){
        return (
            <p className="location_text">at - {post.location} </p>
        )
    }
    return (<span />);
}


const SharedPostBody = ({loggedUser,post}) => {

    if(post.post_mode != "SP"){
        return (<span />);
    }



    let sharedPost = post.shared_post;
    let _profile = sharedPost.created_by;
    let postImgLength = sharedPost.upload.length;
    let profile_image =  (typeof _profile.images.profile_image != 'undefined')?
        _profile.images.profile_image.http_url:"";

    let uploaded_files = sharedPost.upload.map((upload,key)=>{
        if(key <= 3){
            return (
                <div className="pg-newsfeed-post-upload-image" key={key}>
                    <img src = {upload.http_url}/>
                    {
                        (key == 3 && postImgLength > 4)?
                            <div className="pg-post-img-hover pg-profile-img-hover pg-profile-img-hover-1">
                                <p>{"+" + (postImgLength - 4)}</p>
                            </div> :
                        null
                    }
                </div>
            )
        }
    });

    return (
        <div className="shared-post-holder">
            <div className="pg-user-pro-pic">
                <img src={profile_image} alt={_profile.first_name + " " + _profile.last_name} className="img-responsive"/>
            </div>
            <div className="pg-user-pro-info">
                <h5 className="pg-newsfeed-profile-name">
                    <span className="pro-name">
                        {_profile.first_name + " " + _profile.last_name}
                    </span>
                </h5>

                <LocationPostTitle post={sharedPost}
                                   loggedUser={loggedUser}/>
            </div>

            <div className="row row-clr pg-newsfeed-common-content-post-content">
                <PostContentBody post={sharedPost}
                                 loggedUser={loggedUser}/>

            </div>
            <div id="image_display" className="row row_clr pg-newsfeed-post-uploads-images  clearfix">
                {uploaded_files}
            </div>
        </div>
    )

};