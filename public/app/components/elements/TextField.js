/**
 * Text Field Component
 */
import React from 'react';
export default class  TextField extends React.Component{
    constructor(props) {
        super(props);

        let defaultText = (this.props.defaultVal) ? this.props.defaultVal : "";
        this.state = {valueTxt: defaultText};


    }
    componentDidMount(){

    }
    elementChangeHandler(event){
        this.setState({valueTxt:event.target.value});
        if(event.target.value != ""){
            this.props.onInputChange(this.props.name,event.target.value,true)
        }else{
            this.props.onInputChange(this.props.name,event.target.value,false)
        }

    }

    render(){

        let size = "input-field col-xs-" + this.props.size;
        let isValid = (typeof this.props.validate == 'undefined')?true:false;
        let errorStyles = {
            color         : "#ed0909",
            fontSize      : "0.8em",
            textTransform : "capitalize",
            margin        : '10px 0 0',
            display       : "inline-block"
        }
        let opts = {};

        if (!isValid) {
            opts['style'] = {"borderColor" : "#ed0909"};
        }
        return (
            <div className={size}>

                <p>{this.props.label} {this.props.required ? <span style={{"color": "#ed0909"}}>*</span> : ""} </p>

                <input type="text"
                   name={this.props.name}
                   value={this.state.valueTxt}
                   placeholder={this.props.placeholder}
                   className={this.props.classes}
                   onChange={(event)=>{ this.elementChangeHandler(event)}}
                   onBlur={(event)=>{ this.elementChangeHandler(event)}}
                    {...opts}  />
                {(!isValid)? <span className="invalid-msg" style={errorStyles}>{this.props.validate.message}</span> : null}
            </div>
        );
    }

};