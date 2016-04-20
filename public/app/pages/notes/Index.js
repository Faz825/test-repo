/**
 * This is notes index class that handle all
 */
import React from 'react';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import Session from '../../middleware/Session';
import {Alert} from '../../config/Alert';
import RichTextEditor from '../../components/elementsRichTextEditor';

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
        this.state={
            isShowingModal : false,
            catColor : "",
            catNameValue : "",
            isDefault : 0,
            clrChosen : "",
            validateAlert : "",
            notes:[],
            showConfirm:false,
            deleteNoteId:0
        };
        this.elementChangeHandler = this.elementChangeHandler.bind(this);
        this.addNote = this.addNote.bind(this);
        this.colorPicker = this.colorPicker.bind(this);
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
            if(data.status.code == 200){
                if(data.notes.length == 0){
                    this.setState({catNameValue: "My Notes"});
                    this.setState({catColor: "#0272ae"});
                    this.setState({isDefault: 1});
                    this.addNote();
                } else{
                    this.setState({notes:data.notes});
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

    addNote(){

      if(this.state.catNameValue == ""){
        this.setState({validateAlert:Alert.EMPTY_NOTEBOOK_NAME})
      } else if(this.state.catColor == ""){
        this.setState({validateAlert:Alert.INVALID_COLOR})
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
                            <p className="add-note-cat btn" onClick={this.addNote.bind(this)}>Add note category</p>
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
                        (this.state.notes.length>0)?<NoteCategory notebooks={this.state.notes} showConfirm={this.showConfirm.bind(this)}/>:null
                    }

                    {this.getPopup()}
<<<<<<< HEAD
                    <RichTextEditor />
=======
                    {this.getConfirmationPopup()}
>>>>>>> PROG-REL-V4.0
                </div>
            </div>
        );
    }
}

export class NoteCategory extends React.Component{
    constructor(props) {
        super(props);
        this.state={}
    }

    render() {
        let notebooks = this.props.notebooks;
        let showConfirm = this.props.showConfirm;

        let _noteBooks = notebooks.map(function(notebook,key){
            return (
                <div className="row row-clr pg-notes-page-content-item pg-box-shadow" key={key}>
                    <div className="col-xs-2 note-cat-thumb" style={{backgroundColor : notebook.notebook_color}}>
                        <div className="cat-icon-holder">
                            <span className="cat-icon"></span>
                            <h3 className="cat-title">{notebook.notebook_name}</h3>
                        </div>
                    </div>
                    <div className="col-xs-10 pg-notes-page-content-item-right-thumbs">
                        <NoteThumb catData={notebook.notes} catID={notebook.notebook_id} showConfirm={showConfirm}/>
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

export class NoteThumb extends React.Component{

    constructor(props) {
        super(props);
        this.state={
            allNotesAreVisible: false
        }
    }

    addNewNote(notebook_id){
        location.href = "/notes/new-note/"+notebook_id;
    }

    editNote(note_id){
        location.href = "/notes/edit-note/"+note_id;
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
        let _notes = this.props.catData;
        let _notebook = this.props.catID;

        let _firstSetNotes = _notes.map(function(note,key){
            if(key < 4) {
                return (
                    <div className="note-holder" id={note.note_id} key={key}>
                        <div className="row-clear note">
                            <a href="javascript:void(0)" onClick={()=>_this.editNote(note.note_id)}>
                                <div className="time-wrapper">
                                    <p className="date-created">{note.updated_at.createdDate}</p>

                                    <p className="time-created">{note.updated_at.createdTime}</p>
                                </div>
                                <div className="note-title-holder">
                                    <p className="note-title">{note.note_name}</p>
                                </div>
                            </a>
                            <span className="note-delete-btn" onClick={()=>_this.showConfirm(note.note_id)}></span>

                        </div>
                    </div>
                )
            }
        });

        let _allNotes = _notes.map(function(note,key){
            if(key >= 4) {
                return (
                    <div className="note-holder" id={note.note_id} key={key}>
                        <div className="row-clear note">
                            <a href="javascript:void(0)" onClick={()=>_this.editNote(note.note_id)}>
                                <div className="time-wrapper">
                                    <p className="date-created">{note.updated_at.createdDate}</p>

                                    <p className="time-created">{note.updated_at.createdTime}</p>
                                </div>
                                <div className="note-title-holder">
                                    <p className="note-title">{note.note_name}</p>
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
                <div className="note-holder">
                    <div className="row-clear add-new-note note">
                        <a href="javascript:void(0)" onClick={()=>_this.addNewNote(_notebook)}><p className="add-note-text">Add new</p></a>
                    </div>
                </div>
                {_firstSetNotes}
                {
                    (this.state.allNotesAreVisible)? _allNotes : null
                }
                {(_notes.length > 4) ? <div className="show-more-btn" onClick={this.showMoreNotes.bind(this)}>{this.state.allNotesAreVisible? "Show Less" : "Show More"}</div> : null}

            </div>
        )

    }

}
