//CountryList
import React from 'react'
import {Countries} from '../../service/Countries'

export default class CountryList extends React.Component{ 
	constructor(props) {
        super(props);
        this.selectChange = this.selectChange.bind(this);
    }

    selectChange(e){
		this.props.optChange("country",e.target.value);
    }

	render(){
		return(
			<div className="col-xs-5">
	            <p>Country</p>
	            <select name="country" className="pgs-sign-select" onChange={this.selectChange.bind(this)}>
	            	{Countries.map(function(country, i){
						return <option value={country.name} key={i}>{country.name}</option> 
	            	})};
	            </select>
            </div>
		); 
	}
}