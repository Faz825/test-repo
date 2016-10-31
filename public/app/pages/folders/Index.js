/**
 * This is folders index class that handle all
 */
import React from 'react';
import Session from '../../middleware/Session';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import { Scrollbars } from 'react-custom-scrollbars';
import { Popover, OverlayTrigger } from 'react-bootstrap';

export default class Index extends React.Component{
    constructor(props){
        super(props);

        this.state={
            isShowingModal : false,
            CFName : "",
            CFColor : "",
            clrChosen : "",
            isFolderNameEmpty : false,
            isFolderClrEmpty: false
        }

        this.handleClick = this.handleClick.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.colorPicker = this.colorPicker.bind(this);
    }

    handleClick() {
        this.setState({isShowingModal: true});
    }

    handleClose() {
        this.setState({isShowingModal: false, isFolderNameEmpty : false, isFolderClrEmpty : false});
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
            this.setState({isShowingModal: false, CFName : "", CFColor : ""});
            console.log(this.state.CFName, this.state.CFColor);
        }
    }

    colorPicker(e){
        let colorName = e.target.getAttribute('data-color');
        this.setState({CFColor : colorName, isFolderClrEmpty: false});
    }

    isActive(value){
        return ((value===this.state.CFColor) ? value+' active': value);
    }

    addFolderPopup(){
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
                                                <div className={this.isActive('pink')} data-color="pink" onClick={this.colorPicker.bind(this)}>
                                                    <i className="fa fa-check" aria-hidden="true"></i>
                                                </div>
                                                <div className={this.isActive('light-blue')} data-color="light-blue" onClick={this.colorPicker.bind(this)}>
                                                    <i className="fa fa-check" aria-hidden="true"></i>
                                                </div>
                                                <div className={this.isActive('light-green')} data-color="light-green" onClick={this.colorPicker.bind(this)}>
                                                    <i className="fa fa-check" aria-hidden="true"></i>
                                                </div>
                                                <div className={this.isActive('red')} data-color="red" onClick={this.colorPicker.bind(this)}>
                                                    <i className="fa fa-check" aria-hidden="true"></i>
                                                </div>
                                                <div className={this.isActive('dark-blue')} data-color="dark-blue" onClick={this.colorPicker.bind(this)}>
                                                    <i className="fa fa-check" aria-hidden="true"></i>
                                                </div>
                                                <div className={this.isActive('gray')} data-color="gray" onClick={this.colorPicker.bind(this)}>
                                                    <i className="fa fa-check" aria-hidden="true"></i>
                                                </div>
                                                <div className={this.isActive('dark-green')} data-color="dark-green" onClick={this.colorPicker.bind(this)}>
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
                                            <input type="text" className="form-control" placeholder="Type a name..." />
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
        return(
            <section className="folder-container">
                <div className="container">
                    <section className="folder-header">
                        <div className="row">
                            <div className="col-sm-3">
                                <h2>Folders</h2>
                            </div>
                            <div className="col-sm-4">
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
                        <Folder clr="pink" />
                        <Folder clr="light-blue" />
                        <Folder clr="light-green" />
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
            isCollapsed : true
        }
    }

    onFldrExpand(){
        console.log("clicked");
        let isCollapsed = this.state.isCollapsed;
        this.setState({isCollapsed : !isCollapsed});
    }

    render(){
        let folderClr = this.props.clr;
        return(
            <div className={(this.state.isCollapsed)? "row folder " + folderClr : "row folder see-all " + folderClr}>
                <div className="folder-wrapper">
                    <div className="col-sm-3">
                        <div className="folder-cover-wrapper">
                            <div className="folder-cover">
                                <div className="folder-overlay"></div>
                                <div className="content-wrapper">
                                    <div className="logo-wrapper">
                                        <img src="assets/images/user-rounded.png" alt="Folder Name" className="img-rounded" />
                                        <span className="logo-shader"></span>
                                        <span className="logo-shader"></span>
                                    </div>
                                    <h3>My Folder</h3>
                                </div>
                            </div>
                            <div className="folder-peak"></div>
                        </div>
                    </div>
                    <div className="col-sm-9">
                        <div className="row">
                            <div className="folder-content-wrapper">
                                <div className="folder-items-wrapper">
                                    <div className="inner-wrapper">
                                        <div className="folder-col">
                                            <div className="folder-item upload-file">
                                                <i className="fa fa-plus"></i>
                                                <p>Upload new file or image</p>
                                            </div>
                                        </div>
                                        <File />
                                        <File />
                                        <File />
                                        <File />
                                        <File />
                                        <File />
                                        <File />
                                        <File />
                                        <File />
                                        <File />
                                        <File />
                                    </div>
                                    {
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
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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
            </div>
        );
    }
}
