//Button
import React from 'react';

export default class Button extends React.Component{
	render(){
		let size = "button col-xs-" + this.props.size;

		return(
			<div className={size}>
                <input type={this.props.type} className={this.props.classes} value={this.props.value} />
            </div>
		)
	}
}