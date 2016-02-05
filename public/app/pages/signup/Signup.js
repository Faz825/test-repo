import React from 'react'
import InputField from '../../components/elements/InputField'
import Button from '../../components/elements/Button'
import {Alert} from '../../config/Alert';

let errorStyles = {
    color         : "#ed0909",
    fontSize      : "0.8em",
    textTransform : "capitalize",
    margin        : '0 0 15px',
    display       : "inline-block"
}

class Signup extends React.Component {

    constructor(props) {
        super(props);
        this.state= {
            formData:{},
            validateAlert: "",
            signupURL:'/auth/doSignUp'
        };
        this.elementChangeHandler = this.elementChangeHandler.bind(this)
        this.clearValidations     = this.clearValidations.bind(this)
        
    }

    allInvalid(elements) { 
            for (var i in elements) {
                if (elements[i]["status"] == "invalid") return false;
            }
            return true;
    }

    validateForm(e){
        e.preventDefault();

        let formFieldData = this.state.formData;

        if(Object.keys(formFieldData).length != 5 ){

            this.setState({validateAlert: Alert.FILL_EMPTY_FIELDS});

        }else{

            if(this.allInvalid(formFieldData)){

                let pass = formFieldData.password.val;
                let confpass = formFieldData.confPassword.val;

                if(pass != confpass){
                    this.setState({validateAlert: Alert.PASSWORD_MISMATCH});
                }else{
                    this.setState({validateAlert: ""});

                    $.ajax({
                        url: this.state.signupURL,
                        method: "POST",
                        data: this.state.formData,
                        dataType: "JSON"
                    }).done(function( msg ) {
                        console.log( msg );
                    }).fail(function( jqXHR, textStatus ) {
                      alert( "Request failed: " + textStatus );
                    });

                }

            }else{
                this.setState({validateAlert: Alert.FILL_EMPTY_FIELDS});
            }

        }


    }

    elementChangeHandler(key,data,status){
        
        let _formData = this.state.formData;
        _formData[key] = {"val": data, "status": status };

        this.setState({formData:_formData});
    
    }

    clearValidations(){
        this.setState({validateAlert: ""});
    }


	render(){

		return (
			<div className="row row-clr pgs-middle-sign-wrapper">
            	<div className="container">
                    <div className="col-xs-8 pgs-middle-sign-wrapper-inner">
                        <div className="row row-clr pgs-middle-sign-wrapper-inner-cover">
                        	<h2>Let’s create your account</h2>
                            <div className="row row-clr pgs-middle-sign-wrapper-inner-form">
                                <form method="get" onSubmit={this.validateForm.bind(this)} onReset={this.clearValidations.bind(this)} >

                                    <div className="row">
                                        <InputField type="text" name="fName" size="6" label="First Name" placeholder="Soham" classes="pgs-sign-inputs" textChange={this.elementChangeHandler} />
                                        <InputField type="text" name="lName" size="6" label="Last Name" placeholder="Khaitan" classes="pgs-sign-inputs" textChange={this.elementChangeHandler} />
                                    </div>

                                    <div className="row">
                                        <InputField type="email" name="email" size="12" label="Your email address" placeholder="sohamkhaitan@gmail.com" classes="pgs-sign-inputs" textChange={this.elementChangeHandler}/>
                                    </div>

                                    <div className="row">
                                        <InputField type="password" name="password" size="6" label="Password" placeholder="••••••••••" classes="pgs-sign-inputs" textChange={this.elementChangeHandler} />
                                        <InputField type="password" name="confPassword" size="6" label="Confirm Password" placeholder="••••••••••" classes="pgs-sign-inputs" textChange={this.elementChangeHandler} />
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