//InputField
import React from 'react';
export default class InputField extends React.Component{
	render() {
		let size = "col-xs-" + this.props.size;

		return (
			<div className={size}>
				<p>{this.props.label}</p>
				<input type={this.props.type} placeholder={this.props.placeholder} className={this.props.classes} />
			</div>
		);
	}
}