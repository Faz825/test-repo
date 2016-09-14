/**
 * This is notes index class that handle all
 */
import React from 'react';
import ReactDom from 'react-dom';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import Session from '../../middleware/Session';
import {Alert} from '../../config/Alert';
import { Scrollbars } from 'react-custom-scrollbars';
import Lib    from '../../middleware/Lib';
import RichTextEditor from '../../components/elements/RichTextEditor';
import { Popover, OverlayTrigger } from 'react-bootstrap';
import Socket  from '../../middleware/Socket';

let errorStyles = {
    color         : "#ed0909",
    fontSize      : "0.8em",
    textTransform : "capitalize",
    margin        : '0 0 15px',
    display       : "inline-block"
};

export default class Index extends React.Component {
    constructor(props) {
        super(props);
        if(Session.getSession('prg_lg') == null){
            window.location.href = "/";
        }
        this.state={
            isShowingModal : false,
            catColor : "",
            catNameValue : "",
            isDefault : 0,
            clrChosen : "",
            validateAlert : "",
            notes:[],
            showConfirm:false,
            deleteNoteId:0,
            isShowingNoteModal:false,
            notebookId:0,
            editNoteId:0,
            editNoteTitle:"Note Title",
            editNote:"",
            isAutoTitled: false,
            staticNoteTitle:"",
            staticNote:"",
            noteAddEdit:0, // 1 - add, 2 - edit
            notebookObj: null
        };
        this.saveInterval = null;
        this.elementChangeHandler = this.elementChangeHandler.bind(this);
        this.addNoteBook = this.addNoteBook.bind(this);
        this.addDefaultNoteBook = this.addDefaultNoteBook.bind(this);
        this.colorPicker = this.colorPicker.bind(this);
        this.getNoteData = this.getNoteData.bind(this);
        this.closeNotePopup = this.closeNotePopup.bind(this);
        this.onTitleEdit = this.onTitleEdit.bind(this);
        this.loadNotes();
    }

    loadNotes(){

        let loggedUser = Session.getSession('prg_lg');

        $.ajax({
            url: '/notes/get-notes',
            method: "GET",
            dataType: "JSON",
            headers: { 'prg-auth-header':loggedUser.token }
        }).done( function (data, text) {
            console.log(data);
            if(data.status.code == 200){
                if(data.notes.length == 0 || data.notes[0] == null){
                    this.setState({catNameValue: "My Notes"});
                    this.setState({catColor: "#0272ae"});
                    this.setState({isDefault: 1});
                    this.addDefaultNoteBook();
                } else{
                    let notebooks = data.notes;
                    // let myNoteBook = notebooks[notebooks.length - 1];
                    // notebooks.pop();
                    // notebooks.splice(0,0,myNoteBook);
                    this.setState({notes: notebooks});
                }
            }
        }.bind(this));

    }

    handleClick() {
        this.setState({isShowingModal: true});
    }

    handleClose() {
        this.setState({catNameValue: ""});
        this.setState({catColor: ""});
        this.setState({isDefault: 0});
        this.setState({validateAlert:""});
        this.setState({isShowingModal: false});
    }

    elementChangeHandler(key,data,status){
        this.setState({catName : data});
    }

    addNoteBook(){

        if(this.state.catNameValue == ""){
            this.setState({validateAlert:Alert.EMPTY_NOTEBOOK_NAME})
        } else if(this.state.catColor == ""){
            this.setState({validateAlert:Alert.INVALID_COLOR})
        } else if(this.state.catNameValue == "My Notes"){
            this.setState({validateAlert:Alert.NOTEBOOK_NAME_ERROR})
        } else{
            let _noteBook = {
                notebookName:this.state.catNameValue,
                notebookColor:this.state.catColor,
                isDefault:this.state.isDefault
            };

            let loggedUser = Session.getSession('prg_lg');

            $.ajax({
                url: '/notes/add-notebook',
                method: "POST",
                dataType: "JSON",
                data:_noteBook,
                headers: { 'prg-auth-header':loggedUser.token }
            }).done( function (data, text) {
                if(data.code == 200){
                    this.loadNotes();
                    this.setState({catNameValue: ""});
                    this.setState({catColor: ""});
                    this.setState({isDefault: 0});
                    this.setState({validateAlert:""});
                    this.setState({isShowingModal: false});
                }
            }.bind(this));
        }

    }

    addDefaultNoteBook(){

        let _noteBook = {
            notebookName:this.state.catNameValue,
            notebookColor:this.state.catColor,
            isDefault:this.state.isDefault
        };

        let loggedUser = Session.getSession('prg_lg');

        $.ajax({
            url: '/notes/add-notebook',
            method: "POST",
            dataType: "JSON",
            data:_noteBook,
            headers: { 'prg-auth-header':loggedUser.token }
        }).done( function (data, text) {
            if(data.code == 200){
                this.loadNotes();
                this.setState({catNameValue: ""});
                this.setState({catColor: ""});
                this.setState({isDefault: 0});
                this.setState({validateAlert:""});
                this.setState({isShowingModal: false});
            }
        }.bind(this));

    }

    colorPicker(e){
        let colorName = e.target.getAttribute('data-name');
        this.setState({catColor : e.target.id, clrChosen : colorName});
    }

    handleChange(event) {
        this.setState({catNameValue: event.target.value});
    }

    isActive(value){
        return 'color '+((value===this.state.clrChosen) ? value+' active': value);
    }

    getPopup(){
        let clrActive = this.state.clrChosen;
        return(
            <div onClick={this.handleClick.bind(this)}>
                {this.state.isShowingModal &&
                <ModalContainer onClose={this.handleClose.bind(this)} zIndex={9999}>
                    <ModalDialog onClose={this.handleClose.bind(this)} width="50%" style={{marginTop : "-100px"}}>
                        <h3>Create a new note category.</h3>
                        <div className="col-xs-12">
                            <p>Category Name</p>
                            <input
                                type="text"
                                value={this.state.catNameValue}
                                name="NoteCategoryName"
                                onChange={this.handleChange.bind(this)}
                                className="pgs-sign-inputs"
                                />
                        </div>
                        <div className="color-picker">
                            <span className={this.isActive('tone-one')} id="#5EBDAA" data-name="tone-one" onClick={this.colorPicker.bind(this)}></span>
                            <span className={this.isActive('tone-two')} id="#F1C058" data-name="tone-two" onClick={this.colorPicker.bind(this)}></span>
                            <span className={this.isActive('tone-three')} id="#F15858" data-name="tone-three" onClick={this.colorPicker.bind(this)}></span>
                            <span className={this.isActive('tone-four')} id="#202024" data-name="tone-four" onClick={this.colorPicker.bind(this)}></span>
                            <span className={this.isActive('tone-five')} id="#8758F1" data-name="tone-five" onClick={this.colorPicker.bind(this)}></span>
                            <span className={this.isActive('tone-six')} id="#8F7C68" data-name="tone-six" onClick={this.colorPicker.bind(this)}></span>
                        </div>
                        {this.state.validateAlert ? <p className="form-validation-alert" style={errorStyles} >{this.state.validateAlert}</p> : null}
                        <p className="add-note-cat btn" onClick={this.addNoteBook.bind(this)}>Add note category</p>
                    </ModalDialog>
                </ModalContainer>
                }
            </div>
        )
    }

    getConfirmationPopup(){
        return(
            <div>
                {this.state.showConfirm &&
                <ModalContainer zIndex={9999}>
                    <ModalDialog width="30%" style={{marginTop : "-100px"}}>
                        <div className="col-xs-12">
                            <p className="confirmation_p">Are you sure to delete this note?</p>
                        </div>
                        <p className="add-note-cat btn" onClick={this.deleteNote.bind(this)}>Yes</p>
                        <p className="add-note-cat confirm-no btn" onClick={this.closeConfirmPopup.bind(this)}>No</p>
                    </ModalDialog>
                </ModalContainer>
                }
            </div>
        );
    }

    showConfirm(note_id){
        this.setState({showConfirm:true, deleteNoteId:note_id})
    }

    closeConfirmPopup(){
        this.setState({showConfirm:false, deleteNoteId:0})
    }

    deleteNote(){
        let loggedUser = Session.getSession('prg_lg');
        $.ajax({
            url: '/notes/delete-note',
            method: "POST",
            dataType: "JSON",
            data:{noteId:this.state.deleteNoteId},
            headers: { 'prg-auth-header':loggedUser.token }
        }).done( function (data, text) {
            if(data.code == 200){
                this.loadNotes();
                this.setState({showConfirm:false, deleteNoteId:0})
            }
        }.bind(this));
    }

    showNotePopup(notebook_id, note, notebook_obj){

        let _this = this;

        if(note == null){
            this.setState({isShowingNoteModal:true, notebookId:notebook_id, noteAddEdit:1, editNoteTitle : "Note Title", editNote : "", notebookObj:notebook_obj, isAutoTitled:true});
            this.saveInterval = setInterval(function(){_this.saveNote()}, 1000);
        } else{
            let editNoteId = note.note_id;
            let editNoteTitle = note.note_name;
            let editNote = note.note_content;
            this.setState({isShowingNoteModal:true, noteAddEdit:2, editNoteId:editNoteId, editNoteTitle:editNoteTitle, editNote:editNote, staticNoteTitle:editNoteTitle, staticNote:editNote, notebookObj:notebook_obj});
            this.saveInterval = setInterval(function(){_this.saveNote()}, 1000);
        }

    }

    onTitleEdit(e){
        let noteText = e.target.value;
        if (noteText == "") {
            let noteContent = this.state.editNote.replace(/(<([^>]+)>)/ig,"");
            if (noteContent.length > 1) {
                noteText = noteContent.slice(0,30);
            }else{
                noteText = "Note Title";
            }
        }
        this.setState({editNoteTitle : noteText, isAutoTitled: false});
    }

    getNoteData(value){
        this.setState({editNote : value});
    }

    closeNotePopup(){
        this.saveNote();
        clearInterval(this.saveInterval);
        this.loadNotes();
        this.setState({isShowingNoteModal: false, noteAddEdit:0, editNoteId:0, editNoteTitle:"", editNote:"", staticNoteTitle:"", staticNote:"", notebookId:0});

    }

    saveNote(){
        let _this = this;
        let _notes_read_write = 2;
        let noteTitle = this.state.editNoteTitle;
        if(noteTitle == "Note Title"){
            let noteContent = this.state.editNote.replace(/(<([^>]+)>)/ig,"");
            if (noteContent.length > 1) {
                noteTitle = noteContent.slice(0,12);
            }else{
                noteTitle = "Note Title";
            }
        }else if(this.state.isAutoTitled){
            let noteContent = this.state.editNote.replace(/(<([^>]+)>)/ig,"");
            if (noteContent.length > 1) {
                noteTitle = noteContent.slice(0,12);
            }else{
                noteTitle = "Note Title";
            }
        }
        this.setState({editNoteTitle : noteTitle});

        if(noteTitle != this.state.staticNoteTitle || this.state.editNote != this.state.staticNote){
            if(this.state.noteAddEdit == 1){
                clearInterval(this.saveInterval);

                let _note = {
                    noteName:noteTitle,
                    noteContent:this.state.editNote,
                    notebookId:this.state.notebookId
                };

                let loggedUser = Session.getSession('prg_lg');

                $.ajax({
                    url: '/notes/add-note',
                    method: "POST",
                    dataType: "JSON",
                    data:_note,
                    headers: { 'prg-auth-header':loggedUser.token }
                }).done( function (data, text) {
                    this.setState({noteAddEdit:2, editNoteId:data.note._id, editNoteTitle:data.note.name, editNote:data.note.content, staticNoteTitle:data.note.name, staticNote:data.note.content});
                    this.saveInterval = setInterval(function(){_this.saveNote()}, 1000);
                }.bind(this));
            } else if(this.state.noteAddEdit == 2){
                if(this.state.notebookObj == null) {
                    let _note = {
                        noteName: noteTitle,
                        noteContent: this.state.editNote,
                        noteId: this.state.editNoteId
                    };

                    let loggedUser = Session.getSession('prg_lg');

                    $.ajax({
                        url: '/notes/update-note',
                        method: "POST",
                        dataType: "JSON",
                        data: _note,
                        headers: {'prg-auth-header': loggedUser.token}
                    }).done(function (data, text) {
                    }.bind(this));
                }else if(this.state.notebookObj.shared_privacy == _notes_read_write){
                    let _note = {
                        noteName: noteTitle,
                        noteContent: this.state.editNote,
                        noteId: this.state.editNoteId
                    };

                    let loggedUser = Session.getSession('prg_lg');

                    $.ajax({
                        url: '/notes/update-note',
                        method: "POST",
                        dataType: "JSON",
                        data: _note,
                        headers: {'prg-auth-header': loggedUser.token}
                    }).done(function (data, text) {
                    }.bind(this));
                }
            }
        }

    }

    getNotePopup(){
        let _notes_read_write = 2;
        return(
            <div>
                {this.state.isShowingNoteModal &&
                <ModalContainer zIndex={9999} >
                    <ModalDialog width="50%" className="note-popup" style={{padding : "0", borderRadius : "3px" , transform : "none"}}>
                        <div className="editor-popup-holder">
                            <div className="popup-header">
                                <span className="closeBtn" onClick={this.closeNotePopup.bind(this)}></span>
                                <div className="title-holder col-sm-8">
                                    <input type="text" className="note-title" value={this.state.editNoteTitle} onChange={(event)=>{this.onTitleEdit(event)}}/>
                                </div>
                                <div className="extra-func col-sm-4">
                                    <input type="text" placeholder="Search" name="search" className="form-control" />
                                    <div className="extra-func-btns">
                                        <span className="export-btn"></span>
                                        <span className="email-btn"></span>
                                    </div>
                                </div>
                            </div>
                            <Scrollbars style={{ height: 420 }}>
                                <RichTextEditor note={this.state.editNote} noteText={this.getNoteData} />
                            </Scrollbars>
                            {
                                (this.state.notebookObj == null) ?
                                    <button className="btn btn-default" onClick={this.closeNotePopup.bind(this)}>Save note</button> :
                                (this.state.notebookObj.shared_privacy == _notes_read_write) ?
                                    <button className="btn btn-default" onClick={this.closeNotePopup.bind(this)}>Save note</button> :
                                    <button className="btn btn-read-only" onClick={this.closeNotePopup.bind(this)}>Read Only Access</button>
                            }
                        </div>
                    </ModalDialog>
                </ModalContainer>
                }
            </div>
        )
    }

    render() {
        return (
            <div className="notesCatHolder container-fluid">
                <div className="row row-clr pg-notes-page-content">
                    <div className="row row-clr pg-notes-page-header">
                        <div className="col-xs-10 col-xs-offset-1">
                            <div className="row">
                                <div className="col-xs-6">
                                    <h2 className="pg-connections-page-header-title">Notes</h2>
                                </div>
                                <div className="col-xs-6">
                                    <p className="add-category-btn" onClick={this.handleClick.bind(this)}>Create Notebook</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {
                        (this.state.notes.length>0)?<NoteCategory notebooks={this.state.notes} showConfirm={this.showConfirm.bind(this)} showNotePopup={this.showNotePopup.bind(this)}
                            onLoadNotes={this.loadNotes.bind(this)}/>:null
                    }
                    {this.getPopup()}
                    {this.getConfirmationPopup()}
                    {this.getNotePopup()}
                </div>
            </div>
        );
    }
}

export class NoteCategory extends React.Component{
    constructor(props) {
        super(props);

        this.handleClick = e => {
            console.log(e.target);
            this.setState({ target: e.target, show: !this.state.show });
        };

        this.state = {
            show: false ,
            sharedStatus: false
        };

        this.userAdded = this.userAdded.bind(this);

    }

    userAdded(){
        this.setState({
            sharedStatus: true
        });
    }

    render() {
        let _this = this;
        let notebooks = this.props.notebooks;
        let showConfirm = this.props.showConfirm;
        let showNotePopup = this.props.showNotePopup;
        if (notebooks.length <= 0) {
            return <div />
        }
        let i = 0;

        let _noteBooks = notebooks.map(function(notebook,key){
            let i = (
                <Popover id="popover-contained"  positionTop="150px" className="popup-holder">
                    <SharePopup notebook={notebook} onUserAdd={_this.userAdded} onLoadNotes={_this.props.onLoadNotes}/>
                </Popover>
            );
            return (
                <div className="row row-clr pg-notes-page-content-item pg-box-shadow" key={key}>
                    <div className={notebook.notebook_name == "My Notes" ? "col-xs-2 note-cat-thumb my-notebook" : "col-xs-2 note-cat-thumb"} style={{backgroundColor : notebook.notebook_color}}>
                        <div className="cat-icon-holder">
                            <span className="cat-icon"></span>
                            <h3 className="cat-title">{notebook.notebook_name}</h3>
                        </div>
                        {
                            (notebook.notebook_name != "My Notes")?
                            <OverlayTrigger rootClose container={this} trigger="click" placement="right" overlay={i}>
                                {
                                    (notebook.is_shared) ?
                                        <span className="share-icon"><i className="fa fa-users"></i></span> :
                                        <span className="share-icon"><i className="fa fa-share-alt"></i></span>
                                }
                            </OverlayTrigger>
                            :
                            null
                        }
                    </div>
                    <div className="col-xs-10 pg-notes-page-content-item-right-thumbs">
                        <NoteThumb noteBook={notebook} catData={notebook.notes} catID={notebook.notebook_id} showConfirm={showConfirm} showNotePopup={showNotePopup}/>
                    </div>
                </div>
            );
        });

        return (
            <div className="col-xs-10 col-xs-offset-1">
                {_noteBooks}
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
            seeAllSharedUsers:false,
            scrollProp: 'hidden'
        }
        this.sharedUsers = [];
        this.loadSharedUsers();
        this.onPermissionChanged = this.onPermissionChanged.bind(this);
        this.onRemoveSharedUser = this.onRemoveSharedUser.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
        this.allSharedUsers = this.allSharedUsers.bind(this);
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
        console.log("now getting shared users - - ");
        $.ajax({
            url: '/notebook/shared-users',
            method: "POST",
            dataType: "JSON",
            data:{notebook_id:this.props.notebook.notebook_id},
            headers: { 'prg-auth-header':this.state.loggedUser.token }
        }).done( function (data, text) {
            if(data.status.code == 200) {
                this.sharedUsers = data.results;
                this.setState({sharedUsers:data.results});
            }
        }.bind(this));


    }

    filterSharedUsers(notebook_id, event) {

        let value = event.target.value;

        if(value.length >= 1){
            $.ajax({
                url: '/filter-shared-users/'+notebook_id+'/'+value,
                method: "GET",
                dataType: "JSON",
                success: function (data, text) {
                    if(data.status.code == 200){
                        this.setState({
                            sharedUsers: data.users
                        });
                    }
                }.bind(this),
                error: function (request, status, error) {
                    console.log(request.responseText);
                    console.log(status);
                    console.log(error);
                }.bind(this)
            });
        }else{
            this.loadSharedUsers();
        }
    }

    onPermissionChanged(e, user) {

        let _fieldValue = e.target.value;

        console.log(user);
        console.log(_fieldValue);

        if(user.shared_type != _fieldValue) {
            $.ajax({
                url: '/notebook/shared-permission/change',
                method: "POST",
                dataType: "JSON",
                data:{notebook_id:user.notebook_id, shared_type:_fieldValue, user_id:user.user_id},
                headers: { 'prg-auth-header':this.state.loggedUser.token }
            }).done(function (data, text) {
                if(data.status.code == 200) {
                    console.log("done updating permissions -----");
                    this.loadSharedUsers();
                }
            }.bind(this));
        }
    }

    onRemoveSharedUser(user) {
        console.log("about to remove shared user ---");
        console.log(user);

        $.ajax({
            url: '/notebook/shared-user/remove',
            method: "POST",
            dataType: "JSON",
            data:{notebook_id:user.notebook_id, user_id:user.user_id},
            headers: { 'prg-auth-header':this.state.loggedUser.token }
        }).done( function (data, text) {
            if(data.status.code == 200) {
                console.log("done removing shared user -----");
                if(data.update_status) {
                    this.props.onLoadNotes();
                    this.loadSharedUsers();
                }
            }
        }.bind(this));
    }

    render(){

        let _notebook = this.props.notebook;

        let i = (
            <Popover id="popover-contained"  positionTop="150px" className="popup-holder add-new">
                <SharePopupNewUsr notebook={_notebook} onShareuser={this.props.onUserAdd} onLoadNotes={this.props.onLoadNotes}/>
            </Popover>
        );

        return(
            <div className="share-popup-holder">
                <div className="header-holder clearfix">
                    <h3 className="title">People on this note book</h3>
                    <div className="form-group">
                        <input type="text" className="form-control" placeholder="Search.." id="search" onChange={(event)=>this.filterSharedUsers(_notebook.notebook_id, event)}/>
                    </div>
                </div>
                <div className="popup-body-holder">

                    {
                        (_notebook.owned_by == 'me')?
                            <div className="user-block clearfix">
                                <div className="img-holder">
                                    <img src={this.state.loggedUser.profile_image} alt="User"/>
                                </div>
                                <div className="user-details">
                                    <h3 className="user-name">{this.state.loggedUser.first_name} {this.state.loggedUser.last_name}</h3>
                                </div>
                                <div className="permission owner">
                                    <p>(Owner)</p>
                                </div>
                            </div> :
                            <div className="user-block clearfix">
                                <div className="img-holder">
                                    <img src={_notebook.notebook_user.profile_image} alt="User"/>
                                </div>
                                <div className="user-details">
                                    <h3 className="user-name">{_notebook.notebook_user.user_name}</h3>
                                </div>
                                <div className="permission owner">
                                    <p>(Owner)</p>
                                </div>
                            </div>
                    }

                    {/*<Scrollbars style={{ height: 75 }}>*/}
                        <SharedUsers notebook={_notebook}
                                     sharedUserList={this.state.sharedUsers}
                                     changePermissions={this.onPermissionChanged.bind(this)}
                                     removeSharedUser={this.onRemoveSharedUser.bind(this)}
                                     scrollProp={this.state.scrollProp}/>
                    {/*</Scrollbars>*/}

                </div>
                <div className="footer-holder clearfix">
                    {
                        (_notebook.owned_by == 'me')?
                        <div className="add-new">
                            <OverlayTrigger container={this} trigger="click" placement="bottom" overlay={i}>
                                <button className="btn-link">Add New</button>
                            </OverlayTrigger>
                        </div> : null
                    }
                    <div className="see-all">
                        <button className="btn-link" onClick={this.allSharedUsers.bind(this)}>See All</button>
                    </div>
                </div>
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
            addNewUserValue: ''
        };

        this.loadNewUsers = this.loadNewUsers.bind(this);
        this.shareNote = this.shareNote.bind(this);
        this._handleAddNewUser = this._handleAddNewUser.bind(this);
    }

    _handleAddNewUser (e){
        this.state.addNewUserValue = e.target.value;
        this.loadNewUsers();
    }

    loadNewUsers() {
        let notebook = this.props.notebook;
        let value = this.state.addNewUserValue;
        if(value.length >= 1){
            $.ajax({
                url: '/get-connected-users/'+notebook.notebook_id+'/'+value,
                method: "GET",
                dataType: "JSON",
                success: function (data, text) {
                    if(data.status.code == 200){
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
        }else{
            this.setState({
                suggestions: []
            });
        }
    }

    shareNote(user){

        let loggedUser = Session.getSession('prg_lg');
        let notebook = this.props.notebook;
        let _noteBook = {
            noteBookId:notebook.notebook_id,
            userId:user.user_id
        };

        $.ajax({
            url: '/notes/share-notebook',
            method: "POST",
            dataType: "JSON",
            data:_noteBook,
            headers: { 'prg-auth-header':loggedUser.token }
        }).done( function (data, text) {
            if(data.status.code == 200){

                let _notificationData = {
                    notebook_id:notebook.notebook_id,
                    notification_type:"share_notebook",
                    notification_sender:loggedUser,
                    notification_receiver:user.user_name
                };

                Socket.sendNotebookNotification(_notificationData);

                this.loadNewUsers();
                this.props.onLoadNotes();
                this.props.onShareuser();
            }
        }.bind(this));

    }

    render() {

        const { value, suggestions } = this.state;
        let _this = this;

        let _suggestions = suggestions.map(function(suggestion,key){
            if(suggestions.length <= 0){
                return <div/>
            }
            return(
                <div className="user-block clearfix" key={key}>
                    <div className="img-holder">
                        <img src={suggestion.images.profile_image.http_url} alt="User"/>
                    </div>
                    <div className="user-details">
                        <h3 className="user-name">{suggestion.first_name} {suggestion.last_name}</h3>
                    </div>
                    <div className="action">
                        <button className="btn-add" onClick={()=>_this.shareNote(suggestion)}>
                            <i className="fa fa-plus" aria-hidden="true"></i>
                        </button>
                    </div>
                    <div className="separator"></div>
                </div>
            );
        });

        return (
            <div>
                <div className="share-popup-holder">
                    <div className="header-holder clearfix">
                        <div className="form-group">
                            <input type="text" className="form-control" placeholder="Type Name to Add" id="type-to-add" value={this.state.addNewUserValue} onChange={this._handleAddNewUser}/>
                        </div>
                    </div>

                    <div className="popup-body-holder add-new">
                    {_suggestions}
                    </div>

                </div>
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

        console.log("in SharedUsers rendering-----");
        console.log(this.state.sharedUsers);
        console.log(this.props.sharedUserList);
        let _this = this;
        let _notebook = this.props.notebook;
        let _allUsers = this.props.sharedUserList.map(function(user,key){

            return (
                <div className="user-block shared clearfix" key={key}>
                    <div className="separator"></div>
                    <div className="img-holder">
                        <img src={user.profile_image} alt="User"/>
                    </div>
                    <div className="user-details">
                        <h3 className="user-name shared">{user.user_name}</h3>
                        <p className="more-info shared">University of California, Berkeley</p>
                    </div>
                    {
                        (_notebook.owned_by == 'me')?
                        <div>
                            <div className="action">
                                <button className="btn-remove" onClick={()=>_this.props.removeSharedUser(user)}>
                                    <i className="fa fa-minus" aria-hidden="true"></i>
                                </button>
                            </div>
                            < div className="permission">
                            <select className="pg-custom-input" onChange={(event)=>_this.props.changePermissions(event, user)} value={user.shared_type}>
                                <option value="1">Read Only</option>
                                <option value="2">Read/Write</option>
                            </select>
                            </div>
                        </div> : null
                    }
                </div>
            )
        });

        return (
            <div className="shared-users-container" style={{overflowY: this.props.scrollProp}}>
                {_allUsers}
            </div>
        )
    }
}

export class NoteThumb extends React.Component{

    constructor(props) {
        super(props);
        this.state={
            allNotesAreVisible: false
        }
    }

    addNewNote(notebook_id){
        this.props.showNotePopup(notebook_id,null, null);
    }

    editNote(notebook_id, note, notebook_obj){
        this.props.showNotePopup(notebook_id,note, notebook_obj);
    }

    showConfirm(note_id){
        this.props.showConfirm(note_id);
    }

    showMoreNotes(){
        let visibilityState = this.state.allNotesAreVisible;
        this.setState({allNotesAreVisible : !visibilityState});
    }

    render(){

        let _this = this;
        let _notebook_props = this.props.noteBook;
        let _notes = this.props.catData;
        let _notebook = this.props.catID;

        let _notes_read_write = 2;

        let _firstSetNotes = _notes.map(function(note,key){
            let name = note.note_name;
            if (name.length > 30) {
                name = name.substring(0,30)+'...';
            }
            if(key < 4) {
                return (
                    <div className="note-holder" id={note.note_id} key={key}>
                        <div className="row-clear note">
                            <a href="javascript:void(0)" onClick={()=>_this.editNote(_notebook,note,_notebook_props)}>
                                <div className="time-wrapper">
                                    <p className="date-created">{note.updated_at.createdDate}</p>

                                    <p className="time-created">{note.updated_at.createdTime}</p>
                                </div>
                                <div className="note-title-holder">
                                    <p className="note-title">{name}</p>
                                </div>
                            </a>
                            <span className="note-delete-btn" onClick={()=>_this.showConfirm(note.note_id)}></span>

                        </div>
                    </div>
                )
            }
        });

        let _allNotes = _notes.map(function(note,key){
            let name = note.note_name;
            if (name.length > 30) {
                name = name.substring(0,30)+'...';
            }
            if(key >= 4) {
                return (
                    <div className="note-holder" id={note.note_id} key={key}>
                        <div className="row-clear note">
                            <a href="javascript:void(0)" onClick={()=>_this.editNote(_notebook,note,_notebook_props)}>
                                <div className="time-wrapper">
                                    <p className="date-created">{note.updated_at.createdDate}</p>

                                    <p className="time-created">{note.updated_at.createdTime}</p>
                                </div>
                                <div className="note-title-holder">
                                    <p className="note-title">{name}</p>
                                </div>
                            </a>
                            <span className="note-delete-btn" onClick={()=>_this.showConfirm(note.note_id)}></span>

                        </div>
                    </div>
                )
            }
        });

        return(
            <div className="pg-notes-item-main-row">
                <div className="note-thumb-wrapper">
                    {
                        (_notebook_props.shared_privacy == _notes_read_write)? <div className="note-holder">
                            <div className="row-clear add-new-note note">
                                <a href="javascript:void(0)" onClick={()=>_this.addNewNote(_notebook)}><p className="add-note-text">Add new</p></a>
                            </div>
                        </div>:null
                    }
                    {_firstSetNotes}
                    {
                        (this.state.allNotesAreVisible)? _allNotes : null
                    }

                </div>
                {(_notes.length > 4) ? <div className="show-more-btn" onClick={this.showMoreNotes.bind(this)}>{this.state.allNotesAreVisible? "Show Less" : "Show More"}</div> : null}
            </div>
        )

    }

}
