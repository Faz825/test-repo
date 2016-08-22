/**
 * List Posts element is for list all posts from the service.
 */

import React from 'react';
import InfiniteScroll from  'react-infinite-scroll';
import Session  from '../../middleware/Session';
import Socket  from '../../middleware/Socket';
import Lib    from '../../middleware/Lib';
import CommentElement from './CommentElement';
import ProgressBar from '../elements/ProgressBar';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import Scroll from 'react-scroll';
const ListPostsElement  = ({posts,uname,onPostSubmitSuccess,onPostDeleteSuccess,onLikeSuccess})=>{

        if(posts.length <= 0){
            return (<div />)
        }

        let _postElement = posts.map((post,key)=>{

            return (<SinglePost postItem = {post} key={key} postIndex={key} onPostSubmitSuccess ={(post)=>onPostSubmitSuccess(post)}
                                onPostDeleteSuccess = {onPostDeleteSuccess} onLikeSuccess = {onLikeSuccess}/>)
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
            unformattedComments:[],
            liked_users : [],
            isShowingModal:false,
            iniTextisVisible:false,
            text:"",
            shareBtnEnabled:true,
            isShowingVideoModal:false,
            videoUrl:""
        };
        this.loggedUser= Session.getSession('prg_lg');

        this.lifeEvent="";
        this.sharedPost = false;

    }

    componentDidMount(){
        let url = window.location.pathname.split('/');
        let id = url[url.length-1];
        let scroller = Scroll.directScroller;

        if (url.length == 4) {
            scroller.scrollTo(id, {
                duration: 1500,
                delay: 100,
                smooth: true,
                offset: -52
            })
        }

    }

    onLikeClick(index){

        let _this =  this;
        $.ajax({
            url: '/like/composer',
            method: "POST",
            dataType: "JSON",
            data:{__post_id:this.props.postItem.post_id},
            headers: { 'prg-auth-header':this.loggedUser.token },
        }).done(function (data, text) {
            if(data.status.code == 200){
                //this.setState({is_i_liked_now:true});

                let _notificationData = {
                    post_id:data.like.post_id,
                    notification_type:"like",
                    notification_sender:this.loggedUser
                };

                Socket.sendNotification(_notificationData);

                this.props.onLikeSuccess(index);

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
                        comments:data.comments.formattedResult,
                        unformattedComments:data.comments.unformattedResult,
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
    onCommentDeleteSuccess(){
        this.loadComment();
    }
    handleClose() {
        this.setState({isShowingModal: false, isShowingVideoModal:false});
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

        this.setState({shareBtnEnabled:false});
        $.ajax({
            url: '/post/share',
            method: "POST",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.loggedUser.token },
            data:post_data,
            success:function(data){

                if (data.status.code == 200) {

                    let _subscribeData = {
                        post_id:data.post.post_id,
                        isOwnPost:true
                    };

                    Socket.subscribe(_subscribeData);

                    let _notificationData = {
                        post_id:data.post.shared_post_id,
                        notification_type:"share",
                        notification_sender:this.loggedUser
                    };

                    Socket.sendNotification(_notificationData);

                    _this.props.onPostSubmitSuccess(data.post);

                    //if(post_data.__own == _this.loggedUser.id ){
                    //    _this.props.onPostSubmitSuccess(data.post);
                    //
                    //}
                    _this.setState({
                        text:"",
                        isShowingModal:false,
                        iniTextisVisible:false,
                        shareBtnEnabled:true
                    });
                    document.getElementById('input').innerHTML = "";


                }
            }.bind(this)

        });
    }
    handleAjaxSuccess(data){

        if (data.status.code == 200) {
            this.props.onPostSubmitSuccess(data.post);
            this.setState({
                text:"",
                isShowingModal:false,
                iniTextisVisible:false
            });
            document.getElementById('input').innerHTML = "";

        }
    }

    onVideoPlay(upload){
        this.setState({isShowingVideoModal:true, videoUrl:upload.http_url})
    }

    getVideoPopup(){

        return(
            <div>
                {this.state.isShowingVideoModal &&
                <ModalContainer onClose={this.handleClose.bind(this)} zIndex={9999}>

                    <ModalDialog onClose={this.handleClose.bind(this)} width="50%">
                        <div className="share-popup-holder">
                            <video width="100%" height="440" controls>
                                <source src={this.state.videoUrl} type="video/mp4"/>
                            </video>
                        </div>
                    </ModalDialog>
                </ModalContainer>
                }
            </div>
        )

    }

    onPostDelete(post, index){

        $.ajax({
            url: '/post/delete',
            method: "POST",
            dataType: "JSON",
            data:{__post_id:post.post_id},
            headers: { 'prg-auth-header':this.loggedUser.token },
        }).done(function (data, text) {
            if(data.status.code == 200){
                let _unsubscribeData = {
                    post_id:post.post_id,
                    unsubscribedUsers:data.unsubscribeUsers
                };
                Socket.unsubscribeUsers(_unsubscribeData);
                this.props.onPostDeleteSuccess(index);
            }
        }.bind(this));
    }
    getPopup(){

        const _post = this.props.postItem;
        let post_content = "";
        let img_div_class = "pg-newsfeed-post-upload-image";
        if (_post.post_mode == "NP" ){
            post_content = _post.content;
        }else if(_post.post_mode == "LE"){
            post_content = _post.life_event;
            this.lifeEvent = post_content.toLowerCase().replace(/ /g,"-");
        }else if(_post.post_mode == "SP"){
            post_content = _post.content;
        }else if(_post.post_mode == "AP"){
            post_content = _post.content;
        }else if(_post.post_mode == "PP"){//profile update post
            post_content = _post.content;
            img_div_class += " profile-update";
        }

        let _profile = _post.created_by;
        let postImgLength = _post.upload.length;
        let profile_image =  (typeof _profile.images.profile_image != 'undefined')?
            _profile.images.profile_image.http_url:"";


        let _show_share_button = (_profile.user_id != this.loggedUser.id)?true:false;

        var uploaded_files = _post.upload.map((upload,key)=>{
            if(key <= 3){
                let _url = "";
                if(upload.file_type == "mp4"){
                    _url = upload.thumb_http_url;
                } else{
                    _url = upload.http_url
                }
                return (
                    <div className={img_div_class} key={key}>
                        <img src = {_url}/>{
                        (upload.file_type == "mp4")?<i className="fa fa-play-circle-o post-video-play" aria-hidden="true"></i>:null
                    }
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
                                                     btnEnabled = {this.state.shareBtnEnabled}
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
        let img_div_class = "pg-newsfeed-post-upload-image";
        if(_post.post_mode == "PP"){//profile update post
            img_div_class += " profile-update";
        }

        const _postIndex = this.props.postIndex;
        const _is_i_liked = _post.is_i_liked;

        let _profile = _post.created_by;
        let postImgLength = _post.upload.length;
        let profile_image =  (typeof _profile.images.profile_image != 'undefined')?
            _profile.images.profile_image.http_url:"";

        var uploaded_files = _post.upload.map((upload,key)=>{
            if(key <= 3){
                let _url = "";
                if(upload.file_type == "mp4"){
                    _url = upload.thumb_http_url;
                } else{
                    _url = upload.http_url
                }
                return (
                    <div className={img_div_class} key={key}>
                        <img src = {_url}/>{
                        (upload.file_type == "mp4")?<i className="fa fa-play-circle-o post-video-play" aria-hidden="true" onClick = {(event)=>{this.onVideoPlay(upload)}}></i>:null
                    }
                        {(key == 3 && postImgLength > 4)? <div className="pg-post-img-hover pg-profile-img-hover pg-profile-img-hover-1"><p>{"+" + (postImgLength - 4)}</p></div> : null}
                    </div>
                )
            }
        });

        return (
            <div className="pg-timeline-white-box pg-top-round-border pg-add-margin-top" id={_post.post_id}>
                <div className="row row-clr pg-newsfeed-section-common-content-inner pg-rm-padding-bottom">
                    {this.loggedUser.id == _profile.user_id?<i className="fa fa-times pg-status-delete-icon" onClick={(event)=>{this.onPostDelete(_post,_postIndex)}}/>:null}
                    <div className="row row-clr pg-newsfeed-section-common-content-post-info">
                        <div className="pg-user-pro-pic">
                            <PostProfilePic post={_post}
                                            profile={_profile}/>
                        </div>
                        <div className="pg-user-pro-info">
                            <h5 className="pg-newsfeed-profile-name">

                                <PostOwner post={_post}
                                            profile={_profile}/>

                                <SharedPostTitle post={_post}
                                                 loggedUser={this.loggedUser}/>

                                <UpdatedProPic post={_post}
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
                                       post_index = {_postIndex}
                                       onLikeClick = {this.onLikeClick.bind(this)}
                                       onShareClick = {event=>this.onShareClick()}
                                       onCommentClick = {event=>this.onCommentClick()}
                                       OnLikeHover = {event=>this.loadLikedUsers()}
                                       is_i_liked = {_is_i_liked}
                                       liked_users = {_post.liked_user}
                                       show_share_button ={true}/>

                        {
                            (typeof _post.liked_user != 'undefined' &&  _post.liked_user.length > 0)?
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
                                unformattedComments = {this.state.unformattedComments}
                                onCommentAddSuccess = {this.onCommentAddSuccess.bind(this)}
                                onCommentDeleteSuccess = {this.onCommentDeleteSuccess.bind(this)}/>
                            : ""
                        }

                        {this.getPopup()}
                        {this.getVideoPopup()}
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
const PostActionBar =({comment_count,post_index,onLikeClick,onShareClick,onCommentClick,liked_users,is_i_liked,show_share_button})=>{
    let __opt ={};
    if(is_i_liked){
        __opt['style'] = {color:"#61b3de", "pointerEvents": "none",cursor: "default"}
    }

    return (
        <div className="row pg-newsfeed-common-content-post-status">
            <div className="pg-newsfeed-status-left-section">
                <a href="javascript:void(0)"
                   onClick ={(event)=>{onLikeClick(post_index)}}
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




const AddPostElementPopupText =({loggedUser,onContentAdd,onSubmitPost,btnEnabled})=>{
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
            {
                (btnEnabled)?
                    <a href="javascript:void(0)" onClick={(event)=>onSubmitPost(event)} className="pg-status-post-btn btn btn-default">post</a>
                    :<a href="javascript:void(0)"  className="pg-status-post-btn btn btn-default">post</a>
            }

        </div>
    )
};


const SharedPostTitle = ({loggedUser,post}) =>{

    if(post.post_mode == "SP"){
        return (
            (post.created_by.user_id == post.shared_post.created_by.user_id)?
                <span className="own-post-share">shared own post</span>
                :   <span className="post-owner-name">
                        <span className="shared-text">shared</span>
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

const PostOwner = ({post,profile}) => {

    if(post.post_owned_by != undefined){
        return (
            (post.created_by.user_id == post.post_owned_by.user_id)?
                <span className="pro-name">{profile.first_name + " " + profile.last_name + " "} </span>
                :
                <span className="post-owner-name">
                    <span className="pro-name">
                  {post.post_owned_by.first_name + " " + post.post_owned_by.last_name + " "}
                    </span>
                    <i className="fa fa-caret-right"></i>
                    <span className="pro-name">
                        {" " + post.created_by.first_name + " " + post.created_by.last_name}
                    </span>
                </span>
        );
    }else{
        return(
            <span className="pro-name">{profile.first_name + " " + profile.last_name + " "} </span>
        );
    }

};

const PostProfilePic = ({post,profile}) => {
    if(post.post_owned_by != undefined){
        return (
            (post.created_by.user_id == post.post_owned_by.user_id)?
                <img src={post.created_by.images.profile_image.http_url} alt={profile.first_name + " " + profile.last_name} className="img-responsive"/>
                :
                <img src={post.post_owned_by.images.profile_image.http_url} alt={post.post_owned_by.first_name + " " + post.post_owned_by.last_name} className="img-responsive"/>
        );
    }else{
        return(
            <img src={post.created_by.images.profile_image.http_url} alt={profile.first_name + " " + profile.last_name} className="img-responsive"/>
        );
    }

};

export const LocationPostTitle = ({loggedUser,post})=>{
    if(post.post_mode == "LP"){
        return (
            <p className="location_text">at - {post.location} </p>
        )
    }
    return (<span />);
}

export const UpdatedProPic = ({loggedUser,post})=>{
    if(post.post_mode == "PP"){
        return (
            <span className="own-post-share">has updated profile picture.</span>
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
