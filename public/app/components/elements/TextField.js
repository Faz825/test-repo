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
    elementChangeHandler(event){
        this.setState({valueTxt:event.target.value});
        this.props.onInputChange(this.props.name,event.target.value)
    }

    render(){

        return (
            <input type="text"
                   name={this.props.name}
                   value={this.state.valueTxt}
                   placeholder={this.props.placeholder}
                   className={this.props.classes}
                   onChange={(event)=>{ this.elementChangeHandler(event)}}
                   onBlur={(event)=>{ this.elementChangeHandler(event)}}
                {...opts}  />
        );
    }

};