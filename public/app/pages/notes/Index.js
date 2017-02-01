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
                    <ModalDialog onClose={this.handleClose.bind(this)} width="40%" style={{marginTop : "-100px"}}>
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
                    <ModalDialog width="40%" className="note-popup" style={{padding : "0", borderRadius : "3px" , transform : "none"}}>
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
            <div className="notesCatHolder">
                <div className="row row-clr pg-notes-page-content">
                    <div className="row row-clr pg-notes-page-header">
                        <div className="container">
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