//EstablishConnectionButton
import React from 'react';

export default class EstablishConnectionButton extends React.Component{
	constructor(props){
		super(props);
		this.state = {clicked: false, value: this.props.value};


	}

	respond(event){

        if (this.state.clicked) {
            this.props.click(false);
            this.setState({clicked:false});

        }else{
            this.props.click(true);
            this.setState({clicked:true});
        }



	}

	render() {
		let size = " col-xs-" + this.props.size;
    	let classes = this.props.classes + size;

    	let opts = {},
            text = this.state.value ;
        if (this.state.clicked) {
            opts['style'] = {"background" : "#73ad21"};
            text = "Connected" ;
        }else{
            opts['style'] = {"background" : "#61b3de"};
            text = this.state.value ;
            text = "Connect" ;
		}

		return (
			<div className={classes}>
            	<a href={this.props.link} className={this.props.extraClasses} onClick={(event) => this.respond(event)} {...opts} >{text}</a>
            </div>
		);
	}
}