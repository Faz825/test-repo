import React from 'react'
import SignupHeader from '../components/header/SignupHeader'
import SigninHeader from '../components/header/SigninHeader'
import SignupIndex from '../pages/signup/Index';

import Session  from '../middleware/Session'; 


class Main extends React.Component { 

	constructor(props) {
		super(props);
	}
    layoutSelector() {

        if (Session.isSessionSet('prg_lg')) {
            return (
                <div className="row row-clr pg-full-wrapper">
                    <SigninHeader />
                    {this.props.children || <SignupIndex />}
                </div>


            )

        }else{
            return (
                <div>
                    <SignupHeader />
                    {this.props.children || <SignupIndex />}
                </div>
            )
        }
    }

    render() {
        return this.layoutSelector();

    }
}

module.exports = Main