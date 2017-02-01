/**
 * This class handles all notebooks list
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

export default class NoteCategory extends React.Component{
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
                <Popover id="popover-contained"  positionTop="150px" className="popup-holder share-popover">
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
            <div className="container">
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
            scrollProp: 'hidden',
            isShowingModal : false,
            userToRemove: null
        }
        this.sharedUsers = [];
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

    onRemoveSharedUser() {
        let user = this.state.userToRemove;
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
                                 removeSharedUser={this.getPopupRemoveUser.bind(this)}
                                 handleClick={this.handleClick.bind(this)}
                                 scrollProp={this.state.scrollProp}/>
                    {/*</Scrollbars>*/}


                </div>
                <div className="footer-holder clearfix">
                    {
                        (_notebook.owned_by == 'me')?
                            <div className="add-new">
                                <OverlayTrigger container={this} trigger="click" placement="bottom" overlay={i}>
                                    <button className="btn-link">+ Add New</button>
                                </OverlayTrigger>
                            </div> : null
                    }
                    <div className="see-all">
                        {
                            (this.state.sharedUsers.length > 2) ?
                                <button className="btn-link" onClick={this.allSharedUsers.bind(this)}>See
                                    All</button> : null
                        }
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
            addNewUserValue: '',
            notebook: '',
            isShowingModal: false,
            userToAdd: null
        };

        this.loadNewUsers = this.loadNewUsers.bind(this);
        this.shareNote = this.shareNote.bind(this);
        this._handleAddNewUser = this._handleAddNewUser.bind(this);
        this.getPopupAddUser = this.getPopupAddUser.bind(this);
        this.handleClose = this.handleClose.bind(this);
    }

    _handleAddNewUser (e){
        this.setState({
            addNewUserValue: e.target.value
        },function (){
            this.loadNewUsers();
        });

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

                this.setState({
                    notebook: notebook.notebook_name,
                    userToAdd: user,
                    isShowingModal: true
                }, function(){
                    this.getPopupAddUser();
                    this.loadNewUsers();
                });


                this.props.onLoadNotes();
                this.props.onShareuser();
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
                            <input type="text" className="form-control" placeholder="Type Name to Add" id="type-to-add" onChange={this._handleAddNewUser}/>
                        </div>
                    </div>

                    <div className="popup-body-holder add-new">
                        {_suggestions}
                    </div>

                </div>

                {this.getPopupAddUser()}

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
        let _notebook = this.props.notebook;
        let _allUsers = this.props.sharedUserList.map(function(user,key){

            return (
                <div>
                    {
                        (user.shared_status == 3) ?
                            <div className="user-block shared clearfix" key={key}>
                                <div className="separator"></div>
                                <div className="img-holder">
                                    <img src={user.profile_image} alt="User"/>
                                </div>
                                <div className="user-details">
                                    <h3 className="user-name shared">{user.user_name}</h3>

                                    {
                                        (typeof user.school != 'undefined') ?
                                            <p className="more-info shared">{user.school}</p>
                                            :
                                            <p className="more-info shared">{user.company_name}</p>
                                    }

                                </div>
                                {
                                    (_notebook.owned_by == 'me')?
                                        <div>
                                            <div className="action add-new">
                                                <button className="btn-remove" onClick={()=>_this.props.handleClick(user)}>
                                                    <i className="fa fa-minus" aria-hidden="true"></i>
                                                </button>
                                            </div>
                                            <div className="permission">
                                                <select className="pg-custom-input"
                                                        onChange={(event)=>_this.props.changePermissions(event, user)}
                                                        value={user.shared_type}>
                                                    <option value="1">Read Only</option>
                                                    <option value="2">Read/Write</option>
                                                </select>
                                            </div>
                                            {_this.props.removeSharedUser()}
                                        </div>
                                        : null
                                }
                            </div> :
                            <div className="user-block shared clearfix" key={key}>
                                <div className="separator"></div>
                                <div className="img-holder">
                                    <img src={user.profile_image} alt="User"/>
                                </div>
                                <div className="user-details">
                                    <h3 className="user-name shared">{user.user_name}</h3>

                                    {
                                        (typeof user.school != 'undefined') ?
                                            <p className="more-info shared">{user.school}</p>
                                            :
                                            <p className="more-info shared">{user.company_name}</p>
                                    }

                                </div>
                                <div className="action add-new">
                                    <button className="btn-remove" onClick={()=>_this.props.handleClick(user)}>
                                        <i className="fa fa-minus" aria-hidden="true"></i>
                                    </button>
                                </div>
                                <div className="permission">
                                    <p className="req-pending">Request Pending</p>
                                </div>
                            </div>
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
                        <div className="row-clear note" style={{borderColor : note.note_color}}>
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
                            <p className="note-owner" style={{color : note.note_color}}>{note.note_owner}</p>
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