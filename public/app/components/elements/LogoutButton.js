import React from 'react';
import Session  from '../../middleware/Session';

export default class LogoutButton extends React.Component{
	constructor(props){
		super(props);

		this.onButtonClick = this.onButtonClick.bind(this);
	}
	
	onButtonClick(){
		Session.destroy('prg_lg');
		location.reload();
	}

	render() {
		return (
            <a href="#" className="pgs-main-btn-login" onClick={this.onButtonClick}>{this.props.value}</a>
		);
	}
}
