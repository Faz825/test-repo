//EstablishConnectionButton
import React from 'react';

export default class EstablishConnectionButton extends React.Component{
	constructor(props){
		super(props);
		this.state = {clicked: "", value: this.props.value};

		this.respond = this.respond.bind(this);
	}

	respond(){
		this.props.click("clicked");
		this.setState({clicked: "clicked"});
		this.setState({value: "Connected"});
	}

	render() {
		let size = " col-xs-" + this.props.size;
    	let classes = this.props.classes + size;

    	let opts = {};
        if (this.state.clicked) {
            opts['style'] = {"background" : "#73ad21"};
        }

		return (
			<div className={classes}>
            	<a href={this.props.link} className={this.props.extraClasses} onClick={this.respond} {...opts} >{this.state.value}</a>
            </div>
		);
	}
}