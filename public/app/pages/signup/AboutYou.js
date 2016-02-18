import React from 'react'
import InputField from '../../components/elements/InputField'
import SelectDateDropdown from '../../components/elements/SelectDateDropdown'
import CountryList from '../../components/elements/CountryList'
import Button from '../../components/elements/Button'
import {Alert} from '../../config/Alert'
import Session  from '../../middleware/Session';
import SecretaryThumbnail from '../../components/elements/SecretaryThumbnail'
import AboutInner from '../../components/elements/AboutInner'

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
            sesData:{},
            formData:{},
            errorData:{},
            validateAlert: "",
            loggedUser : Session.getSession('prg_lg')
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

            if(this.allInvalid(this.state.errorData)){
                this.setState({validateAlert: ""});


                let _this =  this;
                $.ajax({
                    url: '/general-info/save',
                    method: "POST",
                    dataType: "JSON",
                    headers: { 'prg-auth-header':this.state.loggedUser.token },
                    data:this.state.formData,
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
        }

    }

    onBack(){
        this.props.onPreviousStep()
    }

	render(){
        let _secretary_image = this.state.sesData.secretary_image_url;
        let defaultVals = this.state.loggedUser;

        return(
			<div className="row row-clr pgs-middle-sign-wrapper pgs-middle-about-wrapper">
            	<div className="container">
                    <div className="col-xs-10 pgs-middle-sign-wrapper-inner">
                    	<div className="row">
                            <SecretaryThumbnail url={_secretary_image} />
                            <div className="col-xs-10">
                                <div className="row row-clr pgs-middle-sign-wrapper-inner-cover pgs-middle-sign-wrapper-inner-cover-secretary pgs-middle-sign-wrapper-about">
                                <img src="images/sign-left-arrow-1.png" alt="" className="img-responsive pgs-sign-left-arrow" />
                                    <AboutInner />
                                    <div className="row row-clr pgs-middle-sign-wrapper-inner-form pgs-middle-sign-wrapper-about-inner-form">
                                    	<h6>First, Let me know a little more about you...</h6>
                                        <form method="post" onSubmit={this.collectData.bind(this)}>
	                                        <div className="row pgs-middle-about-inputs">

	                                        	<SelectDateDropdown
                                                    title="Date of Birth"
                                                    dateFormat="mm-dd-yyyy"
                                                    defaultOpt=""
                                                    optChange={this.elementChangeHandler}
                                                    required="true"
                                                    dateType="dob"/>

	                                            <CountryList optChange={this.elementChangeHandler}
                                                             defaultOpt={defaultVals.country}
                                                             required="true"/>

	                                            <InputField type="text"
                                                            name="zip"
                                                            size="2" label="Zip Code"
                                                            placeholder=""
                                                            classes="pgs-sign-inputs"
                                                            textChange={this.elementChangeHandler}  />
	                                        </div>
	                                        {this.state.validateAlert ? <p className="form-validation-alert" style={errorStyles} >{this.state.validateAlert}</p> : null}
	                                        <div className="row">
		                                        <Button type="button" size="6" classes="pgs-sign-submit-cancel pgs-sign-submit-back" value="back" onButtonClick = {this.onBack.bind(this)}/>
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
