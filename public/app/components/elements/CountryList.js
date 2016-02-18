import React from 'react'
import {Countries} from '../../service/Countries'

export default class CountryList extends React.Component{
	constructor(props) {
        super(props);
				let defaultOption = (this.props.defaultOpt) ? this.props.defaultOpt : "";

				this.state = {defaultOpt: defaultOption}
        this.selectChange = this.selectChange.bind(this);
        this.state={
            defaultValue:this.props.defaultValue
        }
    }

    selectChange(e){

        this.setState({defaultOpt: e.target.value});

    	if(this.props.required){
				if(e.target.value.length != 0 ){
					status = "valid";
				}else{
					status = "invalid";
				}
			}else{
				status = "";
			}

		this.props.optChange("country",e.target.value,status);

    }

		componentDidMount(){
			if(this.state.defaultOpt){
				this.props.optChange("country",this.state.defaultOpt,"valid");
			}
		}

	render(){


		return(
			<div className="col-xs-5">
	            <p>Country {this.props.required ? <span style={{"color": "#ed0909"}}>*</span> : ""}</p>
	            <select name="country"
                        className="pgs-sign-select"
                        value={this.state.defaultOpt}
                        onChange={this.selectChange.bind(this)}>

	            	{Countries.map(function(country, i){
						return <option value={country.key}
                                       key={i}
                                         >
                            {country.name}</option>;
	            	})}
	            </select>
            </div>
		);
	}
}
