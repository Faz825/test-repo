import React from 'react'
import InputField from '../../components/elements/InputField'
import Button from '../../components/elements/Button'

class Signup extends React.Component {

    constructor(props) {
        super(props);
        this.state= {
            formData:{},
            signupURL:'/auth/doSignUp'
        };
        this.elementChangeHandler = this.elementChangeHandler.bind(this)
        
    }

    validateForm(e){
        e.preventDefault();

        $.ajax({
            url: this.state.signupURL,
            method: "POST",
            data: this.state.formData,
            dataType: "JSON"
        }).done(function( msg ) {
            console.log( msg );
        }).fail(function( jqXHR, textStatus ) {
          alert( "Request failed: " + textStatus );
        });

    }

    elementChangeHandler(key,data){
        
        let _formData = this.state.formData;
        _formData[key]=data;
  

        this.setState({formData:_formData});
    
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

                                        <InputField type="text" name="fName" size="6" label="First Name" placeholder="Soham" classes="pgs-sign-inputs" textChange={this.elementChangeHandler} />

                                        <InputField type="text" name="lName" size="6" label="Last Name" placeholder="Khaitan" classes="pgs-sign-inputs" textChange={this.elementChangeHandler} />
                                    </div>
                                    <div className="row">
                                        <InputField type="email" name="email" size="12" label="Your email address" placeholder="sohamkhaitan@gmail.com" classes="pgs-sign-inputs" textChange={this.elementChangeHandler}/>
                                    </div>
                                    <div className="row">
                                        <InputField type="password" name="password" size="6" label="Password" placeholder="••••••••••" classes="pgs-sign-inputs" textChange={this.elementChangeHandler} />
                                        <InputField type="password" name="confPassword" size="6" label="Confirm Password" placeholder="••••••••••" classes="pgs-sign-inputs" textChange={this.elementChangeHandler} />
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