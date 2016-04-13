/**
 * This is notes index class that handle all
 */
import React from 'react';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import Session from '../../middleware/Session';
import {Alert} from '../../config/Alert';

let errorStyles = {
    color         : "#ed0909",
    fontSize      : "0.8em",
    textTransform : "capitalize",
    margin        : '0 0 15px',
    display       : "inline-block"
}

export default class Index extends React.Component {
    constructor(props) {
        super(props);
        this.state={
            isShowingModal : false,
            catColor : "",
            catNameValue : "",
            clrChosen : "",
            validateAlert : "",
            notes:[]
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
                this.setState({notes:data.notes});
            }
        }.bind(this));

    }

    handleClick() {
        this.setState({isShowingModal: true});
    }

    handleClose() {
        this.setState({catNameValue: ""});
        this.setState({catColor: ""});
        this.setState({validateAlert:Alert.INVALID_COLOR});
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
          notebookColor:this.state.catColor
        };

        let loggedUser = Session.getSession('prg_lg');

        $.ajax({
          url: '/notes/add-notebook',
          method: "POST",
          dataType: "JSON",
          data:_noteBook,
          headers: { 'prg-auth-header':loggedUser.token },
        }).done( function (data, text) {
          if(data.code == 200){
              this.loadNotes();
              this.setState({catNameValue: ""});
              this.setState({catColor: ""});
              this.setState({validateAlert:Alert.INVALID_COLOR});
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

    deleteNote(note_id){
        let loggedUser = Session.getSession('prg_lg');
        $.ajax({
            url: '/notes/delete-note',
            method: "POST",
            dataType: "JSON",
            data:{noteId:note_id},
            headers: { 'prg-auth-header':loggedUser.token }
        }).done( function (data, text) {
            if(data.code == 200){
                this.loadNotes();
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
                        (this.state.notes.length>0)?<NoteCategory notebooks={this.state.notes} deleteNote={this.deleteNote.bind(this)}/>:null
                    }

                    {this.getPopup()}
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
        let _this = this;
        let notebooks = this.props.notebooks;
        let deleteNote = this.props.deleteNote;

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
                        <NoteThumb catData={notebook.notes} catID={notebook.notebook_id} deleteNote={deleteNote}/>
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
        this.state={}
    }

    addNewNote(notebook_id){
        location.href = "/notes/new-note/"+notebook_id;
    }

    editNote(note_id){
        location.href = "/notes/edit-note/"+note_id;
    }

    deleteNote(note_id){
        this.props.deleteNote(note_id);
    }

    render(){

        let _this = this;
        let _notes = this.props.catData;
        let _notebook = this.props.catID;

        return(
            <div className="pg-notes-item-main-row">
                <div className="note-holder">
                    <div className="row-clear add-new-note note">
                        <a href="javascript:void(0)" onClick={()=>_this.addNewNote(_notebook)}><p className="add-note-text">Add new</p></a>
                    </div>
                </div>
                {
                    _notes.map(function(note,key){
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
                                        <span className="note-delete-btn" onClick={()=>_this.deleteNote(note.note_id)}></span>

                                </div>
                            </div>
                        )
                    })
                }
            </div>
        )

    }

};
