import React from 'react';
import Button from '../../components/elements/Button';
import {Alert} from '../../config/Alert';
import Session  from '../../middleware/Session';
import EmailField from '../../components/elements/EmailField';

let errorStyles = {
    color         : "#ed0909",
    fontSize      : "0.8em",
    textTransform : "capitalize",
    margin        : '0 0 15px',
    display       : "inline-block"
}

export default class ForgotPassword extends React.Component{
    constructor(props) {
        super(props);
        this.state= {
            formData:{},
            error:{},
            signupURL:'/doSignup',
            validateAlert: "",
            invalidElements :{},
            fieldValue : ""
        };
        this.elementChangeHandler = this.elementChangeHandler.bind(this)
        this.validateSchema = {
                email: ""
        };
        this.isValid = true;
        this.formData = {};
    };

    submitData(e){
        e.preventDefault();
        let _this = this;
        let _invalid_frm = this.formData;
        for (let err_elm in this.validateSchema){
            if(!this.formData.hasOwnProperty(err_elm))
                this.formData[err_elm] = this.validateSchema[err_elm];
        }

        let er = this.traversObject();
        this.setState({error:er})

        if(Object.keys(er).length == 0){
            this.formData['status'] = 1;
            $.ajax({
                url: this.state.signupURL,
                method: "POST",
                data: this.formData,
                dataType: "JSON",

                success: function (data, text) {

                    if (data.status === 'success') {
                        _this.setState({validateAlert: ""});
                        console.log(data)
                        Session.createSession("prg_lg", data.user);
                        location.reload();
                    }

                },
                error: function (request, status, error) {

                    console.log(request.responseText);
                    console.log(status);
                    console.log(error);

                    _this.setState({validateAlert: Alert.EMAIL_ID_ALREADY_EXIST});
                }
            });
        }
    }

    isValidEmail(email){
        var regx = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return regx.test(email);
    }

    traversObject(){
        let _error = {};
        for(let elm in this.formData){

            if(elm == "email" && this.formData[elm] == "" ){
                _error[elm] = Alert.EMPTY_EMAIL_ID;
            }
        }
       return _error;
    }

    elementChangeHandler(key,data,status){
        this.formData[key] = data;

        let er = this.traversObject();
        this.setState({error:er})
    }

    render() {
        return (
            <div className="row row-clr pgs-middle-sign-wrapper forgotPassword">
            	<div className="container">
                    <div className="containerHolder">
                        <div className="col-xs-6 pgs-middle-sign-wrapper-inner">
                            <div className="row row-clr pgs-middle-sign-wrapper-inner-cover">
                            	<h2>forgot Password</h2>
                                <div className="introWrapper">
                                    <p>Enter your email address below and we’ll</p>
                                    <p>send you password reset instructions</p>
                                </div>
                                <div className="row row-clr pgs-middle-sign-wrapper-inner-form">
                                    <form method="get" onSubmit={this.submitData.bind(this)}>
                                        <div className="row">
                                            <EmailField name="email"
                                                        size="12"
                                                        value={this.formData.email}
                                                        label="Your email address"
                                                        placeholder=""
                                                        classes="pgs-sign-inputs"
                                                        onInputChange={this.elementChangeHandler}
                                                        required={true}
                                                        validate={this.state.invalidElements.email}
                                                        error_message={this.state.error.email}/>
                                        </div>
                                        {this.state.validateAlert ? <p className="form-validation-alert" style={errorStyles} >{this.state.validateAlert}</p> : null}
                                        <div className="row">
                                            <Button type="button" size="6" classes="pgs-sign-submit-cancel" value="cancel" />
                                            <Button type="submit" size="6" classes="pgs-sign-submit" value="send email" />
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
