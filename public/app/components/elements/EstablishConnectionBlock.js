//establishConnectionBlock
import React from 'react'
import EstablishConnectionButton from './EstablishConnectionButton'

export default class establishConnectionBlock extends React.Component {
	constructor(props) {
		super(props);
		this.state = {active: ""};

		this.clickState = this.clickState.bind(this);
	}

	clickState(value){
		console.log(value);
		
		this.setState({active: "connected"});
	}

	render() {
		return (
			<div className={"row row-clr pgs-establish-connection-box " + this.state.active}>
	        	<div className="row">
	            	<div className="col-xs-2 pgs-establish-pro-pic">
	                	<img src={this.props.imgLink} alt={this.props.name} className="img-responsive"/>
	                </div>
	                <div className="col-xs-6 pgs-establish-pro-detail">
	                	<h3>{this.props.name}</h3>
	                    <p>{this.props.university}</p>
	                </div>
	                <EstablishConnectionButton size="4" classes="pgs-establish-pro-button" value="Connect" link={this.props.link} click={this.clickState} />
	            </div>
	        </div>
		);
	}
}