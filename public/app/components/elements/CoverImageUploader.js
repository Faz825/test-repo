/**
 * THis is Image Uploader Component
 */
'use strict';
import React from 'react';
import Cropper from 'react-cropper';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';

export default class CoverImageUploader extends React.Component{
    constructor(props){
        super(props);
        this.state={src:"",isShowingModal: false};


    }
    cropImage(){
        this.setState({src:this.cropper.getCroppedCanvas().toDataURL()});
    }

    getCropper(){
        return (<div>
            <Cropper
                ref={(ref) => this.cropper = ref}
                src='http://fengyuanchen.github.io/cropper/img/picture.jpg'
                style={{height: 400, width: '100%'}}
                aspectRatio={16 / 9}
                guides={true}

                preview = ".preView"
                />
            <img src = {this.state.src} className="preView"/>
        </div>)
    }

    handleClick() {
        this.setState({isShowingModal: true})
    }
    handleClose() {
        this.setState({isShowingModal: false})
    }

    getPopup(){
        const customStyles = {
            content : {
                top                   : '50%',
                left                  : '50%',
                right                 : 'auto',
                bottom                : 'auto',
                marginRight           : '-50%',
                transform             : 'translate(-50%, -50%)'
            }
        };


        return(

                <div onClick={this.handleClick}>
                    {
                        this.state.isShowingModal &&
                        <ModalContainer onClose={this.handleClose.bind(this)} style={customStyles}>
                            <ModalDialog onClose={this.handleClose.bind(this)}>
                                <h1>Image Cropper</h1>
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
                <a onClick={(event)=>{this.handleClick()}}>Edit Profile Image </a>
                {this.getPopup()}
            </div>)
    }
}

