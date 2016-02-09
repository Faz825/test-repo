import React from 'react'
import InputField from '../../components/elements/InputField'
import SelectDateDropdown from '../../components/elements/SelectDateDropdown'
import CountryList from '../../components/elements/CountryList'
import Button from '../../components/elements/Button'
import {Alert} from '../../config/Alert'
import Session  from '../../middleware/Session';
import SecretaryThumbnail from '../../components/elements/SecretaryThumbnail'

let errorStyles = {
    color         : "#ed0909",
    fontSize      : "0.8em",
    textTransform : "capitalize",
    margin        : '0 0 15px',
    display       : "inline-block"
}

export default class AboutYou extends React.Component{
	constructor(props) {
        super(props);
        this.state= {
<<<<<<< HEAD
            formData:{},//,
            sesData:{}
=======
            formData:{},
            errorData:{},
            validateAlert: ""
>>>>>>> PROG-23
            //signupURL:'/doSignup'
        };
        this.collectData = this.collectData.bind(this);
        this.elementChangeHandler = this.elementChangeHandler.bind(this);

    }

    componentDidMount() {

        let _sesData = Session.getSession('prg_lg')
        this.setState({sesData:_sesData});
    }

    allInvalid(elements) {
        for (var i in elements) {
            if (elements[i]["status"] == "invalid") return false;
        }
        return true;
    }

    elementChangeHandler(key,data,status){
        
        let _formData = this.state.formData;
        let _errorData = this.state.errorData;

        _formData[key] = data;
        this.setState({formData:_formData});

        if(status != ""){
            _errorData[key] = {"status": status};
            this.setState({errorData:_errorData});
        }
    
    }

    collectData(e){
        e.preventDefault();

        if(Object.keys(this.state.errorData).length != 2){
            this.setState({validateAlert: Alert.FILL_EMPTY_REQUIRED_FIELDS});
        }else{
            this.setState({validateAlert: Alert.FILL_EMPTY_REQUIRED_FIELDS});

            if(this.allInvalid(this.state.errorData)){
                this.setState({validateAlert: ""});

                console.log(this.state.formData);
            }
        }

    }

	render(){
        let _secretary_image = this.state.sesData.secretary_image_url;


        return(
			<div className="row row-clr pgs-middle-sign-wrapper">
            	<div className="container">
                
                    <div className="col-xs-10 pgs-middle-sign-wrapper-inner">
                    
                    	<div className="row">

                            <SecretaryThumbnail url={_secretary_image} />
                            <div className="col-xs-10">
                                <div className="row row-clr pgs-middle-sign-wrapper-inner-cover pgs-middle-sign-wrapper-inner-cover-secretary pgs-middle-sign-wrapper-about">
                                <img src="images/sign-left-arrow-1.png" alt="" className="img-responsive pgs-sign-left-arrow" />
                                	
                                    <div className="row row-clr pgs-middle-sign-wrapper-about-inner">
                                        <h1>Hello {this.state.sesData.secretary_name},</h1>
                                        <h2>THANK YOU FOR CHOOSING ME</h2>
                                        <h5>I, {this.state.sesData.secretary_name}, will now be your very own personal assistant and will be makingyour life easier.<br />We are bonded for life now. Yay!</h5>
                                    </div>
                                    
                                    <div className="row row-clr pgs-middle-sign-wrapper-inner-form pgs-middle-sign-wrapper-about-inner-form">
                                    
                                    	<h6>First, Let me know a little more about you...</h6>
                                        <form method="post" onSubmit={this.collectData.bind(this)}>
	                                        <div className="row pgs-middle-about-inputs">
	                                        	<SelectDateDropdown title="Date of Birth" dateFormat="dd-mm-yyyy" optChange={this.elementChangeHandler} required="true"/>

	                                            <CountryList optChange={this.elementChangeHandler} required="true"/>

	                                            <InputField type="text" name="zip" size="2" label="Zip Code" placeholder="98252" classes="pgs-sign-inputs" textChange={this.elementChangeHandler} />
	                                        </div>

	                                        {this.state.validateAlert ? <p className="form-validation-alert" style={errorStyles} >{this.state.validateAlert}</p> : null}

	                                        <div className="row">
		                                        <Button type="button" size="6" classes="pgs-sign-submit-cancel" value="cancel" />
		                                        <Button type="button" size="6" classes="pgs-sign-submit" value="next" />
		                                    </div>
                                        </form>    
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