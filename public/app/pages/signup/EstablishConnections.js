import React from 'react'
import { Scrollbars } from 'react-custom-scrollbars'
import InputField from '../../components/elements/InputField'
import SelectDateDropdown from '../../components/elements/SelectDateDropdown'
import CountryList from '../../components/elements/CountryList'
import Button from '../../components/elements/Button'
import {Alert} from '../../config/Alert'
import EstablishConnectionBlock from '../../components/elements/EstablishConnectionBlock'

export default class EstablishConnections extends React.Component{ 
	handleScroll(event, values) {
	    console.log("top "+values.top);
	    /*
	    {
	        left: 0,
	        top: 0.21513353115727002
	        clientWidth: 952
	        clientHeight: 300
	        scrollWidth: 952
	        scrollHeight: 1648
	        scrollLeft: 0
	        scrollTop: 290
	    }
	    */
	  }

	render() {
		return (
			<div className="row row-clr pgs-middle-sign-wrapper pgs-middle-about-wrapper">
            	<div className="container">
                
                    <div className="col-xs-10 pgs-middle-sign-wrapper-inner">
                    
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
                                    
                                    <div className="row row-clr pgs-middle-sign-wrapper-inner-form pgs-middle-sign-wrapper-about-inner-form">
                                    
                                    	<h6>Establish your connections</h6>
                                        
                                        <div className="row row-clr pgs-establish-connection-cover"> 
                                        
                                        	<div className="row row-clr pgs-establish-connection-cover-inner">
                                        	<Scrollbars style={{ height: 310 }} onScroll={this.handleScroll}>
                                            
                                            	<EstablishConnectionBlock name="Leonard Green" imgLink="images/est-conn-1.png" university="University of California, Berkeley" connectLink="#" />

                                            	<EstablishConnectionBlock name="Saad El Yamani" imgLink="images/est-conn-2.png" university="University of California, Berkeley" connectLink="#" />

                                            	<EstablishConnectionBlock name="Gerald Edwards" imgLink="images/est-conn-3.png" university="University of California, Berkeley" connectLink="#" />

                                            	<EstablishConnectionBlock name="Saad El Yamani" imgLink="images/est-conn-2.png" university="University of California, Berkeley" connectLink="#" />

                                            	<EstablishConnectionBlock name="Gerald Edwards" imgLink="images/est-conn-1.png" university="University of California, Berkeley" connectLink="#" />

                                            	<EstablishConnectionBlock name="Saad El Yamani" imgLink="images/est-conn-2.png" university="University of California, Berkeley" connectLink="#" />

                                            	<EstablishConnectionBlock name="Gerald Edwards" imgLink="images/est-conn-3.png" university="University of California, Berkeley" connectLink="#" />

                                            	<EstablishConnectionBlock name="Saad El Yamani" imgLink="images/est-conn-2.png" university="University of California, Berkeley" connectLink="#" />

                                            	<EstablishConnectionBlock name="Gerald Edwards" imgLink="images/est-conn-1.png" university="University of California, Berkeley" connectLink="#" />

                                            	<EstablishConnectionBlock name="Leonard Green" imgLink="images/est-conn-1.png" university="University of California, Berkeley" connectLink="#" />

                                            	<EstablishConnectionBlock name="Saad El Yamani" imgLink="images/est-conn-2.png" university="University of California, Berkeley" connectLink="#" />

                                            	<EstablishConnectionBlock name="Gerald Edwards" imgLink="images/est-conn-3.png" university="University of California, Berkeley" connectLink="#" />

                                            	<EstablishConnectionBlock name="Saad El Yamani" imgLink="images/est-conn-2.png" university="University of California, Berkeley" connectLink="#" />

                                            	<EstablishConnectionBlock name="Gerald Edwards" imgLink="images/est-conn-1.png" university="University of California, Berkeley" connectLink="#" />

                                            	<EstablishConnectionBlock name="Saad El Yamani" imgLink="images/est-conn-2.png" university="University of California, Berkeley" connectLink="#" />

                                            	<EstablishConnectionBlock name="Gerald Edwards" imgLink="images/est-conn-3.png" university="University of California, Berkeley" connectLink="#" />

                                            	<EstablishConnectionBlock name="Saad El Yamani" imgLink="images/est-conn-2.png" university="University of California, Berkeley" connectLink="#" />

                                            	<EstablishConnectionBlock name="Gerald Edwards" imgLink="images/est-conn-1.png" university="University of California, Berkeley" connectLink="#" />

                                            </Scrollbars>
                                            </div>
                                            
                                        </div> 
                                        
                                        <div className="row">
	                                        <Button type="button" size="6" classes="pgs-sign-submit-cancel" value="cancel" />
	                                        <Button type="button" size="6" classes="pgs-sign-submit" value="next" />
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