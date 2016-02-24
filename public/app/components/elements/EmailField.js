/**
 * Component for Email
 */

import React from 'react';
import {Alert} from '../../config/Alert';
export default class  EmailField extends React.Component{
    constructor(props) {
        super(props);

        let defaultText = (this.props.defaultVal) ? this.props.defaultVal : "";
        this.state = {valueTxt: defaultText,email_error_msg:""};


    }

    elementChangeHandler(event){
        this.setState({valueTxt:event.target.value});

        if(event.target.value != "" && this.isValidEmail(event.target.value)){
                this.props.onInputChange(this.props.name,event.target.value,true)
        }else{
            this.props.onInputChange(this.props.name,event.target.value,false)
        }

    }
    isValidEmail(email){
        var regx = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if(!regx.test(email)){
            this.setState({email_error_msg:Alert.INVALID_EMAIL})
            return false;
        }else{
            this.setState({email_error_msg:""})
            return true;
        }
    }
    render(){

        let size = "input-field col-xs-" + this.props.size;
        let isValid = (typeof this.props.validate == 'undefined')?true:false;
        let errorStyles = {
            color         : "#ed0909",
            fontSize      : "0.8em",
            textTransform : "capitalize",
            margin        : '10px 0 0',
            display       : "inline-block"
        }
        let opts = {};

        if (!isValid) {
            opts['style'] = {"borderColor" : "#ed0909"};
        }
        return (
            <div className={size}>

                <p>{this.props.label} {this.props.required ? <span style={{"color": "#ed0909"}}>*</span> : ""} </p>

                <input type="email"
                       name={this.props.name}
                       value={this.state.valueTxt}
                       placeholder={this.props.placeholder}
                       className={this.props.classes}
                       onChange={(event)=>{ this.elementChangeHandler(event)}}
                       onBlur={(event)=>{ this.elementChangeHandler(event)}}
                    {...opts}  />
                {(!isValid)? <span className="invalid-msg" style={errorStyles}>{this.props.validate.message}</span> : null}
            </div>
        );
    }

};