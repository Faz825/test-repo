import React from 'react'

class Signup extends React.Component {
    onSubmit(){
        console.log("resdasd")
    }


	render(){

		return (
			<div className="row row-clr pgs-middle-sign-wrapper">
            	<div className="container">
                    <div className="col-xs-8 pgs-middle-sign-wrapper-inner">
                        <div className="row row-clr pgs-middle-sign-wrapper-inner-cover">
                        	<h2>Let’s create your account</h2>
                            
                            <div className="row row-clr pgs-middle-sign-wrapper-inner-form">
                                <form action={this.props.submitTo} 
                                    name="Signup" method={this.props.method} 
                                    onSubmit={this.formSubmitHandler} noValidate="novalidate">
                                    <div className="row">
                                        <div className="col-xs-6">
                                            <p>First Name</p>
                                            <input type="text" placeholder="Soham" className="pgs-sign-inputs"/>
                                        </div>
                                        <div className="col-xs-6">
                                            <p>Last Name</p>
                                            <input type="text" placeholder="Khaitan" className="pgs-sign-inputs"/>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-xs-12">
                                            <p>Your email address</p>
                                            <input type="email" placeholder="sohamkhaitan@gmail,com" className="pgs-sign-inputs"/>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-xs-6">
                                            <p>Password</p>
                                            <input type="password" placeholder="••••••••••" className="pgs-sign-inputs"/>
                                        </div>
                                        <div className="col-xs-6">
                                            <p>Confirm Password</p>
                                            <input type="password" placeholder="••••••••••" className="pgs-sign-inputs"/>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-xs-6">
                                            <input type="reset" className="pgs-sign-submit-cancel" value="cancel"/>
                                        </div>
                                        <div className="col-xs-6">
                                            <input type="button" className="pgs-sign-submit" value="next" onClick={this.onSubmit}/>
                                        </div>
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