//SelectDateDropdown
import React from 'react';

export default class SelectDateDropdown extends React.Component{
	render(){
		let dateFormat = this.props.dateFormat;
		dateFormat = dateFormat.split("/");

		return(
			<div className="col-xs-5">
            	<p>{this.props.title}</p>
                <div className="row row-clr">
                    <Dropdown fieldName={dateFormat[0]} />
                    <Dropdown fieldName={dateFormat[1]} />
                    <Dropdown fieldName={dateFormat[2]} />
                </div>
            </div>
		);
	}
}

class Dropdown extends React.Component{
	render(){
		let start;
        let end;
		let fieldName = this.props.fieldName;
		let options = [];

		console.log(fieldName);

		switch(fieldName) {
		    case "mm":
		        start = "1";
		        end = "12";
		        break;
		    case "dd":
		        start = "1";
		        end = "31";
		        break;
		    case "yyyy":
		        start = "1991";
		        end = "2016";
		        break;
		} 

		console.log(start, end);

		for(let i = start; i <= end; i++){
			i = (i < 10 ? '0'+ i : i);
			options.push(i);
		}

		return(
			<div className="pgs-sign-select-about-col">
                <select name={this.props.fieldName} className="pgs-sign-select">
                    {options.map(function(opt, i){
				        return <option value={opt} key={i}>{opt}</option>;
				    })}
                </select>
            </div>
		);
	}
}