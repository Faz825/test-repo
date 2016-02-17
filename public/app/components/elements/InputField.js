import React from 'react';
import {Alert} from '../../config/Alert';

let errorStyles = {
	color         : "#ed0909",
	fontSize      : "0.8em",
	textTransform : "capitalize",
	margin        : '10px 0 0',
	display       : "inline-block"
}

export default class InputField extends React.Component{

	constructor(props) {
		super(props);
		let defaultText = (this.props.value) ? this.props.value : "";
		this.state = {valueTxt: defaultText};
	}

	handleChange(e) {
		let status;

		this.setState({valueTxt: e.target.value});

		if(this.props.required){
			if(e.target.value.length != 0 ){
				status = "valid";
			}else{
				status = "invalid";
			}
		}else{
			status = "";
		}

		this.props.textChange(this.props.name,e.target.value,status);
	}

	handleBlur(e){
		let value = e.target.value;

		if(value.length > 0){

			if(this.props.type == "text"){
				if(value.length > 0){
					this.setState({validate: ""});
				}
			}

			if(this.props.type == "password"){
				if(value.length <=6){
					this.setState({validate: Alert.PASSWORD_LENGTH_ERROR});
				}else{
					this.setState({validate: ""});
				}
			}

			if(this.props.type == "email"){
				var regx = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

				if(!regx.test(value)){
					this.setState({validate: Alert.INVALID_EMAIL});
				}else{
					this.setState({validate: ""});
				}
			}

		}else{

			if(this.props.required){
				this.setState({validate: Alert.FILL_EMPTY_REQUIRED_FIELDS});
			}else{
				this.setState({validate: ""});
			}
		}

	}

	render() {
		let size = "input-field col-xs-" + this.props.size;

		let opts = {};
        if (this.state.validate) {
            opts['style'] = {"borderColor" : "#ed0909"};
        }

		return (
			<div className={size}>
				<p>{this.props.label} {this.props.required ? <span style={{"color": "#ed0909"}}>*</span> : ""} </p>

				<input type={this.props.type}
					name={this.props.name}
					value={this.state.valueTxt}
					placeholder={this.props.placeholder}
					className={this.props.classes}
					onChange={this.handleChange.bind(this)}
					onBlur={this.handleBlur.bind(this)}
					{...opts}  />

				{this.state.validate ? <span className="invalid-msg" style={errorStyles}>{this.state.validate}</span> : null}

			</div>
		);
	}
}
