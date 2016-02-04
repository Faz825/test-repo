import React from 'react'
import InputField from '../../components/elements/InputField'
import Button from '../../components/elements/Button'

class Signup extends React.Component {

    constructor(props) {
        super(props);
        this.state = {formData: []};

        this.fnameChangeHandler = this.fnameChangeHandler.bind(this)
        this.lnameChangeHandler = this.lnameChangeHandler.bind(this)
    }

    validateForm(e){
        e.preventDefault();
        console.log( this.state.formData);
    }

    fnameChangeHandler(data){
        this.setState({
            formData:
                {'fname':data}
        });
        console.log(data)
    }

    lnameChangeHandler(data){
        this.setState({
            formData:
                {'lname':data}
        });
        console.log(data)
    }

    handleChange(e){
        
        console.log(  this.state.formData);
    }


	render(){

		return (
			<div className="row row-clr pgs-middle-sign-wrapper">
            	<div className="container">
                    <div className="col-xs-8 pgs-middle-sign-wrapper-inner">
                        <div className="row row-clr pgs-middle-sign-wrapper-inner-cover">
                        	<h2>Let’s create your account</h2>
                            <div className="row row-clr pgs-middle-sign-wrapper-inner-form">

                                <form method="get" onSubmit={this.validateForm.bind(this)} >

                                    <div className="row">

                                        <InputField type="text" name="fName" size="6" label="First Name" placeholder="Soham" classes="pgs-sign-inputs" textChange={this.fnameChangeHandler} />

                                        <InputField type="text" name="lName" size="6" label="Last Name" placeholder="Khaitan" classes="pgs-sign-inputs" textChange={this.lnameChangeHandler} />
                                    </div>
                                    <div className="row">
                                        <InputField type="email" name="email" size="12" label="Your email address" placeholder="sohamkhaitan@gmail.com" classes="pgs-sign-inputs" />
                                    </div>
                                    <div className="row">
                                        <InputField type="password" name="password" size="6" label="Password" placeholder="••••••••••" classes="pgs-sign-inputs" />
                                        <InputField type="password" name="confPassword" size="6" label="Confirm Password" placeholder="••••••••••" classes="pgs-sign-inputs" />
                                    </div>
                                    <div className="row">

                                        <Button type="reset" size="6" classes="pgs-sign-submit-cancel" value="cancel" />
                                        <Button type="submit" size="6" classes="pgs-sign-submit" value="next" />

                                    </div>
                                </form>    
                            </div>
                            
                        </div>
                    </div>
                </div>
            </div>
		)
	}


}


module.exports = Signup;