/**
 * This is Comment element that Handle Comment related front-end operations
 */
import React from 'react';
import Session from '../../middleware/Session';
import Lib    from '../../middleware/Lib'
export default class CommentElement extends React.Component{
    constructor(props){
        super(props);
        this.state={
            postId:this.props.postId,
            loggedUser : Session.getSession('prg_lg')
        };
        console.log(this.props.postId)
    }
    onCommentAdd(comment_text){
        console.log(this.state.postId)
        if(comment_text != ""){
            let commentData ={
                __post_id:this.props.postId,
                __content:comment_text
            }
            $.ajax({
                url: '/comment/composer',
                method: "POST",
                dataType: "JSON",
                headers: { 'prg-auth-header':this.state.loggedUser.token },
                data:commentData,
                success: function (data, text) {
                    if (data.status.code == 200) {
                        this.setState({text:""});
                        document.getElementById('comment_input').innerHTML = "";
                        this.props.onCommentAddSuccess(this.state.postId);
                    }
                }.bind(this),
                error: function (request, status, error) {
                    console.log(status);
                    console.log(error);
                }
            });
        }
    }

    render(){

        let opt={
            style:{display:"none"}
        }
        if(this.props.visibility){
            opt['style'] ={display:"block"}
        }

        if(typeof this.props.comments == 'undefined'){
            return (<div> Loading..... </div>);
        }
        const comments = this.props.comments.map((comment,key)=>{
            return (<CommentItem comment={comment} key={key}/>)
        });

        return (
            <div {...opt}>
                <div className="row pg-newsfeed-common-content-post-comments">
                    {comments}

                </div>
                <PostCommentAction
                    onCommentAdd = {this.onCommentAdd.bind(this)}
                    loggedUser = {this.state.loggedUser}/>
            </div>

        );
    }
}


/**
 * Singel comment item
 * @param comment
 * @returns {XML}
 * @constructor
 */
const CommentItem =({comment}) =>{

    let _profile = comment.commented_by
    let _profile_image = (typeof _profile.images.profile_image != 'undefined')?_profile.images.profile_image.http_url:"";
    let commented_by = _profile.first_name +" "+ _profile.last_name;
    return(
        <div className="row-clr pg-comment-row">
            <div className="col-xs-12 pg-comment-row-inner">
                <div className="pg-comment-user-pro-pic">
                    <img src={_profile_image} alt={commented_by} className="img-responsive"/>
                    </div>
                    <div className="pg-comment-info">
                        <div className="row">
                            <div className="col-xs-8">
                                <h5 className="pg-comment-profile-name">{commented_by}</h5>
                            </div>
                            <div className="col-xs-4">
                                <h6 className="pg-comment-post-date">{comment.date.time_a_go}</h6>
                            </div>
                        </div>
                        <p className="pg-comment">{comment.comment}</p>
                    </div>
                </div>
            </div>
    );
}




export class  PostCommentAction extends React.Component{
    constructor(props){
        super(props)
        this.state={
            text:""

        };
        this.loggedUser =  this.props.loggedUser;
    }
    onContentAdd(event){
        let _text  = Lib.sanitize(event.target.innerHTML)
        this.setState({text:_text});

    }
    onCommentEnter(event){

        this.props.onCommentAdd(this.state.text);
    }
    render(){

        let profile_image = (typeof this.loggedUser.profile_image != 'undefined')?this.loggedUser.profile_image:"";
        return(
            <div className="row pg-newsfeed-common-content-post-new-comment pg-bottom-round-border">
                <div className="col-xs-10">
                    <div className="row clearfix">
                        <div className="col-xs-2">
                            <img src={profile_image} alt={this.loggedUser.first_name +" "+ this.loggedUser.last_name} className="img-responsive"/>
                        </div>
                        <div className="col-xs-10 pg-newsfeed-common-content-post-new-comment-input-area">
                            <div id="comment_input" contentEditable={true}
                                 className="comment-containable-div"
                                 onInput={this.onContentAdd.bind(this)}></div>
                        </div>
                    </div>
                </div>
                <div className="col-xs-2 pg-newsfeed-new-comment-icon-wrapper">
                    <div className="addBtnHolder">
                        <a href="javascript:void(0)"
                           onClick={this.onCommentEnter.bind(this)}
                           className="pg-status-post-btn">Add</a>
                    </div>
                </div>
            </div>
        )
    }

}
