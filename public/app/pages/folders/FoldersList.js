
import React from 'react';
import Session from '../../middleware/Session';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import { Scrollbars } from 'react-custom-scrollbars';
import { Popover, OverlayTrigger } from 'react-bootstrap';
import Dropzone from 'react-dropzone';
import SharePopup from './SharePopup';

export default class FolderList extends React.Component{
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
        let fldrClr = folderData.folder_color;
        let borderClr= "#828182";

        let i = (
            <Popover id="popover-contained" className="share-popover-contained" style={{maxWidth: "556px", width: "556px", boxShadow: "none"}}>
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

        switch(fldrClr) {
            case "#ed1e7a":
                borderClr = "#f57fb4";
                break;
            case "#00a6ef":
                borderClr = "#b3e4fa";
                break;
            case "#a6c74a":
                borderClr = "#e6efcc";
                break;
            case "#bebfbf":
                borderClr = "#dedfdf";
                break;
            case "#000000":
                borderClr = "#828182";
                break;
            case "#038247":
                borderClr = "#d2e3a4";
                break;
            case "#000f75":
                borderClr = "#7fd2f7";
                break;
            case "#b21e53":
                borderClr = "#b21e53";
                break;
        }

        let _folderName = folderData.folder_name == 'undefined' ? folderData.folder_name : folderData.folder_name.length <= 12 ? folderData.folder_name : folderData.folder_name.slice(0,14) + '...';

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
                                            <h3 title={folderData.folder_name}>{_folderName}</h3>
                                        </div>
                                        {
                                            (this.props.folderCount != 0)?
                                                <OverlayTrigger rootClose trigger="click" placement="right" overlay={i}>
                                                    <div className="share-folder">
                                                        {
                                                            (folderData.is_shared) ?
                                                                <span className="sharedIcon"></span>
                                                                :
                                                                <span className="folder-share-icon"></span>
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
                                                    <div className="folder-item upload-file" style={{borderColor: borderClr}}>
                                                        <i className="fa fa-plus" style={{color: folderData.folder_color}}></i>
                                                        <p style={{color: folderData.folder_color}}>Upload new file or image</p>
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
                                            <h3 title={folderData.folder_name}>{_folderName}</h3>
                                        </div>
                                        {
                                            (this.props.folderCount != 0)?
                                                <OverlayTrigger rootClose trigger="click" placement="right" overlay={i}>
                                                    <div className="share-folder">
                                                        {
                                                            (folderData.is_shared) ?
                                                                <i className="fa fa-users" aria-hidden="true"></i> :
                                                                <span className="folder-share-icon"></span>
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
                                                <div className="folder-col"  onClick={(event)=>{this.onOpenClick(folderData.folder_id)}}>
                                                    <div className="folder-item upload-file" style={{borderColor: borderClr}}>
                                                        <i className="fa fa-plus" style={{color: folderData.folder_color}}></i>
                                                        <p style={{color: folderData.folder_color}}>Upload new file or image</p>
                                                    </div>
                                                </div>
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
            <div className="folder-col">
                <div className="clearfix" onClick={()=>this.viewFile(data)}>
                    <div className={"folder-item " + data.document_type + " " + imgClass + " " + isSelected} style={thumbIMg}>
                        <div className={(imgClass)? "img-wrapper" : "inner-wrapper"}>
                            <div className="time-wrapper">
                                <p className="date-created">{data.document_updated_at.createdDate}</p>
                                <p className="time-created">{data.document_updated_at.createdTime}</p>
                            </div>
                            <div className="folder-title-holder">
                                <p className="folder-title">{data.document_name}</p>
                            </div>
                            <div className="item-type">
                                <svg width="24" height="32">
                                    <image xlinkHref={"images/folder/types/"+
                                    (data.document_type == "doc" || data.document_type == "docx") ? "docs" :
                                    (data.document_type == "pdf") ? "pdfs" :
                                    (data.document_type == "image") ? "jpgs" : ""
                                    +".svg"} width="24" height="32"/>
                                </svg>
                            </div>
                        </div>
                        {
                            (data.document_thumb_path)?
                                <span className="img-overlay"></span>
                                :
                                null
                        }
                    </div>
                </div>
                {
                    (this.state.loggedUser.id == data.document_user) ?
                        <i className="fa fa-minus doc-delete-btn" aria-hidden="true" onClick={()=>this.onShowConfirm(data.document_id)}></i>
                        : null
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