//SelectDateDropdown
import React from 'react';

export default class SelectDateDropdown extends React.Component{
	constructor(props) {
        super(props);
        this.state = {
			date:{}
        };
        
        this.dateUpdate = this.dateUpdate.bind(this);
    }

    getDateFormat(){
    	let dateFormat = this.props.dateFormat.split("-");

    	return dateFormat;
    }

	dateUpdate(key,value){
		let dateFormat = this.getDateFormat();

		let _date = this.state.date;

        _date[key] = value;
        this.setState({date:_date});

		if(Object.keys(this.state.date).length == 3){
			let _fData = this.state.date[dateFormat[0]]+"-"+this.state.date[dateFormat[1]]+"-"+this.state.date[dateFormat[2]];

			if(this.props.required){
				status = "valid";
			}else{
				status = "";
			}

			this.props.optChange("dob", _fData, status);
		}
 		
	}

	render(){
		let dateFormat = this.getDateFormat();

		return(
			<div className="col-xs-5">
            	<p>{this.props.title}</p>
                <div className="row row-clr">
                    <Dropdown fieldName={dateFormat[0]} dateChange={this.dateUpdate.bind(this)} />
                    <Dropdown fieldName={dateFormat[1]} dateChange={this.dateUpdate.bind(this)} />
                    <Dropdown fieldName={dateFormat[2]} dateChange={this.dateUpdate.bind(this)} />
                </div>
            </div>
		);
	}
}

class Dropdown extends React.Component{
	constructor(props) {
        super(props);

        this.selectChange = this.selectChange.bind(this);
    }

    selectChange(e){
		this.props.dateChange(this.props.fieldName,e.target.value);
    }
    
	render(){
		let start;
        let end;
		let options = [];
		let fieldName = this.props.fieldName;


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


		for(let i = start; i <= end; i++){
			i = (i < 10 ? '0'+ i : i);
			options.push(i);
		}

		return(
			<div className="pgs-sign-select-about-col">
                <select name={this.props.fieldName} className="pgs-sign-select" onChange={this.selectChange.bind(this)}>
                    {options.map(function(opt, i){
				        return <option value={opt} key={i}>{opt}</option>;
				    })}
                </select>
            </div>
		);
	}
}