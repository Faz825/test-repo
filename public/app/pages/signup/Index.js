import React from 'react';
import Session  from '../../middleware/Session';
import Signup from './Signup';
import SelectSecretary from './SelectSecretary';


class Index extends React.Component {

	constructor(props) {
		super(props);
		
		this.state={
			signupFormData:{},
			signupURL:'/doSignup'
		};
		this.onNextStep = this.onNextStep.bind(this);
		this.onPreviousStep = this.onPreviousStep.bind(this);
	
        
	}

	onNextStep(formData){
		let _frmData = this.state.signupFormData;
			_frmData = Object.assign({}, _frmData, formData);
		this.setState({signupFormData: _frmData}, function () {
		    this.loadNextStep()
		    this.submitData();
		});
	}
	onPreviousStep(){
		this.loadPreviousStep()
	}

	loadNextStep(){
		let _frmData = this.state.signupFormData;
			_frmData.status = _frmData.status+1;
		this.setState({_frmData: _frmData})
	}

	loadPreviousStep(){
		let _frmData = this.state.signupFormData;
			_frmData.status = _frmData.status-1;
		this.setState({_frmData: _frmData})
	}
	submitData(){
		if(this.state.signupFormData.status > 2){
			
		}
		
	}

	showSteps(){
		
		switch(this.state.signupFormData.status){
			case 2:
				return (<Secretary onNextStep ={this.onNextStep} onPreviousStep = {this.onPreviousStep}/>);
			case 1:
				return (<Signup onNextStep ={this.onNextStep}/>);
			case 3:
				return  (<Secretary onNextStep ={this.onNextStep} onPreviousStep = {this.onPreviousStep}/>);
			default:
				return (<Signup onNextStep ={this.onNextStep}/>);
		}
	}

	render() {
		
		return this.showSteps()
	    
	}

		

}



module.exports = Index;