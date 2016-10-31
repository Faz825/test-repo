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
                                            <div className="user-holder">
                                                <span className="user">User name<i className="fa fa-times" aria-hidden="true"></i></span>
                                            </div>
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
        let i = (
            <Popover id="popover-contained" style={{maxWidth: "635px", width: "635px"}}>
                <SharePopup />
            </Popover>
        );
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
                                <OverlayTrigger rootClose trigger="click" placement="right" overlay={i}>
                                    <div className="share-folder">
                                        <i className="fa fa-share-alt" aria-hidden="true"></i>
                                    </div>
                                </OverlayTrigger>
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
                                    <div className="search-people" contentEditable="true" placeholder="Search"></div>
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
                            <p className="see-all">See All</p>
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
