//ProfileImgUpload
import React from 'react'
import Button from '../../components/elements/Button'
import LinkButton from '../../components/elements/LinkButton'

export default class ProfileImgUpload extends React.Component{
	render() {
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
                                        <h1>Hello Soham,</h1>
                                        <h2>Welcome to Proglobe</h2>
                                    </div>
                                    
                                    <div className="row row-clr pgs-middle-sign-wrapper-inner-form pgs-middle-sign-wrapper-about-inner-form pgs-middle-sign-wrapper-complete-inner-form">
                                    
                                    	<h6>Congratulations! You’re profile is now complete.</h6>
                                        
                                        <p>But wait! I don’t even know what you look like.</p>
                                        
                                        <p>Would you like to upload a picture now?</p>
                                        
                                            <div className="Profile-pic-main">
                                            
                                            	<div className="Profile-pic-display-area">
                                                	<img src="images/complete-pro-pic.png" alt="" className="img-responsive Profile-pic-uploaded"/>
                                                </div>
                                                
                                                <div className="Profile-pic-display-btn-area">
                                                    <LinkButton size="" classes="pgs-sign-submit-capture" value="Capture" link="#" click="" />
                                                    <LinkButton size="" classes="pgs-sign-upload" value="Upload" link="#" click="" />
                                                </div>
                                            
                                            </div> 
                                        
                                        
                                        
                                             <div className="row">
		                                        <Button type="button" size="6" classes="pgs-sign-submit-cancel" value="back" />
		                                        <Button type="button" size="6" classes="pgs-sign-submit" value="finish" />
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