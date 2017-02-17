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
import NoteCategory from './NoteCategory';

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
            notebookObj: null,
            loggedUser:Session.getSession('prg_lg'),
            noteOwnerProfileImage: null,
            noteOwner: null,
            noteCreatedTime: null
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

        if(this.state.catNameValue == ""){
            return;
        }

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
                    <ModalDialog onClose={this.handleClose.bind(this)} className="create-notebook modalPopup" width="438px">
                        <div className="popup-holder">
                            <section className="create-notebook-popup">
                                <section className="notebook-header">
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <h2>Create New Notebook</h2>
                                        </div>
                                    </div>
                                </section>
                                <section className="notebook-body clearfix">
                                    <div className="notebook-name">
                                        <div className="col-sm-12 input-group name-holder">
                                            <p>Name your notebook</p>
                                            <input type="text" className="form-control" placeholder="Type a category name..." value={this.state.catNameValue}
                                                   name="NoteCategoryName"
                                                   onChange={this.handleChange.bind(this)}/>
                                        </div>
                                    </div>
                                    <div className="notebook-color">
                                        <div className="col-sm-12 input-group">
                                            <p>Choose a colour</p>
                                            <div className="color-palette">
                                                <div className={this.isActive('dark-green')} id="#038247" data-name="dark-green" onClick={this.colorPicker.bind(this)}>
                                                    <i className="fa fa-check" aria-hidden="true"></i>
                                                </div>
                                                <div className={this.isActive('dark-blue')} id="#000f75" data-name="dark-blue" onClick={this.colorPicker.bind(this)}>
                                                    <i className="fa fa-check" aria-hidden="true"></i>
                                                </div>
                                                <div className={this.isActive('red')} id="#b21e53" data-name="red" onClick={this.colorPicker.bind(this)}>
                                                    <i className="fa fa-check" aria-hidden="true"></i>
                                                </div>
                                                <div className={this.isActive('black')} id="#000000" data-name="black" onClick={this.colorPicker.bind(this)}>
                                                    <i className="fa fa-check" aria-hidden="true"></i>
                                                </div>
                                                <div className={this.isActive('light-green')} id="#a6c74a" data-name="light-green" onClick={this.colorPicker.bind(this)}>
                                                    <i className="fa fa-check" aria-hidden="true"></i>
                                                </div>
                                                <div className={this.isActive('light-blue')} id="#00a6ef" data-name="light-blue" onClick={this.colorPicker.bind(this)}>
                                                    <i className="fa fa-check" aria-hidden="true"></i>
                                                </div>
                                                <div className={this.isActive('pink')} id="#ed1e7a" data-name="pink" onClick={this.colorPicker.bind(this)}>
                                                    <i className="fa fa-check" aria-hidden="true"></i>
                                                </div>
                                                <div className={this.isActive('gray')} id="#bebfbf" data-name="gray" onClick={this.colorPicker.bind(this)}>
                                                    <i className="fa fa-check" aria-hidden="true"></i>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="invite-people">
                                        <div className="col-sm-12 input-group">
                                            <p>Invite some people</p>
                                            <input type="text" className="form-control" placeholder="Type a name..."/>
                                                <div className="user-holder"></div>
                                        </div>
                                    </div>
                                </section>
                                <section className="notebook-footer">
                                    <div className="action-bar">
                                        <button className="btn btn-add-notebook" onClick={this.addNoteBook.bind(this)}>create notebook</button>
                                    </div>
                                </section>
                            </section>
                        </div>
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
        console.log(this.state.loggedUser);

        if(note == null){

            let now = new Date();

            this.setState({isShowingNoteModal:true, notebookId:notebook_id, noteAddEdit:1,
                editNoteTitle : "Note Title", editNote : "", notebookObj:notebook_obj, isAutoTitled:true,
                noteOwnerProfileImage: this.state.loggedUser.profile_image,
                noteOwner: this.state.loggedUser.first_name + " " + this.state.loggedUser.last_name,
                noteCreatedTime: Lib.timeAgo(now)
            });
            this.saveInterval = setInterval(function(){_this.saveNote()}, 1000);
        } else{
            console.log(note);
            let editNoteId = note.note_id;
            let editNoteTitle = note.note_name;
            let editNote = note.note_content;
            this.setState({isShowingNoteModal:true, noteAddEdit:2, editNoteId:editNoteId, editNoteTitle:editNoteTitle,
                editNote:editNote, staticNoteTitle:editNoteTitle, staticNote:editNote, notebookObj:notebook_obj,
                noteOwnerProfileImage: note.note_owner_profile_image
                ,
                noteOwner: note.note_owner,
                noteCreatedTime: note.updated_at.createdDate
            });
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
                    <ModalDialog width="642px" className="note-popup-dialog" style={{transform : "none"}}>

                        <div className="popup-holder">
                            <section className="edit-note-popup clearfix">
                                <section className="inner-header clearfix">
                                    <div className="info-wrapper">
                                        <img className="user-image img-circle" src={this.state.noteOwnerProfileImage} alt="User"/>
                                            <p className="note-owner">by {this.state.noteOwner}</p>
                                            <p className="time-wrapper">{this.state.noteCreatedTime}</p>
                                    </div>
                                    <div className="options-wrapper">
                                        <span className="delete-note"></span>
                                        <span className="note-info"></span>
                                        <div className="search-wrapper">
                                            <input type="text" className="form-control search-note" placeholder="Search"/>
                                            <span className="search-ico"></span>
                                        </div>
                                        <span className="maximize"></span>
                                    </div>
                                </section>
                                <section className="note-body clearfix">
                                    <Scrollbars style={{ height: 628 }}>
                                        <RichTextEditor note={this.state.editNote} noteText={this.getNoteData} />
                                    </Scrollbars>
                                    {
                                        (this.state.notebookObj != null && this.state.notebookObj.shared_privacy == _notes_read_write) ?
                                            <span className="save-note" onClick={this.closeNotePopup.bind(this)}></span> :
                                            <span className="save-note read-only" onClick={this.closeNotePopup.bind(this)}></span>
                                    }
                                </section>
                            </section>
                            <span className="close-note" onClick={this.closeNotePopup.bind(this)}></span>
                        </div>
                    </ModalDialog>
                </ModalContainer>
                }
            </div>
        )
    }

    render() {
        return (
            <section className="notebook-container">
                <div className="container">


                    <section className="notebook-header">
                        <div className="row">
                            <div className="col-sm-3">
                                <h2>Notebooks</h2>
                            </div>
                            <div className="col-sm-5 menu-bar">
                                <div className="notebook-type active">
                                    <h4>my notebooks</h4>
                                    <div className="highlighter"></div>
                                </div>
                                <div className="notebook-type">
                                    <h4>group notebooks</h4>
                                    <div className="highlighter"></div>
                                </div>
                            </div>
                            <div className="col-sm-4 menu-buttons">
                                <div className="search-notebook">
                                    <div className="inner-addon">
                                        <i className="fa fa-search"></i>
                                        <input type="text" className="form-control" placeholder="Search"/>
                                    </div>
                                </div>
                                <div className="crt-notebook">
                                    <button className="btn btn-crt-notebook" onClick={this.handleClick.bind(this)}>
                                        <i className="fa fa-plus"></i> New notebook
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="notebook-body">
                        {
                            (this.state.notes.length>0)?<NoteCategory notebooks={this.state.notes} showConfirm={this.showConfirm.bind(this)} showNotePopup={this.showNotePopup.bind(this)}
                                                                      onLoadNotes={this.loadNotes.bind(this)}/>:null
                        }
                        {this.getPopup()}
                        {this.getConfirmationPopup()}
                        {this.getNotePopup()}
                    </section>


                </div>
            </section>
        );
    }
}