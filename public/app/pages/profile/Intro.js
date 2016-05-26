/*
* Component to show user intro
*/
import React from 'react';
import Session  from '../../middleware/Session';

export default class Intro extends React.Component{
    constructor(props){
        super(props);

        this.state={
            loggedUser:Session.getSession('prg_lg'),
            isFormVisible : false,
            introText : ""
        }
    }

    openForm(){
        this.setState({isFormVisible : true});
    }

    onFormCancel(){
        this.setState({isFormVisible : false});
    }

    onFormSave(data){
        this.setState({isFormVisible : false, introText : data});
        console.log(data);
    }

    render(){
        let read_only = (this.state.loggedUser.id == this.state.data.user_id)?false:true;
        return (
            <div className="ps-section">
                <div className="pg-section-container">
                    <div className="pg-header">
                        <h3>Intro</h3>
                    </div>
                    <div className="intro-wrapper">
                        {
                            (!(this.state.isFormVisible || this.state.introText))?
                            <div className="add-intro clearfix">
                                <p className="add-intro-text" onClick={this.openForm.bind(this)}><i className="fa fa-plus"></i>Describe who you are</p>
                            </div>
                            :
                            null
                        }
                        {
                            (this.state.introText && !this.state.isFormVisible)?
                            <div className="intro-holder">
                                <p>{this.state.introText}<i className="fa fa-pencil-square-o" onClick={this.openForm.bind(this)}></i></p>
                            </div>
                            :
                            null
                        }
                        {
                            (this.state.isFormVisible)?
                            <IntroForm introText={this.state.introText} onFormClose={this.onFormCancel.bind(this)} formSave={this.onFormSave.bind(this)} />
                            :
                            null
                        }
                    </div>
                </div>
            </div>
        )
    }
}

export class IntroForm extends React.Component{
    constructor(props){
        super(props);
        this.maxCharLength = 120;
        let inputValue = (this.props.introText)? this.props.introText : "";
        let charLength = this.maxCharLength - inputValue.length;

        this.state={
            value : inputValue,
            charLength : charLength
        }
    }

    onFieldUpdate(e){
        let value = e.target.value,
            charLen = value.length,
            maxLength = this.maxCharLength;

        if (charLen <= maxLength) {
            let char = maxLength - charLen;

            this.setState({value : value, charLength : char});
        }
    }

    onFormSave(e){
        e.preventDefault();
        this.props.formSave(this.state.value);
    }

    render() {
        return (
            <div className="intro-form-holder">
                <form onSubmit={this.onFormSave.bind(this)}>
                    <div className="form-group">
                        <textarea className="form-control" value={this.state.value} onChange={this.onFieldUpdate.bind(this)} placeholder="Describe who you are"></textarea>
                    </div>
                    <div className="form-bottom-holder clearfix">
                        <div className="char-length-holder">
                            <span>{this.state.charLength}</span>
                        </div>
                        <div className="button-holder">
                            <button type="button" className="btn btn-default pg-btn-custom" onClick={this.props.onFormClose}>Cancel</button>
                            <button type="submit" className="btn btn-primary pg-btn-custom">Save</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}
