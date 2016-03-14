/**
 * This component is for Add post
 */

import React from 'react';
import Session  from '../../middleware/Session';
import Lib    from '../../middleware/Lib';
import ListPostsElement from './ListPostsElement';
import ProgressBar from '../elements/ProgressBar';
export default class AddPostElement extends React.Component{

    constructor(props){
        super(props)
        this.state={
            uuid:this.IDGenerator()
        }

    }

    loadTab(tab_id,tab_container_id){
        console.log(tab_id,tab_container_id);

    }

    afterPostSubmit(data){
        console.log(data)
        this.props.onPostSubmitSuccess(data);
        this.setState({uuid:this.IDGenerator()})

    }
    IDGenerator() {

        let length = 10,
            timestamp = +new Date,
            ts = timestamp.toString(),
            parts = ts.split( "" ).reverse(),
            id = "";

        for( var i = 0; i < length; ++i ) {
            let max     = parts.length - 1,
                index   = Math.floor( Math.random() * ( max - 0 + 1 ) ) + 0;
            id += parts[index];
        }

        return id;
    }


    render(){

        return (
            <div className="pg-timeline-white-box pg-round-border pg-box-shadow">
                <div className="row row-clr pg-newsfeed-section" id="pg-newsfeed-post-section">

                    <TextPostElement  afterPostSubmit = {this.afterPostSubmit.bind(this)}
                                      uuid={this.state.uuid}
                        />
                </div>
            </div>
        )
    }

}

export class TextPostElement extends React.Component{
    constructor(props){
        super(props)
        this.state={
            focusedOnInitialText : false,
            text:"",
            uploadedFiles:[],
            fileIds:[],
            inProgressUploads :{},
            post_type:"NP",
            btnEnabled :true,
            iniTextisVisible : true,
            emptyPostWarningIsVisible : false,
            imgUploadInstID : 0
        }
        this.loggedUser = Session.getSession('prg_lg');
        this.submitPost = this.submitPost.bind(this);
        this.selectImage = this.selectImage.bind(this);
        this.handleAjaxSuccess = this.handleAjaxSuccess.bind(this);

    }
    submitPost(event){
        let _this = this;
        let warnState = (this.state.text)? false : true;

        this.setState({emptyPostWarningIsVisible : warnState});

        if(this.state.text != ""){
            var _pay_load ={
                __content:this.state.text,
                __post_type:this.state.post_type
            }
            if(this.state.fileIds.length>0){
                _pay_load['__file_content']  = JSON.stringify(this.state.fileIds);
                _pay_load['__hs_attachment'] =true;
                _pay_load['__uuid'] =this.props.uuid;
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

            this.setState({
                text:"",
                uploadedFiles:[],
                fileIds:[],
                inProgressUploads:{},
                post_type:"NP",
                iniTextisVisible: true
            });

            document.getElementById('input').innerHTML = "";

        }
    }

    showPostFooterPanel(){
        let visibilityStat = (this.state.text)? false : true;
        this.setState({focusedOnInitialText: true, iniTextisVisible: visibilityStat})
    }
    hidePostFooterPanel(){
        let visibilityStat = (this.state.text)? false : true;
        this.setState({focusedOnInitialText: false, iniTextisVisible: visibilityStat})
    }
    onContentAdd(event){
        let _text  = Lib.sanitize(event.target.innerHTML)
        let visibilityStat = (_text)? false : true;
        this.setState({text:_text, iniTextisVisible: visibilityStat, emptyPostWarningIsVisible : false});

    }
    onTabSelect(tabId){
        console.log(tabId);
    }

    selectImage(e){
        let _this = this;
        let imgSrc;
        let data = this.state.imgList;
        let imgUploadInst = this.state.imgUploadInstID;

        for(var i = 0; i< e.target.files.length; i++){
            _readImage(e.target.files[i],'file_'+i);
        }

        function _readImage(file,upload_index){
            var reader = new FileReader();
            reader.onload = (function(dataArr,context) {

                return function(e) {
                    imgSrc = e.target.result;

                    var payLoad ={
                        image_name:imgSrc,
                        upload_id:context.props.uuid,
                        upload_index:upload_index
                    }
                    context.uploadHandler(payLoad, imgUploadInst);
                };

            })(data,_this);

            reader.readAsDataURL(file);
        }

        this.setState({imgUploadInstID : ++imgUploadInst});
    }
    uploadHandler(uploadContent){
        let loggedUser = Session.getSession('prg_lg'),
            uploadedFiles = this.state.uploadedFiles,
            instID = this.state.imgUploadInstID;

        var _image_file ={
            show_loader:true,
            http_url:null
        }

        _image_file['upload_img'] = {};
        _image_file['upload_img']['id'] = instID;
        _image_file['upload_img'][instID]={
            'imgID':uploadContent.upload_index
        };


        uploadedFiles.push(_image_file);
        this.setState({uploadedFiles:uploadedFiles,btnEnabled:false});

        $.ajax({
            url: '/ajax/upload/image',
            method: "POST",
            dataType: "JSON",
            headers: { 'prg-auth-header':loggedUser.token },
            data:uploadContent

        }).done(function (data, text) {
            if (data.status.code == 200) {
                for(var a=0;a<uploadedFiles.length;a++){
                    if(uploadedFiles[a].upload_img.id == instID){
                        if(uploadedFiles[a].upload_img[instID].imgID == data.upload.upload_index){
                            var _image_file ={
                                show_loader:false,
                                http_url:data.upload.http_url
                            }

                            uploadedFiles[a].show_loader = false;
                            uploadedFiles[a].http_url = data.upload.http_url;

                        }
                    }
                }

                let file_ids = this.state.fileIds;
                file_ids.push(data.upload.file_id)
                this.setState({uploadedFiles:uploadedFiles,file_ids:file_ids,post_type:"AP",btnEnabled:true});

            }
        }.bind(this)).error(function (request, status, error) {

            console.log(request.status)
            console.log(status);
            console.log(error);
        });
    }
    render(){
        let full_name = this.loggedUser.first_name +" "+ this.loggedUser.last_name;
        let opt = {
            style:{display:"block"}};
        let uploaded_files = this.state.uploadedFiles.map((file,key)=>{
            return (
                <div className="pg-newsfeed-post-upload-image" key={key}>
                    {
                        (file.show_loader)?
                            <ProgressBar />
                            :<img src = {file.http_url}/>

                    }
                </div>
            )
        })
        return (
            <div>
                <PostOptionMenu
                    onClickTab ={tabId => this.onTabSelect(tabId)}
                    selectImage={event => this.selectImage(event)}
                    />
                <div id="pg_content_1" className="row row_clr pg-newsfeed-post-content tab_info clearfix">
                    <div className="pg-user-pro-pic">
                        <img src={this.loggedUser.profile_image} alt={full_name} className="img-responsive" />
                    </div>
                    <div className="editerHolder">
                        <div id="input" contentEditable={true}
                             onFocus={this.showPostFooterPanel.bind(this)}
                             onBlur={this.hidePostFooterPanel.bind(this)}
                             className="containable-div"
                             onInput={(event)=>{this.onContentAdd(event)}}></div>
                         {
                             (this.state.iniTextisVisible)?
                             <span className={(this.state.focusedOnInitialText)? "statusIniText onFocus" : "statusIniText"}>What’s on your mind?</span>
                             : null
                         }
                    </div>
                </div>
                <div id="image_display" className="row row_clr pg-newsfeed-post-uploads-images  clearfix">
                    {uploaded_files}
                </div>
                {
                    (this.state.emptyPostWarningIsVisible)?
                    <p className="emptyPost">This status update appears to be blank. Please write something or a photo to update your status.</p>
                    : null
                }
                <div className="row" id="pg-newsfeed-post-active-footer" {...opt}>
                    <div className="col-xs-6">

                    </div>
                    <div className="col-xs-6">
                        {
                            (this.state.btnEnabled)?
                                <a href="javascript:void(0)" onClick={(event)=>this.submitPost(event)} className="pg-status-post-btn">post</a>
                                : <a href="javascript:void(0)"  className="pg-status-post-btn">disable post</a>
                        }

                    </div>
                </div>
            </div>
        )
    }
}


const PostOptionMenu = ({onTabClick,selectImage})=>{
    return (
        <div className="row row-clr" id="pg-newsfeed-post-section-header">
            <ul>
                <li className="tabmenu selected-tab">
                    <a href="javascript:void(0);" className="tabmenu" id="pg_tb_1"
                       onClick={()=>{onTabClick("bla1")}}>
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
                    <input type='file' id="imgUpload" onChange={(event)=>{selectImage(event)}} multiple="multiple" />
                </li>
                <li>
                    <a href="javascript:void(0);" className="tabmenu" id="pg_tb_3"
                       onClick={()=>{onTabClick("bla3")}}>
                        <img src="/images/pg-newsfeed-life-event-default.png" alt="" className="img-responsive pg-default-status-icon"/>
                        <img src="/images/pg-newsfeed-life-event-active.png" alt="" className="img-responsive pg-hover-status-icon"/>
                        Life Event
                    </a>
                </li>
                <li>
                    <a href="javascript:void(0);"  className="tabmenu" id="pg_tb_4"
                       onClick={()=>{onTabClick("bla4")}}>
                        <img src="/images/pg-newsfeed-location-default.png" alt="" className="img-responsive pg-default-status-icon"/>
                        <img src="/images/pg-newsfeed-location-active.png" alt="" className="img-responsive pg-hover-status-icon"/>
                        Current Location
                    </a>
                </li>
            </ul>
        </div>
    );
};
