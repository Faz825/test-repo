import React from 'react';
import Session  from '../../middleware/Session';
import Signup from './Signup';
import SelectSecretary from './SelectSecretary';
import AboutYou from './AboutYou';

class Index extends React.Component {

	constructor(props) {
		super(props);
		
		this.state={
			step:1,
            userData:{},
            signupURL:"/doSignup"
		};
		this.onNextStep = this.onNextStep.bind(this);
		this.onPreviousStep = this.onPreviousStep.bind(this);


	}
	componentDidMount() {

		if(Session.isSessionSet('prg_lg')){
            let ses_user = Session.getSession('prg_lg')
            this.setState({userData: ses_user}, function () {
                this.loadNextStep()
            });
		}
	}
	onNextStep(data){
        let _data = this.state.userData;
        let _frmData = Object.assign(_data,data);
		this.setState({userData: _frmData}, function () {
		    this.loadNextStep();



		});
	}
	onPreviousStep(){
		this.loadPreviousStep()
	}

	loadNextStep(){
		let _sesUser = this.state.userData;
        let _step =  _sesUser.status+1;

        this.setState({step:_step});
	}

	loadPreviousStep(){
		let _frmData = this.state.signupFormData;
			_frmData.status = _frmData.status-1;
		this.setState({_frmData: _frmData})
	}

    saveFormData(){
        console.log(this.state.userData);



    }


	showSteps(){

		switch(this.state.step){
            case 1:
                return (<Signup onNextStep ={this.onNextStep}/>);
			case 2:
				return (<SelectSecretary onNextStep ={this.onNextStep} onPreviousStep = {this.onPreviousStep}/>);
			case 3:
				return  (<AboutYou onNextStep ={this.onNextStep} onPreviousStep = {this.onPreviousStep}/>);
			default:
				return (<Signup onNextStep ={this.onNextStep}/>);
		}
	}

	render() {
		
		return this.showSteps()
	    
	}

		

}



module.exports = Index;