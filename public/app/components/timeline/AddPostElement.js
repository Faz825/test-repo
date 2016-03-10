/**
 * This component is for Add post
 */

import React from 'react';
import Session  from '../../middleware/Session';
import Lib    from '../../middleware/Lib'
import ListPostsElement from './ListPostsElement';
export default class AddPostElement extends React.Component{

    constructor(props){
        super(props)
        this.state={}
    }

    loadTab(tab_id,tab_container_id){
        console.log(tab_id,tab_container_id);

    }

    afterPostSubmit(data){
      this.props.onPostSubmitSuccess(data);
    }

    render(){
        return (
            <div className="pg-timeline-white-box pg-round-border pg-box-shadow">
                <div className="row row-clr pg-newsfeed-section" id="pg-newsfeed-post-section">
                    <PostHeader onClickTab = {this.loadTab} />
                    <TextPostElement  afterPostSubmit = {this.afterPostSubmit.bind(this)}/>
                </div>
            </div>
        )
    }

}

export class TextPostElement extends React.Component{
    constructor(props){
        super(props)
        this.state={
            showFooterPanel:false,
            text:""
        }
        this.loggedUser = Session.getSession('prg_lg');
        this.submitPost = this.submitPost.bind(this);
        this.handleAjaxSuccess = this.handleAjaxSuccess.bind(this);
    }
    submitPost(event){
        let _this = this;
        if(this.state.text != ""){
            var _pay_load ={
                __content:this.state.text
            }
            $.ajax({
                url: '/post/composer',
                method: "POST",
                dataType: "JSON",
                headers: { 'prg-auth-header':this.loggedUser.token },
                data:_pay_load,
                cache: false,

            }).done(this.handleAjaxSuccess);
        }
    }
    handleAjaxSuccess(data){

        if (data.status.code == 200) {


            this.props.afterPostSubmit(data.post)
            this.setState({text:""});
            document.getElementById('input').innerHTML = "";

        }
    }


    showPostFooterPanel(){
        this.setState({showFooterPanel:true})
    }
    hidePostFooterPanel(){
        this.setState({showFooterPanel:false})
    }
    onContentAdd(event){
        let _text  = Lib.sanitize(event.target.innerHTML)
        this.setState({text:_text});

    }

    render(){
        let full_name = this.loggedUser.first_name +" "+ this.loggedUser.last_name;
        let opt = {
            style:{display:"block"}};

        return (
            <div>
                <div id="pg_content_1" className="row row_clr pg-newsfeed-post-content tab_info clearfix">
                    <div className="pg-user-pro-pic">
                        <img src={this.loggedUser.profile_image} alt={full_name} className="img-responsive" />
                    </div>
                    <div id="input" contentEditable={true}
                         value="What’s on your mind?"
                         onFocus={this.showPostFooterPanel.bind(this)}
                         onBlur={this.hidePostFooterPanel.bind(this)}
                         className="containable-div"
                         onInput={(event)=>{this.onContentAdd(event)}} ></div>

                </div>
                <div className="row" id="pg-newsfeed-post-active-footer" {...opt}>
                    <div className="col-xs-6">
                        <a href="#"><i className="fa fa-camera"></i></a>
                    </div>
                    <div className="col-xs-6">
                        <a href="javascript:void(0)" onClick={(event)=>this.submitPost(event)} className="pg-status-post-btn">post</a>
                    </div>
                </div>
            </div>
        )
    }
}


/**
 * Post Header
 * @param onClickTab
 * @returns {XML}
 * @constructor
 */
export class PostHeader extends React.Component{
    constructor(props){
        super(props)
        this.state={
            imgList : []
        }

        this.onClickTab = this.onClickTab.bind(this);
        this.previewImages = this.previewImages.bind(this);
    }

    onClickTab(ele){
        console.log(ele);
    }

    previewImages(e){
	    let imgSrc;
        let data = this.state.imgList;

        for(var i = 0; i< e.target.files.length; i++){
            _readImage(e.target.files[i]);
        }

        function _readImage(file){
            var reader = new FileReader();
    	    reader.onload = (function(dataArr,context) {

    	    	return function(e) {
        	    	imgSrc = e.target.result;
                    dataArr.push(imgSrc);
        	    };

    	    })(data,this);

            reader.readAsDataURL(file);
        }

    }

    render() {
        return (
            <div className="row row-clr" id="pg-newsfeed-post-section-header">
                <ul>
                    <li className="tabmenu selected-tab">
                        <a href="javascript:void(0);" className="tabmenu" id="pg_tb_1"
                           onClick={(event)=>{this.onClickTab("bla1")}}>
                            <img src="/images/pg-newsfeed-share-default.png" alt="" className="img-responsive pg-default-status-icon"/>
                            <img src="/images/pg-newsfeed-share-active.png" alt="" className="img-responsive pg-hover-status-icon"/>
                            Share Update
                        </a>
                    </li>
                    <li>
                        <label htmlFor="imgUpload" className="tabmenu" id="pg_tb_2">
                            <img src="/images/pg-newsfeed-image-default.png" alt="" className="img-responsive pg-default-status-icon"/>
                            <img src="/images/pg-newsfeed-image-active.png" alt="" className="img-responsive pg-hover-status-icon"/>
                            Photo/Video
                        </label>
                        <input type='file' id="imgUpload" onChange={this.previewImages} multiple="multiple" />
                    </li>
                    <li>
                        <a href="javascript:void(0);" className="tabmenu" id="pg_tb_3"
                           onClick={(event)=>{this.onClickTab("bla3")}}>
                            <img src="/images/pg-newsfeed-life-event-default.png" alt="" className="img-responsive pg-default-status-icon"/>
                            <img src="/images/pg-newsfeed-life-event-active.png" alt="" className="img-responsive pg-hover-status-icon"/>
                            Life Event
                        </a>
                    </li>
                    <li>
                        <a href="javascript:void(0);"  className="tabmenu" id="pg_tb_4"
                           onClick={(event)=>{this.onClickTab("bla4")}}>
                            <img src="/images/pg-newsfeed-location-default.png" alt="" className="img-responsive pg-default-status-icon"/>
                            <img src="/images/pg-newsfeed-location-active.png" alt="" className="img-responsive pg-hover-status-icon"/>
                            Current Location
                        </a>
                    </li>
                </ul>
            </div>
        );
    }
}
