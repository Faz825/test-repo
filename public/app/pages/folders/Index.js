/**
 * This is folders index class that handle all
 */

import React from 'react';
import Session from '../../middleware/Session';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import { Scrollbars } from 'react-custom-scrollbars';
import { Popover, OverlayTrigger } from 'react-bootstrap';
import Autosuggest from 'react-autosuggest';
import Lib from '../../middleware/Lib';
import Socket  from '../../middleware/Socket';
import Dropzone from 'react-dropzone';

export default class Index extends React.Component{
    constructor(props){
        super(props);

        this.state={
            loggedUser : Session.getSession('prg_lg'),
            isShowingModal : false,
            CFName : "",
            CFColor : "",
            clrChosen : "",
            isFolderNameEmpty : false,
            isFolderClrEmpty: false,
            isAlreadySelected:false,
            value: '',
            suggestions: [],
            suggestionsList : {},
            sharedWithIds : [],
            sharedWithNames : [],
            sharedWithUsernames : [],
            folders : []
        };

        this.users = [];
        this.sharedWithIds = [];
        this.sharedWithNames = [];
        this.sharedWithUsernames = [];

        this.handleClick = this.handleClick.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.colorPicker = this.colorPicker.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onSuggestionsUpdateRequested = this.onSuggestionsUpdateRequested.bind(this);
        this.getSuggestionValue = this.getSuggestionValue.bind(this);
        this.renderSuggestion = this.renderSuggestion.bind(this);
        this.removeUser = this.removeUser.bind(this);
        this.loadFolders();
    }

    loadFolders(){

        console.log("loadFolders")

        $.ajax({
            url: '/folders/get-all',
            method: "GET",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.state.loggedUser.token }
        }).done( function (data, text) {
            console.log(data);
            if(data.status.code == 200){
                if(data.folders.length == 0 || data.folders[0] == null){
                    this.setState({CFName:"My Folder", CFColor:"#1b9ed9"});
                    this.addDefaultFolder();
                } else{
                    let folders = data.folders;
                    console.log(folders);
                    this.setState({folders: folders});
                }
            }
        }.bind(this));
    }

    addDefaultFolder(){

        console.log("addDefaultFolder")

        $.ajax({
            url: '/folders/add-new',
            method: "POST",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.state.loggedUser.token },
            data:{folder_name:this.state.CFName, folder_color:this.state.CFColor, shared_with:this.state.sharedWithIds, isDefault:1},
            success: function (data, text) {
                if (data.status.code == 200) {
                    this.loadFolders();
                    this.setState({CFName : "", CFColor : ""});
                }
            }.bind(this),
            error: function (request, status, error) {
                console.log(status);
                console.log(error);
            }
        });

    }

    removeUser(key){
        this.sharedWithIds.splice(key,1);
        this.sharedWithNames.splice(key,1);
        this.sharedWithUsernames.splice(key,1);
        this.setState({sharedWithIds:this.sharedWithIds, sharedWithNames:this.sharedWithNames, sharedWithUsernames:this.sharedWithUsernames});
    }

    getSuggestions(value, data) {
        const escapedValue = Lib.escapeRegexCharacters(value.trim());
        if (escapedValue === '') {
            return [];
        }
        const regex = new RegExp('^' + escapedValue, 'i');
        return data.filter(data => regex.test(data.first_name+" "+data.last_name));
    }

    getSuggestionValue(suggestion) {
        if(this.sharedWithIds.indexOf(suggestion.user_id)==-1){
            this.sharedWithIds.push(suggestion.user_id);
            this.sharedWithNames.push(suggestion.first_name+" "+suggestion.last_name);
            this.sharedWithUsernames.push(suggestion.user_name);
            this.setState({sharedWithIds:this.sharedWithIds, sharedWithNames:this.sharedWithNames, sharedWithUsernames:this.sharedWithUsernames, isAlreadySelected:false})
        } else{
            this.setState({isAlreadySelected:true});
            console.log("already selected" + this.state.isAlreadySelected)
        }

        return "";
    }

    renderSuggestion(suggestion) {
        return (            
            <div id={suggestion.user_id} className="suggestion-item">
                <img className="suggestion-img" src={suggestion.images.profile_image.http_url} alt={suggestion.first_name} />
                <span>{suggestion.first_name+" "+suggestion.last_name}</span>
            </div>
        );
    }

    onChange(event, { newValue }) {
        this.setState({ value: newValue, isAlreadySelected:false });

        if(newValue.length == 1){
            $.ajax({
                url: '/connection/search/'+newValue,
                method: "GET",
                dataType: "JSON",
                success: function (data, text) {
                    if(data.status.code == 200){
                        this.users = data.suggested_users;
                        this.setState({
                            suggestions: this.getSuggestions(newValue, this.users),
                            suggestionsList : this.getSuggestions(newValue, this.users)
                        });
                    }
                }.bind(this),
                error: function (request, status, error) {
                    console.log(request.responseText);
                    console.log(status);
                    console.log(error);
                }.bind(this)
            });
        } else if(newValue.length > 1 && this.users.length < 10){
            $.ajax({
                url: '/connection/search/'+newValue,
                method: "GET",
                dataType: "JSON",
                success: function (data, text) {
                    if(data.status.code == 200){
                        this.users = data.suggested_users;
                        this.setState({
                            suggestions: this.getSuggestions(newValue, this.users),
                            suggestionsList : this.getSuggestions(newValue, this.users)
                        });
                    }
                }.bind(this),
                error: function (request, status, error) {
                    console.log(request.responseText);
                    console.log(status);
                    console.log(error);
                }.bind(this)
            });
        }
    }

    onSuggestionsUpdateRequested({ value }) {
        this.setState({
            suggestions: this.getSuggestions(value, this.users),
            suggestionsList : this.getSuggestions(value, this.users)
        });
    }

    handleClick() {
        this.setState({isShowingModal: true});
    }

    handleClose() {
        this.setState({isShowingModal: false, isFolderNameEmpty : false, isFolderClrEmpty : false, CFName : "", CFClrClass : "",
            clrChosen : "", isAlreadySelected:false, value: '', suggestions: [], suggestionsList : {}, sharedWithIds : [],
            sharedWithNames : [], sharedWithUsernames : []});

        this.users = [];
        this.sharedWithIds = [];
        this.sharedWithNames = [];
        this.sharedWithUsernames = [];
    }

    handleNameChange(e){
        this.setState({CFName: e.target.value, isFolderNameEmpty: false});
    }

    onFolderCreate(){
        if(this.state.CFName == ""){
            this.setState({isFolderNameEmpty: true});
        }else{
            this.setState({isFolderNameEmpty: false});
        }

        if(!this.state.CFColor){
            this.setState({isFolderClrEmpty: true});
        }else{
            this.setState({isFolderClrEmpty: false});
        }

        if(this.state.CFName && this.state.CFColor){
            console.log("this.state.CFName ==> "+this.state.CFName);
            console.log("this.state.CFColor ==> "+this.state.CFColor);
            console.log("this.state.sharedWithIds ==> "+this.state.sharedWithIds);
            console.log("this.state.sharedWithUsernames ==> "+this.state.sharedWithUsernames);

            $.ajax({
                url: '/folders/add-new',
                method: "POST",
                dataType: "JSON",
                headers: { 'prg-auth-header':this.state.loggedUser.token },
                data:{folder_name:this.state.CFName, folder_color:this.state.CFColor, shared_with:this.state.sharedWithIds},
                success: function (data, text) {
                    if (data.status.code == 200) {
                        console.log("folder_id ==> "+data.folder_id)
                        this.loadFolders();
                        this.setState({isShowingModal: false, CFName : "", CFColor : ""});
                        console.log(this.state.CFName, this.state.CFColor);
                        let _notificationData = {
                            folder_id:data.folder_id,
                            notification_type:"share_folder",
                            notification_sender:this.state.loggedUser,
                            notification_receivers:this.state.sharedWithUsernames
                        };

                        Socket.sendFolderNotification(_notificationData);

                    }
                }.bind(this),
                error: function (request, status, error) {
                    console.log(status);
                    console.log(error);
                }
            });


        }
    }

    colorPicker(e){
        let colorCls = e.target.getAttribute('data-color');
        this.setState({CFColor : colorCls, isFolderClrEmpty: false});
    }

    isActive(value){
        return ((value===this.state.CFColor) ? 'palette active': 'palette');
    }

    addFolderPopup(){
        const { value, suggestions, suggestionsList } = this.state;

        const inputProps = {
            placeholder: 'Type a name...',
            value,
            onChange: this.onChange,
            className: 'form-control'
        };

        let shared_with_list = [];

        if(this.state.sharedWithNames.length > 0){
            shared_with_list = this.state.sharedWithNames.map((name,key)=>{
                return <span key={key} className="user">{name}<i className="fa fa-times" aria-hidden="true" onClick={(event)=>{this.removeUser(key)}}></i></span>
            });
        }
        return(
            <div>
                {this.state.isShowingModal &&
                <ModalContainer onClose={this.handleClose.bind(this)} zIndex={9999}>
                    <ModalDialog onClose={this.handleClose.bind(this)} className="modalPopup" width="50%">
                        <div className="popup-holder">
                            <section className="create-folder-popup">
                                <section className="folder-header">
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <h2>Create new folder</h2>
                                        </div>
                                    </div>
                                </section>
                                <section className="folder-body">
                                    <div className="row folder-name">
                                        <div className="col-sm-12 input-group">
                                            <p>Name your folder</p>
                                            <input type="text" className="form-control" value={this.state.CFName} onChange={this.handleNameChange.bind(this)} placeholder="Type a category name..." />
                                            {
                                                (this.state.isFolderNameEmpty)?
                                                    <span className="errorMsg">Please add a Folder name</span>
                                                :
                                                    null
                                            }
                                        </div>
                                    </div>
                                    <div className="row folder-color">
                                        <div className="col-sm-12 input-group">
                                            <p>Choose a colour</p>
                                            <div className="color-palette clearfix">
                                                <div className={this.isActive('#ed0677')} style={{backgroundColor: "#ed0677"}} data-color="#ed0677" onClick={this.colorPicker.bind(this)}>
                                                    <i className="fa fa-check" aria-hidden="true"></i>
                                                </div>
                                                <div className={this.isActive('#1b9ed9')} style={{backgroundColor: "#1b9ed9"}} data-color="#1b9ed9" onClick={this.colorPicker.bind(this)}>
                                                    <i className="fa fa-check" aria-hidden="true"></i>
                                                </div>
                                                <div className={this.isActive('#a2c73e')} style={{backgroundColor: "#a2c73e"}} data-color="#a2c73e" onClick={this.colorPicker.bind(this)}>
                                                    <i className="fa fa-check" aria-hidden="true"></i>
                                                </div>
                                                <div className={this.isActive('#b01d5a')} style={{backgroundColor: "#b01d5a"}} data-color="#b01d5a" onClick={this.colorPicker.bind(this)}>
                                                    <i className="fa fa-check" aria-hidden="true"></i>
                                                </div>
                                                <div className={this.isActive('#091652')} style={{backgroundColor: "#091652"}} data-color="#091652" onClick={this.colorPicker.bind(this)}>
                                                    <i className="fa fa-check" aria-hidden="true"></i>
                                                </div>
                                                <div className={this.isActive('#bbbdbe')} style={{backgroundColor: "#bbbdbe"}} data-color="#bbbdbe" onClick={this.colorPicker.bind(this)}>
                                                    <i className="fa fa-check" aria-hidden="true"></i>
                                                </div>
                                                <div className={this.isActive('#067d41')} style={{backgroundColor: "#067d41"}} data-color="#067d41" onClick={this.colorPicker.bind(this)}>
                                                    <i className="fa fa-check" aria-hidden="true"></i>
                                                </div>
                                            </div>
                                            {
                                                (this.state.isFolderClrEmpty)?
                                                    <span className="errorMsg">Please select Folder color</span>
                                                :
                                                    null
                                            }
                                        </div>
                                    </div>
                                    <div className="row invite-people">
                                        <div className="col-sm-12 input-group">
                                            <p>Invite some people</p>
                                            <Autosuggest suggestions={suggestions}
                                                         onSuggestionsUpdateRequested={this.onSuggestionsUpdateRequested}
                                                         getSuggestionValue={this.getSuggestionValue}
                                                         renderSuggestion={this.renderSuggestion}
                                                         inputProps={inputProps} />
                                            {
                                                (this.state.sharedWithNames.length > 0)?
                                                    <div className="user-holder">{shared_with_list}</div> : null
                                            }


                                        </div>
                                    </div>
                                </section>
                                <section className="folder-footer">
                                    <div className="row action-bar">
                                        <div className="col-sm-12">
                                            <button className="btn btn-add-folder" onClick={this.onFolderCreate.bind(this)}>Add Folder</button>
                                        </div>
                                    </div>
                                </section>
                            </section>
                        </div>
                    </ModalDialog>
                </ModalContainer>
                }
            </div>
        );
    }

    render(){
        let _folders = this.state.folders;
        let folderList = _folders.map(function(folder,key){
                            return (
                                <Folder key={key} folderData={folder} folderCount={key} />
                            )
                        });
        return(
            <section className="folder-container sub-container">
                <div className="container">
                    <section className="folder-header">
                        <div className="row">
                            <div className="col-sm-2">
                                <h2>Folders</h2>
                            </div>
                            <div className="col-sm-5 menu-bar">
                                <div className="folder-type active">
                                    <h4>My Folders</h4>
                                    <div className="highlighter"></div>

                                </div>
                                <div className="folder-type">
                                    <h4>Group Folders</h4>
                                    <div className="highlighter"></div>
                                </div>
                            </div>
                            <div className="col-sm-5">
                                <div className="crt-folder">
                                    <button className="btn btn-crt-folder" onClick={this.handleClick.bind(this)}><i className="fa fa-plus"></i> Create Folder</button>
                                </div>
                                <div className="search-folder">
                                    <div className="inner-addon">
                                        <i className="fa fa-search"></i>
                                        <input type="text" className="form-control" placeholder="Search"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="folder-body">
                        {folderList}
                    </section>
                </div>
                {this.addFolderPopup()}
            </section>
        );
    }

}

export class Folder extends React.Component{
    constructor(props){
        super(props);

        this.state={
            loggedUser : Session.getSession('prg_lg'),
            isCollapsed : true,
            files: []
        };
        this.files = [];
        this.active_folder_id = 0;

        this.onDrop = this.onDrop.bind(this);
        this.onOpenClick = this.onOpenClick.bind(this);
        this.onDropAccepted = this.onDropAccepted.bind(this);

    }

    onDropAccepted(accepted_files){
        let _this = this;
        console.log("onDropAccepted");
        console.log(this.active_folder_id);
        console.log("onDropAccepted");
        console.log(accepted_files)
        for(let i = 0; i < accepted_files.length; i++) {
            _readFile(accepted_files[i]);
        }

        function _readFile(file){

            var reader = new FileReader();
            reader.onload = (function(context) {
                //console.log(dataArr);
                //console.log(file)

                return function(e) {
                    var src = e.target.result;
                    var upload_index = _this.files.length;

                    var payLoad ={
                        content:src,
                        upload_id:_this.active_folder_id,
                        upload_index:upload_index,
                        name:file.name,
                        preview:file.preview,
                        size:file.size,
                        type:file.type,
                        isUploaded:false,
                        file_path:'',
                        thumb_path:''
                    };
                    context.uploadHandler(payLoad);
                    context.files.push(payLoad);
                    context.setState({files:this.files});
                };

            })(_this);

            reader.readAsDataURL(file);
        }

    }

    uploadHandler(uploadContent){
        console.log(uploadContent)

        $.ajax({
            url: '/ajax/upload/folderDoc',
            method: "POST",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.state.loggedUser.token },
            data:uploadContent

        }).done(function (data, text) {
            if (data.status.code == 200) {
                for(var a=0;a<this.files.length;a++) {
                    if (this.files[a].upload_index == data.upload.upload_index) {
                        this.files[a].isUploaded = true;
                        this.files[a].file_path = data.upload.file_path;
                        this.files[a].thumb_path = data.upload.thumb_path;
                    }
                }
                this.setState({files:this.files});

            }
        }.bind(this)).error(function (request, status, error) {

            console.log(request.status)
            console.log(status);
            console.log(error);
        });

    }

    onFldrExpand(){
        console.log("clicked");
        let isCollapsed = this.state.isCollapsed;
        this.setState({isCollapsed : !isCollapsed});
    }

    onDrop(folder_id) {
        this.active_folder_id = folder_id;
        console.log("onDrop")
        console.log(this.active_folder_id);
    }

    onOpenClick(folder_id) {
        this.dropzone.open(folder_id);
    }

    render(){
        let folderData = this.props.folderData;
        let ownerImg;
        let i = (
            <Popover id="popover-contained" style={{maxWidth: "635px", width: "635px"}}>
                <SharePopup />
            </Popover>
        );

        if(folderData.owned_by == "me"){
            ownerImg = (this.state.loggedUser.profile_image == "")? "/images/default-profile-pic.png" : this.state.loggedUser.profile_image;
        }else{
            ownerImg = folderData.folder_user.profile_image;
        }
        return(

            <div className={(this.state.isCollapsed)? "row folder" : "row folder see-all"}>
                <Dropzone className="folder-wrapper" ref={(node) => { this.dropzone = node; }} onDrop={(event)=>{this.onDrop(folderData.folder_id)}} multiple={true} maxSize={10485760} disableClick={true} activeClassName="drag" accept="image/*, application/*" onDropAccepted={this.onDropAccepted}>
                    <div className="col-sm-2">
                        <div className="folder-cover-wrapper">
                            <span className="folder-overlay"></span>
                            <span className="folder-overlay"></span>
                            <div className="folder-cover">
                                <div className="content-wrapper" style={{backgroundColor: folderData.folder_color}}>
                                    <div className="logo-wrapper">
                                        <img src={ownerImg} alt={this.state.loggedUser.first_name} className="img-rounded" />
                                        <span className="logo-shader"></span>
                                        <span className="logo-shader"></span>
                                    </div>
                                    <h3>{folderData.folder_name}</h3>
                                </div>
                                {
                                    (this.props.folderCount != 0)?
                                        <OverlayTrigger rootClose trigger="click" placement="right" overlay={i}>
                                            <div className="share-folder">
                                                <i className="fa fa-share-alt" aria-hidden="true"></i>
                                            </div>
                                        </OverlayTrigger>
                                    :
                                        null
                                }
                            </div>
                            {/*
                                (this.state.files.length > 0)?
                                <div className="upload-anime">
                                    <i className="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
                                </div>
                                :
                                null
                                */
                            }
                            <div className="upload-anime">
                                <i className="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-10">
                        <div className="row">
                            <div className="folder-content-wrapper">
                                <div className="folder-items-wrapper">
                                    <div className="inner-wrapper">
                                        <div className="folder-col" onClick={this.onOpenClick.bind(this)} onClick={(event)=>{this.onOpenClick(folderData.folder_id)}}>
                                                <div className="folder-item upload-file">
                                                    <i className="fa fa-plus"></i>
                                                    <p>Upload new file or image</p>
                                                </div>
                                        </div>
                                        {/* files component */}
                                    </div>
                                    {
                                        /*(this.state.isCollapsed)?
                                            <div className="see-all" onClick={this.onFldrExpand.bind(this)}>
                                                <i className="fa fa-chevron-circle-right" aria-hidden="true"></i>
                                                <p>See All</p>
                                            </div>
                                        :
                                            <div className="see-all" onClick={this.onFldrExpand.bind(this)}>
                                                <i className="fa fa-chevron-circle-right" aria-hidden="true"></i>
                                                <p>See Less</p>
                                            </div>*/
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="drag-shader">
                        <p className="drag-title">Drag and Drop Link/Folder here</p>
                    </div>
                </Dropzone>
            </div>
        );
    }
}

export class File extends React.Component{
    constructor(props){
        super(props);

        this.state={}
    }

    render(){
        return(
            <div className="folder-col">
                <div className="folder-item pdf">
                    <div className="time-wrapper">
                        <p className="date-created">July 28, 2016</p>
                        <p className="time-created">12.34pm</p>
                    </div>
                    <div className="folder-title-holder">
                        <p className="folder-title">Cambodia Final Paper</p>
                    </div>
                    <span className="item-type"></span>
                </div>
                {
                    /*
                    <div className="folder-col">
                        <div className="folder-item jpg" style="background-image: url(/images/folder/sample_png.png)">
                            <div className="time-wrapper">
                                <p className="date-created">July 28, 2016</p>
                                <p className="time-created">12.34pm</p>
                            </div>
                            <div className="folder-title-holder">
                                <p className="folder-title">Cambodia Final Paper</p>
                            </div>
                            <div className="item-type"></div>
                        </div>
                    </div>
                    <div className="folder-item docs">
                        <div className="time-wrapper">
                            <p className="date-created">July 28, 2016</p>
                            <p className="time-created">12.34pm</p>
                        </div>
                        <div className="folder-title-holder">
                            <p className="folder-title">Cambodia Final Paper</p>
                        </div>
                        <span className="item-type"></span>
                    </div>
                    */
                }
            </div>
        );
    }
}

export class SharePopup extends React.Component{
    constructor(props) {
        super(props);
        this.state={
        }
    }

    render(){

        let i = (
            <Popover id="popover-contained" className="share-folder-popover add-new-user" style={{maxWidth: "280px", width: "280px", marginTop: "6.2%", marginLeft: "20%"}}>
                <SharePopupNewUsr />
            </Popover>
        );

        return(
            <div className="popup-holder">
                <section className="share-folder-popup">
                    <section className="folder-header">
                        <div className="row">
                            <div className="col-sm-12">
                                <div className="search-people-wrapper">
                                    <i className="fa fa-search" aria-hidden="true"></i>
                                    <input className="form-control search-people" type="text" placeholder="Search"/>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-12">
                                <div className="header-wrapper">
                                    <h3 className="popup-title">People in this folder</h3>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="folder-body">
                        <div className="shared-user-wrapper">
                            <div className="shared-user">
                                <img className="user-image img-circle" src="assets/images/user_2.png" alt="User"/>
                                    <div className="name-wrapper">
                                        <p className="name">Leonard Green</p>
                                        <p className="name-title">University of california, Barkeley</p>
                                    </div>
                                    <div className="shared-privacy">
                                        <p className="owner">(Owner)</p>
                                    </div>
                            </div>
                            <div className="shared-user">
                                <img className="user-image img-circle" src="assets/images/user_1.png" alt="User"/>
                                    <div className="name-wrapper">
                                        <p className="name">Saad Ei Yamani</p>
                                        <p className="name-title">University of california, Barkeley</p>
                                    </div>
                                    <div className="shared-privacy">
                                        <select className="privacy-selector">
                                            <option value="">Read Only</option>
                                            <option value="">Read/Write</option>
                                        </select>
                                    </div>
                                    <div className="action">
                                        <i className="fa fa-minus" aria-hidden="true"></i>
                                    </div>
                            </div>
                            <div className="shared-user">
                                <img className="user-image img-circle" src="assets/images/user-rounded.png" alt="User"/>
                                    <div className="name-wrapper">
                                        <p className="name">Gerald Edwards</p>
                                        <p className="name-title">University of california, Barkeley</p>
                                    </div>
                                    <div className="shared-privacy">
                                        <select className="privacy-selector">
                                            <option value="">Read Only</option>
                                            <option value="">Read/Write</option>
                                        </select>
                                    </div>
                                    <div className="action">
                                        <i className="fa fa-minus" aria-hidden="true"></i>
                                    </div>
                            </div>
                        </div>
                    </section>
                    <section className="folder-footer">
                        <div className="footer-action-wrapper">
                            <div className="see-all">
                                <i className="fa fa-chevron-circle-right" aria-hidden="true"></i>
                                <p>See All</p>
                            </div>
                            <OverlayTrigger container={this} trigger="click" placement="bottom" overlay={i}>
                                <p className="add-people">
                                    <i className="fa fa-plus"></i> Add more
                                </p>
                            </OverlayTrigger>
                        </div>
                    </section>
                </section>
            </div>

        )
    }
}

export class SharePopupNewUsr extends React.Component{
    constructor(props) {
        super(props);
        this.state={};

    }

    render() {

        const { value, suggestions } = this.state;
        let _this = this;

        return (
            <div className="popup-holder">
                <section className="share-folder-add-people-popup">
                    <div className="input-wrapper">
                        <i className="fa fa-search"></i>
                        <input type="text" className="form-control" placeholder="Type name"/>
                    </div>
                    <div className="suggestions-wrapper">
                        <div className="suggestion">
                            <img className="user-image img-circle" src="assets/images/user_1.png" alt="User"/>
                                <div className="name-wrapper">
                                    <p className="name">Saa Katamor</p>
                                </div>
                                <div className="action">
                                    <i className="fa fa-plus" aria-hidden="true"></i>
                                </div>
                        </div>
                        <div className="suggestion">
                            <img className="user-image img-circle" src="assets/images/user_2.png" alt="User"/>
                                <div className="name-wrapper">
                                    <p className="name">Soham Khan</p>
                                </div>
                                <div className="action">
                                    <i className="fa fa-plus" aria-hidden="true"></i>
                                </div>
                        </div>
                    </div>
                </section>
            </div>
        )
    }


}
