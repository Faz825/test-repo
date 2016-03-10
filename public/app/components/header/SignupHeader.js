/**
 * Header component for users who are not logged in
 */

import React from 'react';
import Img from '../elements/Img'
import { Link} from 'react-router'
import Logo from './Logo'
import {Alert} from '../../config/Alert';
import TextField from '../../components/elements/TextField'
export default class Header extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            invalidElements :{},
            error : {}
        }

        this.elementChangeHandler = this.elementChangeHandler.bind(this);
        this.validateSchema = {
                uname: "",
                password: ""
        };
        this.isValid = true;
        this.formData = {};
    }

    traversObject(){
        let _error = {};
        for(let elm in this.formData){

            if(elm == "uname" && this.formData[elm]==""){
                _error[elm] = Alert.EMPTY_USER_NAME;
            }

            if(elm == "password" && this.formData[elm].length < 6){
                _error[elm] = Alert.PASSWORD_LENGTH_ERROR;
            }
        }
       return _error;
    }

    elementChangeHandler(key,data,status){

        this.formData[key] = data;

        let er = this.traversObject();
        this.setState({error:er})

    }

    submitData(e){
        e.preventDefault();
        console.log(this.state.error);
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
                        console.log(data)
                        Session.createSession("prg_lg", data.user);
                        location.reload();
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

	render(){
		return(
            <div className="row row-clr pg-top-navigation">
                <div className="container-fluid pg-custom-container">
                    <div className="row">
                        <div className="col-xs-3 logoHolder">
                            <Logo url ="/images/logo.png" />
                        </div>
                        <div className="col-xs-5 pgs-main-nav-area">
                            <div className="row row-clr pgs-main-nav-area-inner">
                                <ul>
                                    <li>
                                        <Link to="/about">
                                            About Proglobe
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/how-it-works">
                                            How it works
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/the-team">
                                            The Team
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/contact-us">
                                            Contact us
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="col-xs-4 pgs-login-area">
                            <form onSubmit={this.submitData.bind(this)}>
                                <div className="form-group userNameHolder inputWrapper col-sm-4">
                                    <TextField  name="uname"
                                                size="12"
                                                value={this.formData.uname}
                                                label=""
                                                placeholder="USERNAME"
                                                classes="pgs-sign-inputs"
                                                onInputChange={this.elementChangeHandler}
                                                required={true}
                                                validate={this.state.invalidElements.uname}
                                                error_message={this.state.error.uname}/>
                                    <div className="checkbox">
                                        <input type="checkbox" id="rememberMe" />
                                        <label htmlFor="rememberMe">Remember Me</label>
                                    </div>
                                </div>
                                <div className="form-group passwordHolder inputWrapper col-sm-4">
                                    <TextField  name="password"
                                                size="12"
                                                value={this.formData.password}
                                                label=""
                                                placeholder="PASSWORD"
                                                classes="pgs-sign-inputs"
                                                onInputChange={this.elementChangeHandler}
                                                required={true}
                                                validate={this.state.invalidElements.password}
                                                error_message={this.state.error.password}/>
                                    <a href="#">Forgot Password?</a>
                                </div>
                                <div className="form-group btnHolder col-sm-3">
                                    <button type="submit" size="6" className="pgs-sign-submit">Login</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
		);
	}
}
