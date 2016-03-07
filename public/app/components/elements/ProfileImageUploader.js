/**
 * This is Profile Image Uploader Component
 */
'use strict';
import React from 'react';
import Cropper from 'react-cropper';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';

export default class ProfileImageUploader extends React.Component{
    constructor(props){
        super(props);
        this.state={
            src : "",
            isShowingModal : false,
            cropResult : null
        };
    }

    cropImage(){
        let imgSrc = this.refs.cropper.getCroppedCanvas().toDataURL();
        this.props.imgUpdated(imgSrc);
        this.setState({src: imgSrc});
        this.handleClose();
    }

    onChange(e){
        e.preventDefault();
        let files;
        if (e.dataTransfer) {
            files = e.dataTransfer.files;
        } else if (e.target) {
            files = e.target.files;
        }
        let reader = new FileReader();
        reader.onload = () => {
            this.setState({src: reader.result});
        };
        reader.readAsDataURL(files[0]);
    }

    getCropper(){
        return (
            <div>
                <Cropper
                    ref='cropper'
                    src={this.state.src}
                    style={{height: '450px', width: '100%'}}
                    guides={true}
                    aspectRatio={4/4}
                    crop={this.cropImage}
                    />
                <div className="imgUploadBtnHolder">
                    <label for="newCoverImg" className="coverImgUpload pgs-sign-submit" >
                        Upload File
                        <input type='file' onChange={this.onChange.bind(this)} id="newCoverImg" />
                    </label>
                    <button onClick={this.cropImage.bind(this)} style={{float: 'right'}} className="pgs-sign-submit" >Crop Image</button>
                </div>
            </div>
        )
    }

    handleClick() {
        this.setState({isShowingModal: true})
    }

    handleClose() {
        this.setState({isShowingModal: false})
    }

    getPopup(){
        return(
            <div onClick={this.handleClick}>
                {this.state.isShowingModal &&
                    <ModalContainer onClose={this.handleClose.bind(this)} zIndex="9999">
                        <ModalDialog onClose={this.handleClose.bind(this)} width="50%">
                            <h3>Image Cropper</h3>
                            {this.getCropper()}
                        </ModalDialog>
                    </ModalContainer>
                }
            </div>
        )
    }

    render(){
        return (
            <div className="imageSelector">
                <a onClick={(event)=>{this.handleClick()}} title="Edit Profile Image"></a>
                {this.getPopup()}
            </div>)
    }
}
