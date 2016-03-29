/**
 * List Posts element is for list all posts from the service.
 */

import React from 'react';
import InfiniteScroll from  'react-infinite-scroll';
import Session  from '../../middleware/Session';
import Lib    from '../../middleware/Lib';
import CommentElement from './CommentElement';
import ProgressBar from '../elements/ProgressBar';

const ListPostsElement  = ({posts})=>{

        if(posts.length <= 0){
            return (<div />)
        }

        let _postElement = posts.map((post,key)=>{

            return (<SinglePost postItem = {post} key={key} />)
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

        };

    }


    onLikeClick(event){
        let user = Session.getSession('prg_lg');
        let _this =  this;
        $.ajax({
            url: '/like/composer',
            method: "POST",
            dataType: "JSON",
            data:{__post_id:this.props.postItem.post_id},
            headers: { 'prg-auth-header':user.token },
        }).done(function (data, text) {
            if(data.status.code == 200){
               this.setState({is_i_liked:true});
            }
        }.bind(this));

    }
    onShareClick(event){
        console.log("Share -->" ,this.state.postItem.post_id);
    }
    onCommentClick(event){

        if(this.state.showCommentPane){
            this.setState({showCommentPane:false});
        }else{
            this.loadComment();
        }

    }
    loadComment(postId){
        let user = Session.getSession('prg_lg');
        let _this =  this;
        $.ajax({
            url: '/pull/comments',
            method: "GET",
            dataType: "JSON",
            data:{__pg:0,__post_id:this.props.postItem.post_id},
            headers: { 'prg-auth-header':user.token },
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

    render(){

        if(typeof  this.props.postItem == 'undefined'){
            return(<div />);
        }



        const _post = this.props.postItem;

        let post_content = "";

        if (_post.post_mode == "NP" ){

            post_content = _post.content;
        }else if(_post.post_mode == "LE"){
            post_content = _post.life_event;
        }

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
        })


        return (




            <div className="pg-timeline-white-box pg-top-round-border pg-add-margin-top">
                <div className="row row-clr pg-newsfeed-section-common-content-inner pg-rm-padding-bottom">
                    <div className="row row-clr pg-newsfeed-section-common-content-post-info">
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
                        <PostActionBar comment_count={_post.comment_count}
                                       onLikeClick = {event=>this.onLikeClick()}
                                       onShareClick = {event=>this.onShareClick()}
                                       onCommentClick = {event=>this.onCommentClick()}
                                       OnLikeHover = {event=>this.loadLikedUsers()}
                                       is_i_liked = {this.state.is_i_liked}
                                       liked_users = {_post.liked_user}/>

                        {
                            (_post.liked_user.length > 0)?
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
const PostActionBar =({comment_count,onLikeClick,onShareClick,onCommentClick,liked_users,is_i_liked})=>{
    let __opt ={};
    if(is_i_liked){
        __opt['style'] = {color:"#61b3de", "pointer-events": "none",cursor: "default"}
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
                <a href="javascript:void(0)"
                   onClick ={(event)=>{onShareClick(event)}}
                   className="pg-newsfeed-status-left-section-icon"><i className="fa fa-share-alt"></i> Share</a>
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
}
