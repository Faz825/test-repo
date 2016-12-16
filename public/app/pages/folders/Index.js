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
            folders : [],
            addFolder : true,
            folderValue:'',
            folderSuggestions:[],
            folderSuggestionsList:{},
            selectedFileFolder:[],
            onSelect: false
        };

        this.users = [];
        this.sharedWithIds = [];
        this.sharedWithNames = [];
        this.sharedWithUsernames = [];
        this.loadFolderRequest = true;
        this.defaultFolder = [];
        this.folders = [];

        this.handleClick = this.handleClick.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.colorPicker = this.colorPicker.bind(this);
        this.removeUser = this.removeUser.bind(this);
        this.loadFolders = this.loadFolders.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onSuggestionsUpdateRequested = this.onSuggestionsUpdateRequested.bind(this);
        this.getSuggestionValue = this.getSuggestionValue.bind(this);
        this.renderSuggestion = this.renderSuggestion.bind(this);
        this.onFolderChange = this.onFolderChange.bind(this);
        this.onFolderSuggestionsUpdateRequested = this.onFolderSuggestionsUpdateRequested.bind(this);
        this.getFolderSuggestionValue = this.getFolderSuggestionValue.bind(this);
        this.renderFolderSuggestion = this.renderFolderSuggestion.bind(this);
        this.showSelectedFileFolder = this.showSelectedFileFolder.bind(this);

    }

    componentDidMount(){
        this.checkDefaultFolder();
    }

    componentWillUnmount(){
        this.loadFolderRequest = false;
    }

    checkDefaultFolder(){

        if(this.defaultFolder.length == 0){
            let _dF = {
                CFName:"My Folder",
                CFColor:"#1b9ed9"
            };
            this.defaultFolder.push(_dF);

            $.ajax({
                url: '/folders/get-count',
                method: "GET",
                dataType: "JSON",
                headers: {'prg-auth-header': this.state.loggedUser.token}
            }).done( function (data, text){
                if(data.status.code == 200 && this.loadFolderRequest){
                    if(data.count == 0){
                        this.setState({CFName:"My Folder", CFColor:"#1b9ed9"});
                        this.addDefaultFolder();
                    } else{
                        this.loadFolders();
                    }
                }
            }.bind(this));

        }
    }

    loadFolders(){

        $.ajax({
            url: '/folders/get-all',
            method: "GET",
            dataType: "JSON",
            headers: {'prg-auth-header': this.state.loggedUser.token}
        }).done( function (data, text){
            if(data.status.code == 200 && this.loadFolderRequest){
                let folders = data.folders;
                this.setState({folders: folders});
            }
        }.bind(this));
    }

    addDefaultFolder(){

        if(this.loadFolderRequest && this.defaultFolder.length == 1){

            $.ajax({
                url: '/folders/add-new',
                method: "POST",
                dataType: "JSON",
                headers: {'prg-auth-header': this.state.loggedUser.token},
                data: {
                    folder_name: this.state.CFName,
                    folder_color: this.state.CFColor,
                    shared_with: this.state.sharedWithIds,
                    isDefault: 1
                }
            }).done( function (data, text){
                if (data.status.code == 200 && this.loadFolderRequest) {
                    this.setState({CFName : "", CFColor : ""});
                    let folders = [data.folder];
                    this.setState({folders: folders});
                }
            }.bind(this));
        }

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

    getFolderSuggestions(value, data) {
        const escapedValue = Lib.escapeRegexCharacters(value.trim());
        if (escapedValue === '') {
            return [];
        }
        const regex = new RegExp('^' + escapedValue, 'i');
        return data.filter(data => regex.test(data.name));
    }

    showSelectedFileFolder(suggestion){

        this.setState({onSelect:true});
        if(suggestion.type == "folder"){
            $.ajax({
                url: '/folder/get-folder/'+suggestion.folder_id,
                method: "GET",
                dataType: "JSON",
                success: function (data, text) {
                    if(data.status.code == 200){
                        this.setState({selectedFileFolder:data.folder, onSelect:false})
                    }
                }.bind(this),
                error: function (request, status, error) {
                    console.log(request.responseText);
                    console.log(status);
                    console.log(error);
                }.bind(this)
            });
        } else{
            $.ajax({
                url: '/folder/get-document/'+suggestion.folder_id+'/'+suggestion.document_id,
                method: "GET",
                dataType: "JSON",
                success: function (data, text) {
                    if(data.status.code == 200){
                        this.setState({selectedFileFolder:data.folder, onSelect:false})
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

    getFolderSuggestionValue(suggestion) {
        return suggestion.name;
    }

    renderFolderSuggestion(suggestion) {
        return (
            <a href="javascript:void(0)" onClick={()=>this.showSelectedFileFolder(suggestion)}>
                <div className="suggestion" >
                    <span>{suggestion.name}</span>
                </div>
            </a>
        );
    }

    onFolderChange(event, { newValue }) {

        this.setState({folderValue:newValue});
        if(!this.state.onSelect){
            this.setState({selectedFileFolder:[]})

            if(newValue.length == 1){

                $.ajax({
                    url: '/folder/search/'+newValue,
                    method: "GET",
                    dataType: "JSON",
                    success: function (data, text) {
                        if(data.status.code == 200){
                            this.folders = data.suggested_folders;
                            this.setState({
                                folderSuggestions: this.getFolderSuggestions(newValue, this.folders),
                                folderSuggestionsList : this.getFolderSuggestions(newValue, this.folders)
                            });
                        }
                    }.bind(this),
                    error: function (request, status, error) {
                        console.log(request.responseText);
                        console.log(status);
                        console.log(error);
                    }.bind(this)
                });
            } else if(newValue.length > 1 && this.folders.length < 10){

                $.ajax({
                    url: '/folder/search/'+newValue,
                    method: "GET",
                    dataType: "JSON",
                    success: function (data, text) {
                        if(data.status.code == 200){
                            this.folders = data.suggested_folders;
                            this.setState({
                                folderSuggestions: this.getFolderSuggestions(newValue, this.folders),
                                folderSuggestionsList : this.getFolderSuggestions(newValue, this.folders)
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

    }

    onFolderSuggestionsUpdateRequested({ value }) {
        this.setState({
            folderSuggestions: this.getFolderSuggestions(value, this.folders),
            folderSuggestionsList : this.getFolderSuggestions(value, this.folders)
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

        if(this.state.CFName && this.state.CFColor && this.state.addFolder){

            this.setState({addFolder : false});

            $.ajax({
                url: '/folders/add-new',
                method: "POST",
                dataType: "JSON",
                headers: { 'prg-auth-header':this.state.loggedUser.token },
                data:{folder_name:this.state.CFName, folder_color:this.state.CFColor, shared_with:this.state.sharedWithIds},
                success: function (data, text) {
                    if (data.status.code == 200) {
                        this.loadFolders();
                        this.setState({isShowingModal: false, CFName : "", CFColor : "", addFolder : true});

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
                    <ModalDialog onClose={this.handleClose.bind(this)} className="modalPopup" width="40%">
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
                                            {<Autosuggest suggestions={suggestions}
                                                         onSuggestionsUpdateRequested={this.onSuggestionsUpdateRequested}
                                                         getSuggestionValue={this.getSuggestionValue}
                                                         renderSuggestion={this.renderSuggestion}
                                                         inputProps={inputProps} />}
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

        const value = this.state.folderValue;

        const { folderSuggestions, folderSuggestionsList } = this.state;
        let _this = this;
        let _folders = (this.state.selectedFileFolder.length > 0)?this.state.selectedFileFolder:this.state.folders;
        let folderList = _folders.map(function(folder,key){
            return (
                <Folder key={key} folderData={folder} folderCount={key} onLoadFolders={_this.loadFolders.bind(this)} />
            )
        });

        const inputProps = {
            placeholder: 'Search',
            value,
            onChange: this.onFolderChange,
            className: 'form-control'
        };

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
                                <div className="search-folder">
                                    <div className="inner-addon">
                                        <i className="fa fa-search"></i>
                                        {<Autosuggest suggestions={folderSuggestions}
                                                      onSuggestionsUpdateRequested={this.onFolderSuggestionsUpdateRequested}
                                                      getSuggestionValue={this.getFolderSuggestionValue}
                                                      renderSuggestion={this.renderFolderSuggestion}
                                                      inputProps={inputProps} />}

                                    </div>
                                </div>
                                <div className="crt-folder">
                                    <button className="btn btn-crt-folder" onClick={this.handleClick.bind(this)}><i className="fa fa-plus"></i> New Folder</button>
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
            isProgressBarActive : false,
            files: [],
            showConfirm:false,
            isShowingModal : false,
            deleteFileId:0,
            notAccepted: false,
            showViewFile:false,
            selectedFile:[]
        };
        this.files = [];
        this.active_folder_id = 0;

        this.onDrop = this.onDrop.bind(this);
        this.onOpenClick = this.onOpenClick.bind(this);
        this.onDropAccepted = this.onDropAccepted.bind(this);
        this.onDropRejected = this.onDropRejected.bind(this);
        this.uploadHandler = this.uploadHandler.bind(this);
        this.onShowConfirm = this.onShowConfirm.bind(this);
        this.viewFile = this.viewFile.bind(this);

        // this.filesData = [
        //  {
        //      document_id : "582ae658247ffffc240b08b9",
        //      document_name : "PEF - Anuthiga Sriskanthan - DOC",
        //      document_path : "https://s3.amazonaws.com/proglobe/dev/581976edb9c941e31dbdf106/0d843490-ab20-11e6-895a-eba5cf55b64b_folder_document.xlsx",
        //      document_thumb_path : null,
        //      document_type : "doc",
        //      document_updated_at:{
        //          createdDate: "Oct 11, 2016",
        //          createdTime: "9:31 am"
        //      },
        //      document_user : "574bcb96272a6fd40768cf0f"
        //  },
        //  {
        //      document_id : "582ae658247ffffc240b08b9",
        //      document_name : "PEF - Anuthiga Sriskanthan - DOC",
        //      document_path : "https://s3.amazonaws.com/proglobe/dev/58412c16738e2cbb0ba865ac/e99f8950-c2d8-11e6-9655-9bf08d880b0a_folder_document.pptx",
        //      document_thumb_path : null,
        //      document_type : "doc",
        //      document_updated_at:{
        //          createdDate: "Oct 11, 2016",
        //          createdTime: "9:31 am"
        //      },
        //      document_user : "574bcb96272a6fd40768cf0f"
        //  },
        //  {
        //      document_id : "582ae658247ffffc240b08b9",
        //      document_name : "PEF - Anuthiga Sriskanthan - DOC",
        //      document_path : "https://s3.amazonaws.com/proglobe/dev/582316a5eb41cf803e8f6619/c7977ab0-b22b-11e6-b79d-0d45aa6780ca_folder_document.docx",
        //      document_thumb_path : null,
        //      document_type : "doc",
        //      document_updated_at:{
        //          createdDate: "Oct 11, 2016",
        //          createdTime: "9:31 am"
        //      },
        //      document_user : "574bcb96272a6fd40768cf0f"
        //  },
        //  {
        //      document_id : "582ae658247ffffc240b08b9",
        //      document_name : "PEF - Anuthiga Sriskanthan",
        //      document_path : "https://s3.amazonaws.com/proglobe/dev/581aebf4ade802501641fbd6/6f5115c0-c34a-11e6-a3cd-f1524763cacd_folder_document.pdf",
        //      document_thumb_path : null,
        //      document_type : "pdf",
        //      document_updated_at:{
        //          createdDate: "Oct 11, 2016",
        //          createdTime: "9:31 am"
        //      },
        //      document_user : "574bcb96272a6fd40768cf0f"
        //  },
        //  {
        //      document_id : "582ae658247ffffc240b08b9",
        //      document_name : "PEF - Anuthiga Sriskanthan",
        //      document_path : "https://s3.amazonaws.com/proglobe/dev/581aebf4ade802501641fbd6/2dd7a6d0-c34b-11e6-a3cd-f1524763cacd_folder_document.txt",
        //      document_thumb_path : null,
        //      document_type : "txt",
        //      document_updated_at:{
        //          createdDate: "Oct 11, 2016",
        //          createdTime: "9:31 am"
        //      },
        //      document_user : "574bcb96272a6fd40768cf0f"
        //  },
        //  {
        //      document_id : "582c2d3a1461f4050b1764c5",
        //      document_name : "babymartonline.com-check-list",
        //      document_path : "https://s3.amazonaws.com/proglobe/dev/581976edb9c941e31dbdf106/dc9723b0-abe2-11e6-a1ae-0543d9df05d4_folder_document.gif",
        //      document_thumb_path : "https://s3.amazonaws.com/proglobe/dev/581976edb9c941e31dbdf106/dc9723b0-abe2-11e6-a1ae-0543d9df05d4_folder_document_thumb.gif",
        //      document_type : "gif",
        //      document_updated_at:{
        //          createdDate: "Oct 11, 2016",
        //          createdTime: "9:31 am"
        //      },
        //      document_user : "574bcb96272a6fd40768cf0f"
        //  },
        //  {
        //      document_id : "582be27c639078842cbc24f6",
        //      document_name : "babymartonline.com-check-list",
        //      document_path : "https://s3.amazonaws.com/proglobe/dev/581976edb9c941e31dbdf106/5251d0f0-abb6-11e6-a779-b59f1d09ef48_folder_document.gif",
        //      document_thumb_path : "https://s3.amazonaws.com/proglobe/dev/581976edb9c941e31dbdf106/5251d0f0-abb6-11e6-a779-b59f1d09ef48_folder_document_thumb.gif",
        //      document_type : "jpg",
        //      document_updated_at:{
        //          createdDate: "Oct 11, 2016",
        //          createdTime: "9:31 am"
        //      },
        //      document_user : "574bcb96272a6fd40768cf0f"
        //  }
        // ];

    }

    handleClick() {
        this.setState({isShowingModal: true});
    }

    handleClose() {
        this.setState({isShowingModal: false});
    }

    onDropAccepted(accepted_files){
        let _this = this;

        for(let i = 0; i < accepted_files.length; i++) {
            _readFile(accepted_files[i]);
        }

        function _readFile(file){

            var reader = new FileReader();
            reader.onload = (function(context) {

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
                    context.setState({files:context.files, isProgressBarActive: true});
                    console.log("file upload started ... show the spinner")
                };

            })(_this);

            reader.readAsDataURL(file);
        }

    }
    
    onDropRejected(rejected_files){
        let _this = this;
        this.setState({notAccepted : true});

        setTimeout(function(){ 
            _this.setState({notAccepted : false});
        }, 2500)
    }

    uploadHandler(uploadContent){

        $.ajax({
            url: '/ajax/upload/folderDoc',
            method: "POST",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.state.loggedUser.token },
            data:uploadContent
        }).done(function (data, text) {
            if (data.status.code == 200) {
                for(var a=0;a<this.files.length;a++) {
                    if (this.files[a].upload_index == data.upload_index) {
                        this.files.splice(a,1); // remove the progressbar of uploaded document
                    }
                }
                this.setState({files:this.files});
                console.log("file upload finished ... hide the spinner");
                this.props.onLoadFolders();
            }
        }.bind(this)).error(function (request, status, error) {
            console.log(request.status);
            console.log(status);
            console.log(error);
        }.bind(this));

    }

    onFldrExpand(){
        let isCollapsed = this.state.isCollapsed;
        this.setState({isCollapsed : !isCollapsed});
    }

    onDrop(folder_id) {
        this.active_folder_id = folder_id;
    }

    onOpenClick(folder_id) {
        this.dropzone.open(folder_id);
    }

    deleteFile(){
        $.ajax({
            url: '/document/remove',
            method: "POST",
            dataType: "JSON",
            data:{file_id:this.state.deleteFileId},
            headers: { 'prg-auth-header':this.state.loggedUser.token }
        }).done( function (data, text) {
            if(data.status.code == 200) {
                this.props.onLoadFolders();
                this.setState({showConfirm:false, deleteFileId:0});
            }
        }.bind(this));
    }

    onShowConfirm(file_id){
        this.setState({showConfirm:true, deleteFileId:file_id});
    }

    viewFile(file){
        this.setState({showViewFile:true, selectedFile:file});
    }

    closeConfirmPopup(){
        this.setState({showConfirm:false, deleteFileId:0});
    }

    handleClose(){
        console.log("handleClose");
        this.setState({showViewFile:false, selectedFile:[]});
    }

    getConfirmationPopup(){
        return(
            <div>
                {this.state.showConfirm &&
                <ModalContainer zIndex={9999}>
                    <ModalDialog width="30%" style={{marginTop : "-100px"}}>
                        <div className="col-xs-12">
                            <p className="confirmation_p">Are you sure to delete this file?</p>
                        </div>
                        <p className="add-note-cat btn" onClick={this.deleteFile.bind(this)}>Yes</p>
                        <p className="add-note-cat confirm-no btn" onClick={this.closeConfirmPopup.bind(this)}>No</p>
                    </ModalDialog>
                </ModalContainer>
                }
            </div>
        );
    }

    viewFilePopup(){
        let url = "";
        let docType = this.state.selectedFile.document_type;

        if(this.state.selectedFile.document_type == "bmp" || this.state.selectedFile.document_type == "gif" ||
            this.state.selectedFile.document_type == "jpg" || this.state.selectedFile.document_type == "jpeg" ||
            this.state.selectedFile.document_type == "png"){
            url = "";

        }else if(docType == "ppt" || docType == "pptx" || docType == "doc" || docType == "docx" || docType == "xls" || docType == "xlsx"){
            url = "officeFile";
        }else{
            url = "https://docs.google.com/gview?url="+this.state.selectedFile.document_path+"&embedded=true";
        }

        return(
            <div>
                {this.state.showViewFile &&
                <ModalContainer onClose={this.handleClose.bind(this)} zIndex={9999}>
                    <ModalDialog onClose={this.handleClose.bind(this)} width="60%" style={{padding : "5px"}}>
                        <div className="viewer">
                            {
                                (url == "")?
                                <div style={{minHeight : "350px"}}>
                                    <img src={this.state.selectedFile.document_path} className="img-responsive" />
                                </div>
                                :
                                (url == "officeFile")?
                                <iframe src={"https://view.officeapps.live.com/op/embed.aspx?src="+this.state.selectedFile.document_path} width='100%' height='500px' frameBorder='0'>
                                </iframe>
                                :
                                <iframe src={url} style={{width:"100%", height:"500px"}} frameBorder="0"></iframe> 
                            }
                        </div>
                    </ModalDialog>
                </ModalContainer>
                }
            </div>
        );
    }

    render(){
        let _this = this;
        let folderData = this.props.folderData;
        let documents = folderData.documents;
        let ownerImg, ownerName;
        let i = (
            <Popover id="popover-contained" className="share-popover-contained" style={{maxWidth: "635px", width: "635px"}}>
                <SharePopup folderData={folderData}/>
            </Popover>
        );

        if(folderData.owned_by == "me"){
            ownerImg = (this.state.loggedUser.profile_image == "")? "/images/default-profile-pic.png" : this.state.loggedUser.profile_image;
            ownerName = this.state.loggedUser.first_name;
        }else{
            ownerImg = (folderData.folder_user.profile_image == "")? "/images/default-profile-pic.png" : folderData.folder_user.profile_image;
            ownerName = folderData.folder_user.first_name;
        }

        let _fileList = documents.map(function(file,key){
                            return (
                                <File fileData={file} key={key} showConfirm={_this.onShowConfirm.bind(this)} viewFile={_this.viewFile.bind(this)}/>
                            )
                        });

        let _uploadFileList = this.state.files.map(function(uploadFile,key){
            return(
                <FilePreview uploadData={uploadFile} key={key}/>
            )

        });

        return(
            <div className={(this.state.isCollapsed)? "row folder" : "row folder see-all"}>
                {
                    (folderData.shared_mode == 2)?
                        <Dropzone className="folder-wrapper" ref={(node) => { this.dropzone = node; }} onDrop={(event)=>{this.onDrop(folderData.folder_id)}} multiple={true} maxSize={10485760} disableClick={true} activeClassName="drag" accept="image/*, application/*, text/plain" onDropAccepted={this.onDropAccepted} onDropRejected={this.onDropRejected}>
                            <div className="col-sm-2">
                                <div className="folder-cover-wrapper">
                                    <span className="folder-overlay"></span>
                                    <span className="folder-overlay"></span>
                                    <div className="folder-cover">
                                        <div className="content-wrapper" style={{backgroundColor: folderData.folder_color}}>
                                            <div className="logo-wrapper">
                                                <img src={ownerImg} alt={ownerName} className="img-rounded" />
                                                <span className="logo-shader"></span>
                                                <span className="logo-shader"></span>
                                            </div>
                                            <h3>{folderData.folder_name}</h3>
                                        </div>
                                        {
                                            (this.props.folderCount != 0)?
                                                <OverlayTrigger rootClose trigger="click" placement="right" overlay={i}>
                                                    <div className="share-folder">
                                                        {
                                                            (folderData.is_shared) ?
                                                                <i className="fa fa-users" aria-hidden="true"></i> :
                                                                <i className="fa fa-share-alt" aria-hidden="true"></i>
                                                        }
                                                    </div>
                                                </OverlayTrigger>
                                                :
                                                null
                                        }
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-10">
                                <div className="row">
                                    <div className="folder-content-wrapper">
                                        {
                                            (this.state.notAccepted)?
                                                <p className="error-text">File type is not accepted.</p>
                                                :
                                                null
                                        }
                                        <div className="folder-items-wrapper">
                                            <div className="inner-wrapper">
                                                <div className="folder-col"  onClick={(event)=>{this.onOpenClick(folderData.folder_id)}}>
                                                    <div className="folder-item upload-file">
                                                        <i className="fa fa-plus"></i>
                                                        <p>Upload new file or image</p>
                                                    </div>
                                                </div>
                                                {_uploadFileList}
                                                {_fileList}
                                            </div>
                                            {
                                                (documents.length + this.state.files.length > 4)?
                                                    (this.state.isCollapsed)?
                                                        <div className="see-all" onClick={this.onFldrExpand.bind(this)}>
                                                            <i className="fa fa-chevron-circle-right" aria-hidden="true"></i>
                                                            <p>See All</p>
                                                        </div>
                                                        :
                                                        <div className="see-all" onClick={this.onFldrExpand.bind(this)}>
                                                            <i className="fa fa-chevron-circle-right" aria-hidden="true"></i>
                                                            <p>See Less</p>
                                                        </div>
                                                    :
                                                    null
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="drag-shader">
                                <p className="drag-title">Drag and Drop Link/Folder here</p>
                            </div>
                        </Dropzone> :
                        <div className="folder-wrapper">
                            <div className="col-sm-2">
                                <div className="folder-cover-wrapper">
                                    <span className="folder-overlay"></span>
                                    <span className="folder-overlay"></span>
                                    <div className="folder-cover">
                                        <div className="content-wrapper" style={{backgroundColor: folderData.folder_color}}>
                                            <div className="logo-wrapper">
                                                <img src={ownerImg} alt={ownerName} className="img-rounded" />
                                                <span className="logo-shader"></span>
                                                <span className="logo-shader"></span>
                                            </div>
                                            <h3>{folderData.folder_name}</h3>
                                        </div>
                                        {
                                            (this.props.folderCount != 0)?
                                                <OverlayTrigger rootClose trigger="click" placement="right" overlay={i}>
                                                    <div className="share-folder">
                                                        {
                                                            (folderData.is_shared) ?
                                                                <i className="fa fa-users" aria-hidden="true"></i> :
                                                                <i className="fa fa-share-alt" aria-hidden="true"></i>
                                                        }
                                                    </div>
                                                </OverlayTrigger>
                                                :
                                                null
                                        }
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-10">
                                <div className="row">
                                    <div className="folder-content-wrapper">
                                        <div className="folder-items-wrapper">
                                            <div className="inner-wrapper">
                                                {_fileList}
                                            </div>
                                            {
                                                (documents.length + this.state.files.length > 4)?
                                                    (this.state.isCollapsed)?
                                                        <div className="see-all" onClick={this.onFldrExpand.bind(this)}>
                                                            <i className="fa fa-chevron-circle-right" aria-hidden="true"></i>
                                                            <p>See All</p>
                                                        </div>
                                                        :
                                                        <div className="see-all" onClick={this.onFldrExpand.bind(this)}>
                                                            <i className="fa fa-chevron-circle-right" aria-hidden="true"></i>
                                                            <p>See Less</p>
                                                        </div>
                                                    :
                                                    null
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                }
                {this.getConfirmationPopup()}
                {this.viewFilePopup()}
            </div>
        );
    }
}

export class File extends React.Component{
    constructor(props){
        super(props);

        this.state={
            loggedUser : Session.getSession('prg_lg'),
            isShowingFile : false
        }
    }

    onShowConfirm(id){
       this.props.showConfirm(id);
    }

    viewFile(data){
        console.log("viewFile == 1012")
        this.props.viewFile(data);
    }

    render(){
        let data = this.props.fileData;
        
        let thumbIMg = {},
            imgClass = "",
            isSelected = "";

        if(data.isSelected){
            isSelected = "selected-file";
        }

        if (data.document_thumb_path) {
            imgClass = "image";
            thumbIMg = {
                backgroundImage: 'url('+data.document_thumb_path+')'
            }
        }

        return(
            <div className="folder-col" onClick={()=>this.viewFile(data)}>
                <div className={"folder-item " + data.document_type + " " + imgClass + " " + isSelected} style={thumbIMg}>
                    <div className="inner-wrapper">
                        <div className="time-wrapper">
                            <p className="date-created">{data.document_updated_at.createdDate}</p>
                            <p className="time-created">{data.document_updated_at.createdTime}</p>
                        </div>
                        <div className="folder-title-holder">
                            <p className="folder-title">{data.document_name}</p>
                        </div>
                        <span className="item-type"></span>                        
                    </div>
                    {
                        (data.document_thumb_path)?
                            <span className="img-overlay"></span>
                        :
                            null
                    }
                </div>
                {
                    (this.state.loggedUser.id == data.document_user) ?
                        <i className="fa fa-minus doc-delete-btn" aria-hidden="true" onClick={()=>this.onShowConfirm(data.document_id)}></i> : null
                }

            </div>
        );
    }
}

export class FilePreview extends React.Component{
    constructor(props){
        super(props);

        this.state={
            fileData : this.props.uploadData
        }
    }

    render(){
        return(
            <div className="folder-col">
                <div className="folder-item pdf">
                    <div className="folder-title-holder">
                        <p className="folder-title">{this.state.fileData.name}</p>
                    </div>
                    <div className="upload-anime">
                        <i className="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
                    </div>
                </div>
            </div>
        );
    }
}

export class SharePopup extends React.Component{
    constructor(props) {
        super(props);
        this.state={
            loggedUser:Session.getSession('prg_lg'),
            sharedUsers:[],
            owner:{},
            seeAllSharedUsers:false,
            scrollProp: 'hidden',
            isShowingModal : false,
            userToRemove: null,
            sharedFilterValue: ''
        };

        this.sharedUsers = [];
        this.sharedUsersWithoutFilter = [];
        this.owner = {};
        this.loadSharedUsers();
        this.onPermissionChanged = this.onPermissionChanged.bind(this);
        this.onRemoveSharedUser = this.onRemoveSharedUser.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
        this.allSharedUsers = this.allSharedUsers.bind(this);
        this.getPopupRemoveUser = this.getPopupRemoveUser.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleClose = this.handleClose.bind(this);
    }

    handleScroll() {
        if(this.state.seeAllSharedUsers){
            this.setState({scrollProp : 'scroll'});
        }else{
            this.setState({scrollProp : 'hidden'});
        }
    }

    allSharedUsers(){
        this.setState({seeAllSharedUsers : true}, function (){
            this.handleScroll();
        });
    }

    loadSharedUsers() {
        $.ajax({
            url: '/folders/shared-users',
            method: "POST",
            dataType: "JSON",
            data:{folder_id:this.props.folderData.folder_id, filter_value:this.state.sharedFilterValue},
            headers: { 'prg-auth-header':this.state.loggedUser.token }
        }).done( function (data, text) {
            if(data.status.code == 200) {
                this.sharedUsers = data.sharedWith;
                this.sharedUsersWithoutFilter = data.sharedWith;
                this.owner = data.owner;
                this.setState({sharedUsers:data.sharedWith, owner:this.owner});
            }
        }.bind(this));


    }

    getSuggestions(value, data) {
        const escapedValue = Lib.escapeRegexCharacters(value.trim()); 
        if (escapedValue === '') { 
            return data; 
        } 
        const regex = new RegExp('^' + escapedValue, 'i'); 
        return data.filter(data => regex.test(data.first_name+" "+data.last_name));
     }

    filterSharedUsers(folder_id, event) {
        let value = event.target.value;
        var data = this.getSuggestions(value, this.sharedUsersWithoutFilter);
        this.setState({sharedUsers: data});
        this.setState({sharedFilterValue:value});

    }

    onPermissionChanged(e, user) {

        let _fieldValue = e.target.value;

        if(user.shared_type != _fieldValue) {
            $.ajax({
                url: '/folder/shared-permission/change',
                method: "POST",
                dataType: "JSON",
                data:{folder_id:user.folder_id, shared_type:_fieldValue, user_id:user.user_id},
                headers: { 'prg-auth-header':this.state.loggedUser.token }
            }).done(function (data, text) {
                if(data.status.code == 200) {
                    this.loadSharedUsers();
                }
            }.bind(this));
        }
    }

    onRemoveSharedUser() {
        let user = this.state.userToRemove;
        $.ajax({
            url: '/folder/shared-user/remove',
            method: "POST",
            dataType: "JSON",
            data:{folder_id:user.folder_id, user_id:user.user_id},
            headers: { 'prg-auth-header':this.state.loggedUser.token }
        }).done( function (data, text) {
            if(data.status.code == 200) {}
        }.bind(this));
    }

    handleClick(user) {
        this.setState({
            isShowingModal: true,
            userToRemove: user
        });
    }

    handleClose() {
        this.setState({isShowingModal: false});
    }

    getPopupRemoveUser(){
        let user = this.state.userToRemove;
        return(
            <div>
                {this.state.isShowingModal &&
                <ModalContainer onClose={this.handleClose.bind(this)} zIndex={9999}>
                    <ModalDialog onClose={this.handleClose.bind(this)} width="35%" style={{marginTop: "-100px"}}>
                        <div className="col-xs-12 shared-user-r-popup">
                            <p>Do you want to remove the shared user?</p>
                            <button className="btn btn-popup" onClick={this.onRemoveSharedUser.bind(this)}>Yes</button>
                            <button className="btn btn-popup reject">No</button>
                        </div>
                    </ModalDialog>
                </ModalContainer>
                }
            </div>
        )
    }

    render(){

        let _folderData = this.props.folderData;

        let i = (
            <Popover id="popover-contained" className="share-folder-popover add-new-user" style={{maxWidth: "280px", width: "280px", marginTop: "6.2%", marginLeft: "20%"}}>
                <SharePopupNewUsr  folderData={_folderData}/>
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
                                    <input className="form-control search-people" type="text" placeholder="Search" onChange={(event)=>this.filterSharedUsers(_folderData.folder_id, event)}/>
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
                                <img className="user-image img-circle" src={this.state.owner.profile_image} alt="User"/>
                                    <div className="name-wrapper">
                                        <p className="name">{this.state.owner.first_name} {this.state.owner.last_name}</p>
                                        {
                                            (typeof this.state.owner.school != 'undefined') ?
                                                <p className="name-title">{this.state.owner.school}</p>
                                                :
                                                <p className="name-title">{this.state.owner.company_name}</p>
                                        }
                                    </div>
                                    <div className="shared-privacy">
                                        <p className="owner">(Owner)</p>
                                    </div>
                            </div>
                            <SharedUsers folder={_folderData}
                                         sharedUserList={this.state.sharedUsers}
                                         changePermissions={this.onPermissionChanged.bind(this)}
                                         removeSharedUser={this.getPopupRemoveUser.bind(this)}
                                         handleClick={this.handleClick.bind(this)}
                                         scrollProp={this.state.scrollProp}/>
                        </div>
                    </section>
                    <section className="folder-footer">
                        <div className="footer-action-wrapper">
                            <div className="see-all">
                                {
                                    (!this.state.seeAllSharedUsers && this.state.sharedUsers.length > 2) ?
                                        <div onClick={this.allSharedUsers.bind(this)}>
                                            <i className="fa fa-chevron-circle-right" aria-hidden="true"></i>
                                            <p>See All</p>
                                        </div> : null
                                }

                            </div>
                            {
                                (_folderData.owned_by == 'me')?
                                    <OverlayTrigger container={this} trigger="click" placement="bottom" overlay={i}>
                                        <p className="add-people">
                                            <i className="fa fa-plus"></i> Add more
                                        </p>
                                    </OverlayTrigger> : null
                            }
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
        this.state={
            value: '',
            suggestions: [],
            addNewUserValue: '',
            isShowingModal: false,
            userToAdd: null
        };

        this.loadNewUsers = this.loadNewUsers.bind(this);
        this.shareFolder = this.shareFolder.bind(this);
        this._handleAddNewUser = this._handleAddNewUser.bind(this);
        this.getPopupAddUser = this.getPopupAddUser.bind(this);
        this.handleClose = this.handleClose.bind(this);
    }

    _handleAddNewUser (e){
        if (e.target.value == "") {
            this.setState({suggestions: []});
        }else{
            this.setState({
                addNewUserValue: e.target.value
            },function (){
                this.loadNewUsers();
            });            
        }
    }

    loadNewUsers() {
        let folder = this.props.folderData;
        let value = this.state.addNewUserValue;

        $.ajax({
            url: '/get-folder-users/'+folder.folder_id+'/'+value,
            method: "GET",
            dataType: "JSON",
            success: function (data, text) {
                if(data.status.code == 200){
                    //console.log(data.users)
                    this.setState({
                        suggestions: data.users
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

    shareFolder(user){

        let loggedUser = Session.getSession('prg_lg');
        let folder = this.props.folderData;
        let _folder = {
            folderId:folder.folder_id,
            userId:user.user_id
        };
        let sharedWithUsernames = [user.user_name];

        $.ajax({
            url: '/folders/share-folder',
            method: "POST",
            dataType: "JSON",
            data:_folder,
            headers: { 'prg-auth-header':loggedUser.token }
        }).done( function (data, text) {
            if(data.status.code == 200){

                let _notificationData = {
                    folder_id:data.folder_id,
                    notification_type:"share_folder",
                    notification_sender:loggedUser,
                    notification_receivers:sharedWithUsernames
                };

                Socket.sendFolderNotification(_notificationData);

                this.setState({
                    userToAdd: user,
                    isShowingModal: true
                }, function(){
                    this.getPopupAddUser();
                });
            }
        }.bind(this));

    }

    handleClose() {
        this.setState({isShowingModal: false});
    }

    getPopupAddUser(){
        let user = this.state.userToAdd;
        return(
            <div>
                {this.state.isShowingModal &&
                <ModalContainer onClose={this.handleClose.bind(this)} zIndex={9999}>
                    <ModalDialog onClose={this.handleClose.bind(this)} width="35%" style={{marginTop: "-100px"}}>
                        <div className="col-xs-12 shared-user-r-popup">
                            <p>{this.state.notebook} shared invitation send to {user.first_name} {user.last_name} successfully...</p>
                            <button className="btn btn-popup">Ok</button>
                        </div>
                    </ModalDialog>
                </ModalContainer>
                }
            </div>
        )
    }

    render() {

        const { value, suggestions } = this.state;
        let _this = this;

        let _newUserList = suggestions.map(function(suggestion,key){
            return(
                <div className="suggestions-wrapper" key={key}>
                    <div className="suggestion">
                        <img className="user-image img-circle" src={suggestion.images.profile_image.http_url} alt="User"/>

                        <div className="name-wrapper">
                            <p className="name">{suggestion.first_name} {suggestion.last_name}</p>
                        </div>
                        <div className="action" onClick={()=>_this.shareFolder(suggestion)}>
                            <i className="fa fa-plus" aria-hidden="true"></i>
                        </div>
                    </div>
                </div>
            )

        });

        return (
            <div className="popup-holder" >
                <section className="share-folder-add-people-popup">
                    <div className="input-wrapper">
                        <i className="fa fa-search"></i>
                        <input type="text" className="form-control" placeholder="Type name" onChange={this._handleAddNewUser}/>
                    </div>
                    {_newUserList}
                    {this.getPopupAddUser()}
                </section>
            </div>
        )

    }

}

export class  SharedUsers extends React.Component {
    constructor(props) {
        super(props);
        this.state={
            sharedUsers: this.props.sharedUserList
        }
    }

    render() {

        let _this = this;
        let _folder = this.props.folder;
        let _allUsers = this.props.sharedUserList.map(function(user,key){

            return (
                <div key={key}>
                    {
                        (user.shared_status == 3) ?
                            <div className="shared-user" key={key}>
                                <img className="user-image img-circle" src={user.profile_image} alt="User"/>
                                <div className="name-wrapper">
                                    <p className="name">{user.first_name} {user.last_name}</p>
                                    {
                                        (typeof user.school != 'undefined') ?
                                            <p className="name-title">{user.school}</p>
                                            :
                                            <p className="name-title">{user.company_name}</p>
                                    }
                                </div>
                                {
                                    (_folder.owned_by == 'me')?
                                        <div className="share-opt-holder clearfix">
                                            <div className="shared-privacy">
                                                <select className="privacy-selector" onChange={(event)=>_this.props.changePermissions(event, user)} value={user.shared_type}>
                                                    <option value="1">View Only</option>
                                                    <option value="2">View/Upload</option>
                                                </select>
                                            </div>
                                            <div className="action" onClick={()=>_this.props.handleClick(user)}>
                                                    <i className="fa fa-minus" aria-hidden="true"></i>
                                            </div>
                                            {_this.props.removeSharedUser()}
                                        </div>
                                        : null
                                }
                            </div> :
                            <div className="shared-user" key={key}>
                                <img className="user-image img-circle" src={user.profile_image} alt="User"/>
                                <div className="name-wrapper">
                                    <p className="name">{user.first_name} {user.last_name}</p>
                                    {
                                        (typeof user.school != 'undefined') ?
                                            <p className="name-title">{user.school}</p>
                                            :
                                            <p className="name-title">{user.company_name}</p>
                                    }
                                </div>
                                {
                                    (_folder.owned_by == 'me')?
                                        <div className="share-opt-holder clearfix">
                                            <div className="shared-privacy">
                                                <p className="pending">Request Pending</p>
                                            </div>
                                            <div className="action" onClick={()=>_this.props.handleClick(user)}>
                                                    <i className="fa fa-minus" aria-hidden="true"></i>
                                            </div>
                                            {_this.props.removeSharedUser()}
                                        </div>
                                        : null
                                }
                            </div>
                    }
                    </div>
            )
        });

        return (
            <div className="shared-users-container" style={{overflowY: this.props.scrollProp, overflowX: 'hidden', maxHeight: '155px'}}>
                {_allUsers}
            </div>
        )
    }
}
