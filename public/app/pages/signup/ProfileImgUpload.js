//ProfileImgUpload
import React from 'react'
import Button from '../../components/elements/Button'
import ImgUploader from '../../components/elements/ImgUploader'
import Session  from '../../middleware/Session';
export default class ProfileImgUpload extends React.Component{

	constructor(props){
		super(props);

		this.state = {profileImg : ""};


	}

	profileImgUpdated(img){
		this.setState({profileImg : img});
	}

	uploadImg(){

        let user = Session.getSession('prg_lg');
        let _this =  this;
        $.ajax({
            url: '/upload/profile-image',
            method: "POST",
            dataType: "JSON",
            headers: { 'prg-auth-header':user.token },
            data:{profileImg:this.state.profileImg,extension:'png'},
            cache: false,
            contentType:"application/x-www-form-urlencoded",
            success: function (data, text) {
                if (data.status.code == 200) {
                    Session.createSession("prg_lg", data.user);
                    _this.props.onNextStep();
                }
            },
            error: function (request, status, error) {
                console.log(request.responseText);
                console.log(status);
                console.log(error);
            }
        });
	}

	render() {
        let user = Session.getSession('prg_lg');
		return (

			<div className="row row-clr pgs-middle-sign-wrapper pgs-middle-about-wrapper">
            	<div className="container">
                
                    <div className="col-xs-11 pgs-middle-sign-wrapper-inner">
                    
                    	<div className="row">
                        
                        	<div className="col-xs-2 pgs-secratery-img">
                                <img src="images/secretary-pic.png" alt="" className="img-responsive"/>
                        	</div>
                            
                            <div className="col-xs-10">
                                <div className="row row-clr pgs-middle-sign-wrapper-inner-cover pgs-middle-sign-wrapper-inner-cover-secretary pgs-middle-sign-wrapper-about">
                                <img src="images/sign-left-arrow-1.png" alt="" className="img-responsive pgs-sign-left-arrow"/>
                                	
                                    <div className="row row-clr pgs-middle-sign-wrapper-about-inner pgs-middle-sign-wrapper-about-inner-establish-conn">
                                        <h1>Hello {user.first_name},</h1>
                                        <h2>Welcome to Proglobe</h2>
                                    </div>
                                    
                                    <div className="row row-clr pgs-middle-sign-wrapper-inner-form pgs-middle-sign-wrapper-about-inner-form pgs-middle-sign-wrapper-complete-inner-form">
                                    
                                    	<h6>Congratulations! You’re profile is now complete.</h6>
                                        
                                        <p>But wait! I don’t even know what you look like.</p>
                                        
                                        <p>Would you like to upload a picture now?</p>
                                                                              
                                        <ImgUploader imgUploaded={this.profileImgUpdated.bind(this)} defaultImg="images/default-profile-pic.png" />
                                        
                                         <div className="row">
	                                        <Button type="button" size="6" classes="pgs-sign-submit-cancel" value="back" />
	                                        <Button type="button" size="6" classes="pgs-sign-submit" value="finish" onButtonClick={()=>this.uploadImg()} />
	                                    </div> 
                                    </div>
                                    
                                </div>
                        	</div>

                            
                        </div>
                        
                        
                    </div>
                    
                </div>
            </div>
		);
	}
}