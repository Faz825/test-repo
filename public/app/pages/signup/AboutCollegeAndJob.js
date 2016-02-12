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

export default class AboutCollegeAndJob extends React.Component{
	constructor(props) {
        super(props);
        this.state= {
            sesData:{},
            formData:{},
            errorData:{},
            validateAlert: ""
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
	    	}
    	}

    }

	render() {
        let _secretary_image = this.state.sesData.secretary_image_url;
        let session = Session.getSession('prg_lg');

		return (
			<div className="row row-clr pgs-middle-sign-wrapper pgs-middle-about-wrapper">
            	<div className="container">
                    <div className="col-xs-10 pgs-middle-sign-wrapper-inner">
                    	<div className="row">
                        	<SecretaryThumbnail url={_secretary_image} />
                            <div className="col-xs-10">
                                <div className="row row-clr pgs-middle-sign-wrapper-inner-cover pgs-middle-sign-wrapper-inner-cover-secretary pgs-middle-sign-wrapper-about">
                                <img src="images/sign-left-arrow-1.png" alt="" className="img-responsive pgs-sign-left-arrow"/>
                                    <div className="row row-clr pgs-middle-sign-wrapper-about-inner">
                                        <h1>Hello {session.first_name},</h1>
                                        <h2>Welcome to Proglobe</h2>
                                        <h5>I, Donna, will now be your very own personal assistant and will be making your life easier.<br/>We are bonded forever now. Yay!</h5>
                                    </div>
                                    <div className="row row-clr pgs-middle-sign-wrapper-inner-form pgs-middle-sign-wrapper-about-inner-form">
                                    	<h6>About your college / job</h6>
                                        <form method="post" onSubmit={this.collectData.bind(this)}>
                                        <div className="row pgs-middle-about-inputs">
                                        	<InputField type="text" name="schoolName" size="7" label="School Name" placeholder="University of California, Berkeley" classes="pgs-sign-inputs" textChange={this.elementChangeHandler} />
                                        	<SelectDateDropdown title="Graduation Date" dateFormat="mm-dd-yyyy" optChange={this.elementChangeHandler}/>
                                        </div>
                                        <div className="row pgs-middle-about-inputs">
                                            <InputField type="text" name="job" size="7" label="Current Job" placeholder="Front-end Developer" classes="pgs-sign-inputs" textChange={this.elementChangeHandler} />
                                            <InputField type="text" name="company" size="5" label="Company" placeholder="Facebook Inc." classes="pgs-sign-inputs" textChange={this.elementChangeHandler} />
                                        </div>
                                        {this.state.validateAlert ? <p className="form-validation-alert" style={errorStyles} >{this.state.validateAlert}</p> : null}
	                                        <div className="row">
		                                        <Button type="button" size="6" classes="pgs-sign-submit-cancel" value="cancel" />
		                                        <Button type="submit" size="6" classes="pgs-sign-submit" value="next" />
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