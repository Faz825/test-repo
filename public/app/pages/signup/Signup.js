import React from 'react'
import EmailField from '../../components/elements/EmailField'
import Button from '../../components/elements/Button'
import {Alert} from '../../config/Alert';
import Session  from '../../middleware/Session';
import TextField from '../../components/elements/TextField'
import PasswordField from '../../components/elements/PasswordField'

let errorStyles = {
    color         : "#ed0909",
    fontSize      : "0.8em",
    textTransform : "capitalize",
    margin        : '0 0 15px',
    display       : "inline-block"
}
/**
 * TODO :: Set formData objects for each element as defualt value when plugin load
 */
class Signup extends React.Component {

    constructor(props) {
        super(props);
        this.state= {
            formData:{},
            errorData:{
                fName:false,
                lName:"",
                email:"",
                password:""},
            signupURL:'/doSignup',
            validateAlert: "",
            invalidElements :{}

        };
        this.elementChangeHandler = this.elementChangeHandler.bind(this)
        this.clearValidations     = this.clearValidations.bind(this)
        this.validateSchema = {
                fName: {req: true, message: Alert.EMPTY_FIRST_NAME, value: "", valid: false},
                lName: {req: true, message: Alert.EMPTY_LAST_NAME, value: "", valid: false},
                email: {req: true, message: Alert.INVALID_EMAIL, value: "", valid: false},
                password: {req: true, message: [Alert.PASSWORD_LENGTH_ERROR,Alert.PASSWORD_MISMATCH], value: "", valid: false},
                confPassword:{req: true, message: [Alert.PASSWORD_LENGTH_ERROR,Alert.PASSWORD_MISMATCH], value: "", valid: false}
            };

        }


    validateForm(){

        let canSubmit = false;
        let _validateSchema = this.validateSchema;
        let _invalidElements = {};
        for(let element in _validateSchema){

           if( !_invalidElements.hasOwnProperty(element) && _validateSchema[element].valid == false){
               _invalidElements[element] = _validateSchema[element];
           }
        }

        this.setState({invalidElements:_invalidElements});


    }
    submitData(e){
        e.preventDefault();
        this.validateForm();


    }


    elementChangeHandler(key,data,status){

        let _formData = this.state.formData;
        let _invalidElements = this.state.invalidElements;

        this.validateSchema[key].valid = status;
        _invalidElements[key] = this.validateSchema[key];
        if(status){
            delete _invalidElements[key];

        }

        _formData[key] = data;
        this.setState({formData:_formData});
        this.setState({invalidElements:_invalidElements});

    }

    clearValidations(){
        this.setState({invalidElements:{}});
    }

	render(){

		return (
			<div className="row row-clr pgs-middle-sign-wrapper">
            	<div className="container">
                    <div className="col-xs-8 pgs-middle-sign-wrapper-inner">
                        <div className="row row-clr pgs-middle-sign-wrapper-inner-cover">
                        	<h2>Let’s create your account</h2>
                            <div className="row row-clr pgs-middle-sign-wrapper-inner-form">
                                <form method="get" onSubmit={this.submitData.bind(this)} onReset={this.clearValidations.bind(this)} >
                                    <div className="row">
                                        <TextField  name="fName"
                                                    size="6"
                                                    value=""
                                                    label="First Name"
                                                    placeholder=""
                                                    classes="pgs-sign-inputs"
                                                    onInputChange={this.elementChangeHandler}
                                                    required={true}
                                                    validate={this.state.invalidElements.fName} />
                                        <TextField  name="lName"
                                                    size="6"
                                                    value=""
                                                    label="Last Name"
                                                    placeholder=""
                                                    classes="pgs-sign-inputs"
                                                    required={true}
                                                    onInputChange={this.elementChangeHandler}
                                                    validate={this.state.invalidElements.lName} />
                                    </div>
                                    <div className="row">
                                        <EmailField name="email"
                                                    size="12"
                                                    value=""
                                                    label="Your email address"
                                                    placeholder=""
                                                    classes="pgs-sign-inputs"
                                                    onInputChange={this.elementChangeHandler}
                                                    required={true}
                                                    validate={this.state.invalidElements.email} />
                                    </div>
                                    <div className="row">
                                        <PasswordField name="password"
                                                       size="6"
                                                       value=""
                                                       label="Password"
                                                       placeholder=""
                                                       classes="pgs-sign-inputs"
                                                       required={true}
                                                       onInputChange={this.elementChangeHandler}
                                                       validate={this.state.invalidElements.password}
                                                       compareWith={this.state.formData.confPassword}/>
                                        <PasswordField name="confPassword"
                                                       size="6"
                                                       value=""
                                                       label="Confirm Password"
                                                       placeholder=""
                                                       classes="pgs-sign-inputs"
                                                       required={true}
                                                       onInputChange={this.elementChangeHandler}
                                                       validate={this.state.invalidElements.confPassword}
                                                       compareWith={this.state.formData.password}/>
                                    </div>
                                    {this.state.validateAlert ? <p className="form-validation-alert" style={errorStyles} >{this.state.validateAlert}</p> : null}
                                    <div className="row">
                                        <Button type="reset" size="6" classes="pgs-sign-submit-cancel" value="cancel" />
                                        <Button type="submit" size="6" classes="pgs-sign-submit" value="next" />
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


module.exports = Signup;
