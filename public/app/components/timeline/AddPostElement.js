/**
 * This component is for Add post
 */

import React from 'react';
import Session  from '../../middleware/Session';
import Socket  from '../../middleware/Socket';
import Lib    from '../../middleware/Lib';
import ListPostsElement from './ListPostsElement';
import ProgressBar from '../elements/ProgressBar';
import {Alert} from '../../config/Alert';
import {Config} from '../../config/Config';
import Geosuggest from 'react-geosuggest';
import Autosuggest from 'react-autosuggest';

let errorStyles = {
    color         : "#ed0909",
    fontSize      : "0.8em",
    textTransform : "capitalize",
    margin        : '0 0 15px',
    display       : "block"
};

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
        let logged_user = Session.getSession('prg_lg');
        if(this.props.uname != logged_user.user_name){
            return (<div />)
        }


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

            focusedOnInitialText    : false,
            text                    :"",
            uploadedFiles           :[],
            fileIds                 :[],
            inProgressUploads       :{},
            post_type               :"NP",
            btnEnabled              :true,
            iniTextisVisible        : true,
            emptyPostWarningIsVisible : false,
            isLocationPanelOpen     :false,
            location                :"",
            imgUploadInstID         : 0,
            lifeEventId             :"",
            percent_completed : 0,
            video_err : ""
        }
        this.loggedUser = Session.getSession('prg_lg');
        this.isValidToSubmit = false;
        this.submitPost = this.submitPost.bind(this);
        this.selectImage = this.selectImage.bind(this);
        this.handleAjaxSuccess = this.handleAjaxSuccess.bind(this);
        this.removeImage = this.removeImage.bind(this);
    }
    submitPost(event){
        console.log("submitPost")
        let _this = this;

        this.setState({emptyPostWarningIsVisible : false,btnEnabled:false});
        var _pay_load = {};
        if(this.state.text != ""){
            this.isValidToSubmit = true;
            _pay_load['__content'] = this.state.text;
            _pay_load['__post_type'] = this.state.post_type;
        }

        if(this.state.location != ""){
            this.isValidToSubmit = true;
            _pay_load['__lct'] = this.state.location;
            _pay_load['__post_type'] = "LP";

        }else if(this.state.fileIds.length>0){
            this.isValidToSubmit = true;
            _pay_load['__file_content']  = JSON.stringify(this.state.fileIds);
            _pay_load['__hs_attachment'] =true;
            _pay_load['__uuid'] =this.props.uuid;
            _pay_load['__post_type'] = "AP";
        }else if(this.state.lifeEventId  != ""){
            this.isValidToSubmit = true;
            _pay_load['__lf_evt'] =this.state.lifeEventId;
            _pay_load['__post_type'] ="LE";
        }

        if(this.isValidToSubmit){

            $.ajax({
                url: '/post/composer',
                method: "POST",
                dataType: "JSON",
                headers: { 'prg-auth-header':this.loggedUser.token },
                data:_pay_load,
                cache: false,

            }).done(this.handleAjaxSuccess);
        }else{
            this.setState({emptyPostWarningIsVisible : true});
        }
    }
    handleAjaxSuccess(data){

        if (data.status.code == 200) {

            console.log(data.post.post_id);

            let _data = {
                post_id:data.post.post_id,
                isOwnPost:true
            };

            console.log("New Post Subscribe")
            Socket.subscribe(_data);

            this.props.afterPostSubmit(data.post)

            this.setState({
                text:"",
                uploadedFiles:[],
                fileIds:[],
                inProgressUploads:{},
                post_type:"NP",
                iniTextisVisible: true,
                isLocationPanelOpen: false,
                isLifeEventPanelOpen:false,
                btnEnabled:true

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
        let _text  = Lib.sanitize(event.target.innerHTML);
        let visibilityStat = (_text)? false : true;
        this.setState({text:_text, iniTextisVisible: visibilityStat, emptyPostWarningIsVisible : false});

    }
    onTabSelect(tabId){


        switch(tabId){
            case "bla4":
                this.setState({
                    isLocationPanelOpen: true,
                    isLifeEventPanelOpen:false
                });
                break;
            case "bla3":
                this.setState({
                    isLocationPanelOpen: false,
                    isLifeEventPanelOpen:true
                });

                break;
            default:
                this.setState({
                    isLocationPanelOpen: false,
                    isLifeEventPanelOpen:false
                });
                break;
        }
    }



    selectImage(e){

        console.log("selectImage "+this.state.imgUploadInstID)
        let _this = this;
        let imgSrc;
        let data = this.state.imgList;
        let imgUploadInst = this.state.imgUploadInstID;

        for(var i = 0; i< e.target.files.length; i++){
            console.log(i);console.log(e.target.files[i])
            let type = e.target.files[i].type;
            if(type.indexOf("image/") != -1){
                _readImage(e.target.files[i],'file_'+i);
            } else if (type.indexOf("video/") != -1){
                this.uploadVideo(e.target.files[i],'file_'+i,this.state.imgUploadInstID);
            }
        }

        function _readImage(file,upload_index){
            console.log("_readImage")
            var reader = new FileReader();
            reader.onload = (function(dataArr,context) {

                return function(e) {
                    imgSrc = e.target.result;

                    var payLoad ={
                        image_name:imgSrc,
                        upload_id:context.props.uuid,
                        upload_index:upload_index,
                        upload_type:"image"
                    }
                    context.uploadHandler(payLoad, imgUploadInst);
                };

            })(data,_this);

            reader.readAsDataURL(file);
        }

        _this.setState({imgUploadInstID : ++imgUploadInst});
    }

    uploadVideo(file,upload_index,imgUploadInst){
        console.log("uploadVideo")

        let _this = this;
        var socket = io.connect(Config.PROGLOBE_APP);
        var reader = new FileReader();
        var file_name = file.name;
        var file_size = file.size;

        if(file_size > 150000000){ //Should be less than 150MB
            this.setState({video_err:Alert.VIDEO_FILE_SIZE_EXCEED});
            return 0;
        }

        this.setState({video_err:""});
        let uploadedFiles = _this.state.uploadedFiles,
            instID = imgUploadInst;

        var _image_file ={
            show_loader:true,
            http_url:null
        }

        _image_file['upload_img'] = {};
        _image_file['upload_img']['id'] = instID;
        _image_file['upload_img'][instID]={
            'imgID':upload_index
        };
        _image_file['upload_img']['type'] = "video";

        uploadedFiles.push(_image_file);
        _this.setState({uploadedFiles:uploadedFiles,btnEnabled:false});

        reader.onload = function(evnt){
            socket.emit('upload', { name : file_name, data : evnt.target.result });
        }

        var payLoad ={
            upload_id:_this.props.uuid,
            upload_index:upload_index,
            upload_type:"video"
        };

        console.log(payLoad);

        socket.emit('start', { name : file_name, size : file_size, data:payLoad });

        socket.on('more_data', function (data){
            _this.updateBar(data['percent'], file_size);
            var place = data['place'] * 524288; //The Next Blocks Starting Position
            var newFile; //The Variable that will hold the new Block of Data
            if(file.slice){
                newFile = file.slice(place, place + Math.min(524288, (file_size-place)));
            }else if(file.webkitSlice){
                newFile = file.webkitSlice(place, place + Math.min(524288, (file_size-place)));
            } else{
                newFile = file.mozSlice(place, place + Math.min(524288, (file_size-place)));
            }
            reader.readAsBinaryString(newFile);
        });

        socket.on('finished', function(data){
            console.log("Finished");
            console.log(data)
            _this.setState({btnEnabled:true});

        });


    }

    updateBar(percent, file_size){
        var percentage = (Math.round(percent*100)/100);
        this.setState({percent_completed : percentage});
    }

    uploadHandler(uploadContent){
        console.log("uploadHandler "+this.state.imgUploadInstID)
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
        _image_file['upload_img']['type'] = uploadContent.upload_type;


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
                console.log(data.upload)
                for(var a=0;a<uploadedFiles.length;a++){
                    if(uploadedFiles[a].upload_img.id == instID){
                        if(uploadedFiles[a].upload_img[instID].imgID == data.upload.upload_index){
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
    onGeoSuggestSelect(suggest){
        let addressList = suggest,
            address = [];

        let ObjLen = addressList.gmaps.address_components.length;
        if(ObjLen > 2){
            for(let i = ObjLen - 2; i < ObjLen; i++ ){
                address.push(addressList.gmaps.address_components[i].long_name);
            }
        }

        this.setState({location: address.join()})

    }
    onLifeEventSelect(selectedLifeEvent){

        this.setState({lifeEventId:selectedLifeEvent})

    }
    removeImage(index){
        console.log("removeImage " +index)

    }
    render(){
        let full_name = this.loggedUser.first_name +" "+ this.loggedUser.last_name;
        let proImg = (this.loggedUser.profile_image != '')? this.loggedUser.profile_image : "/images/default_profile_image.png";
        let opt = {
            style:{display:"block"}};
        let uploaded_files = this.state.uploadedFiles.map((file,key)=>{

            return (
                <div className="pg-newsfeed-post-upload-image" key={key}>
                    {
                        (file.show_loader)?
                        (file.upload_img.type == "video")?<ProgressBar progressType="bar" percentage={this.state.percent_completed}/>:<ProgressBar />
                            :<div className="post-img-holder"><img src = {file.http_url}/>
                        <i className="fa fa-times close-icon post-img-close" onClick={key => this.removeImage(key)}></i></div>
                    }
                </div>
            )
        })
        return (
            <div>
                <PostOptionMenu
                    onTabClick ={tabId => this.onTabSelect(tabId)}
                    selectImage={event => this.selectImage(event)}
                    />
                <div id="pg_content_1" className="row row_clr pg-newsfeed-post-content tab_info clearfix">
                    <div className="pg-user-pro-pic">
                        <img src={proImg} alt={full_name} className="img-responsive" />
                    </div>

                    {
                        (this.state.isLifeEventPanelOpen) ?
                            <LifeEventSelector onLifeEventSelect={this.onLifeEventSelect.bind(this)}/>
                            :

                            <div className="editerHolder">
                                <div id="input" contentEditable={true}
                                     onFocus={this.showPostFooterPanel.bind(this)}
                                     onBlur={this.hidePostFooterPanel.bind(this)}
                                     className="containable-div"
                                     onInput={(event)=>{this.onContentAdd(event)}}></div>
                                {
                                    (this.state.iniTextisVisible) ?
                                        <span
                                            className={(this.state.focusedOnInitialText)? "statusIniText onFocus" : "statusIniText"}>What’s on your mind?</span>
                                        : null
                                }
                            </div>
                    }
                </div>
                <div id="image_display" className="row row_clr pg-newsfeed-post-uploads-images  clearfix">
                    {uploaded_files}
                    <p className="form-validation-alert" style={errorStyles}>{this.state.video_err}</p>
                </div>
                {
                    (this.state.emptyPostWarningIsVisible)?
                    <p className="emptyPost">{Alert.EMPTY_STATUS_UPDATE}</p>
                    : null
                }
                <div className="row" id="pg-newsfeed-post-active-footer" {...opt}>
                    <div className="col-xs-8 locationSuggestHolder">
                        {
                            (this.state.isLocationPanelOpen)?
                                <div>
                                    <p className="locationSuggestTxt">At -</p>
                                    <Geosuggest placeholder="Start typing!"
                                            onSuggestSelect={this.onGeoSuggestSelect.bind(this)}
                                            location={new google.maps.LatLng(53.558572, 9.9278215)}
                                            radius="20" />
                                </div>
                                :null
                        }
                    </div>
                    <div className="col-xs-4">
                        {
                            (this.state.btnEnabled)?
                                <a href="javascript:void(0)" onClick={(event)=>this.submitPost(event)} className="pg-status-post-btn">post</a>
                                : <a href="javascript:void(0)"  className="pg-status-post-btn disabledPost">post</a>
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
                       onClick={(event)=>{onTabClick("bla1")}}>
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
                       onClick={(event)=>{onTabClick("bla3")}}>
                        <img src="/images/pg-newsfeed-life-event-default.png" alt="" className="img-responsive pg-default-status-icon"/>
                        <img src="/images/pg-newsfeed-life-event-active.png" alt="" className="img-responsive pg-hover-status-icon"/>
                        Life Event
                    </a>
                </li>
                <li>
                    <a href="javascript:void(0);"  className="tabmenu" id="pg_tb_4"
                       onClick={(event)=>{onTabClick("bla4")}}>
                        <img src="/images/pg-newsfeed-location-default.png" alt="" className="img-responsive pg-default-status-icon"/>
                        <img src="/images/pg-newsfeed-location-active.png" alt="" className="img-responsive pg-hover-status-icon"/>
                        Current Location
                    </a>
                </li>
            </ul>
        </div>
    );
};


export class LifeEventSelector extends React.Component{

    constructor(props){
        super(props);
        this.state={
            life_events :[]
        }
        this.loadLifeEvents();
    }
    loadLifeEvents(){
        $.ajax({
            url: '/life-events',
            method: "GET",
            dataType: "JSON",
            cache: false,

        }).done(function(data){
            if(data.status.code == 200){

                this.setState({
                    life_events:data.life_events
                });
            }
        }.bind(this));
    }

    selectChange(e){

        this.props.onLifeEventSelect( e.target.value)
    }

    render(){
        const {life_events} = this.state;

        return (
            <div className="life-event-dropdown-wrapper">
                <select name="life_events"
                        className="pgs-life-event-select form-control"
                        value={this.props.defaultOpt}
                        onChange={this.selectChange.bind(this)} >
                    <option value="">Select Life Event</option>
                    {life_events.map(function(lifeEvent, i){
                        return <option value={lifeEvent.name}
                                       key={i}
                            >
                            {lifeEvent.name}</option>;
                    })}
                </select>
            </div>
        );
    }

}
