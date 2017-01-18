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
import FolderList from './FoldersList';


export default class Index extends React.Component{
    constructor(props){
        super(props);

        if(Session.getSession('prg_lg') == null){
            window.location.href = "/";
        }

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
                console.log(folders);
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
                    isDefault: 1,
                    folder_type:0
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
                data:{folder_name:this.state.CFName, folder_color:this.state.CFColor, shared_with:this.state.sharedWithIds, folder_type:0},
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
                    <ModalDialog onClose={this.handleClose.bind(this)} className="modalPopup" width="575px">
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
                <FolderList key={key} folderData={folder} folderCount={key} onLoadFolders={_this.loadFolders.bind(this)} />
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

