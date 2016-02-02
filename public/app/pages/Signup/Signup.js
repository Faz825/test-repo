import React from 'react'
import InputField from '../../components/elements/InputField'

class Signup extends React.Component {

	render(){

		return (
			<div className="row row-clr pgs-middle-sign-wrapper">
            	<div className="container">
                    <div className="col-xs-8 pgs-middle-sign-wrapper-inner">
                        <div className="row row-clr pgs-middle-sign-wrapper-inner-cover">
                        	<h2>Let’s create your account</h2>
                            <div className="row row-clr pgs-middle-sign-wrapper-inner-form">
                                <form method="get" action="/choose-secretary">
                                    <div className="row">

                                        <InputField type="text" size="6" label="First Name" placeholder="Soham" classes="pgs-sign-inputs" />

                                        <InputField type="text" size="6" label="Last Name" placeholder="Khaitan" classes="pgs-sign-inputs" />

                                    </div>
                                    <div className="row">
                                        <InputField type="email" size="12" label="Your email address" placeholder="sohamkhaitan@gmail.com" classes="pgs-sign-inputs" />
                                    </div>
                                    <div className="row">
                                        <InputField type="password" size="6" label="Password" placeholder="••••••••••" classes="pgs-sign-inputs" />
                                        <InputField type="password" size="6" label="Confirm Password" placeholder="••••••••••" classes="pgs-sign-inputs" />
                                    </div>
                                    <div className="row">
                                        <div className="col-xs-6">
                                            <input type="reset" className="pgs-sign-submit-cancel" value="cancel"/>
                                        </div>
                                        <div className="col-xs-6">
                                            <input type="submit" className="pgs-sign-submit" value="next"/>
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