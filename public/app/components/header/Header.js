import React from 'react';
import Img from '../elements/Img'

export default class Header extends React.Component {
	render(){
		return(
			 <div className="row row-clr pgs-top-navigation">
            
            	<div className="container">
                
                	<div className="row">
                    
                    	<div className="col-xs-3 pgs-main-logo-area">
                            <Img src="images/logo.png" alt="Logo" />                        	
                        </div>
                        
                        <div className="col-xs-6 pgs-main-nav-area">
                        	<div className="row row-clr pgs-main-nav-area-inner">
                                <ul>
                                    <li><a href="#">About Proglobe</a></li>
                                    <li><a href="#">How it works</a></li>
                                    <li><a href="#">The Team</a></li>
                                    <li><a href="#">Contact us</a></li>
                                </ul>
                            </div>
                        </div>
                        
                        <div className="col-xs-3 pgs-main-btn-area">
                        	<div className="row row-clr pgs-main-btn-area-inner">
                            
                                    <a href="#" className="pgs-main-btn-login">Login</a>
                                    <a href="#" className="pgs-main-btn-sign">Signup</a>
                                    
                            </div>
                        </div>
                    
                    </div>
                
                </div>
            
            </div>
		);
	}
}