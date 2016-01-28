import React from 'react'

class Secretary extends React.Component {

	render(){

		return (
			<div className="row row-clr pgs-middle-sign-wrapper">
            	<div className="container">
                    <div className="col-xs-8 pgs-middle-sign-wrapper-inner">
                        <div className="row row-clr pgs-middle-sign-wrapper-inner-cover pgs-middle-sign-wrapper-inner-cover-secretary">
                        	<h2>Choose your secretary</h2>
                            <h5>Your secretary will help you manage your content and organize your tasks</h5>
                            
                            <div className="row row-clr pgs-middle-sign-wrapper-inner-form">
                                <form method="post" action="about-you.html">
                                
                                	<div className="row">
                                    
                                        <div className="col-xs-6">
                                        	<div className="row row-clr pgs-middle-sign-wrapper-secratery-box">
                                            	<div className="row">
                                                	<div className="col-xs-6 pgs-secratery-pic-box">
                                                    	<div className="row row-clr pgs-secratery-pic">
                                                        	<img src="images/sec-1.png" alt="" className="img-responsive pgs-sec-default-pic"/>
                                                            <img src="images/sec-1-hover.gif" alt="" className="img-responsive pgs-sec-active-pic"/>
                                                            
                                                        </div>
                                                    </div>
                                                    <div className="col-xs-6 pgs-secratery-content-box">
                                                    
                                                    	<h3>Donna</h3>
                                                       
                                                        <h6 className="pbs-default-text">Choose Donna</h6>
                                                        <h6 className="pbs-active-text">Yey</h6>
                                                    
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="col-xs-6">
                                        	<div className="row row-clr pgs-middle-sign-wrapper-secratery-box">
                                            	<div className="row">
                                                	<div className="col-xs-6 pgs-secratery-pic-box">
                                                    	<div className="row row-clr pgs-secratery-pic">
                                                        	<img src="images/sec-2.png" alt="" className="img-responsive pgs-sec-default-pic"/>
                                                            <img src="images/sec-2-hover.gif" alt="" className="img-responsive pgs-sec-active-pic"/>
                                                           
                                                        </div>
                                                    </div>
                                                    <div className="col-xs-6 pgs-secratery-content-box">
                                                    
                                                    	<h3>Bob</h3>
                                                        
                                                        <h6 className="pbs-default-text">Choose Bob</h6>
                                                        <h6 className="pbs-active-text">Yey</h6>
                                                    
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                    </div>
                                
                                    <div className="row">
                                        <div className="col-xs-6">
                                            <a href="index.html" className="pgs-sign-submit-cancel pgs-sign-submit-back">back</a>
                                        </div>
                                        <div className="col-xs-6">
                                            <input type="submit" className="pgs-sign-submit" value="next"/>
                                        </div>
                                    </div>
                                </form>    
                            </div>
                            
                        </div>
                    </div>
                </div>
            </div>
		)
	}


}


module.exports = Secretary;