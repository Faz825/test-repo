import React from 'react'
import SignupLayout from './layout/SignupLayout'
import DefaultLayout from './layout/DefaultLayout'
import Session  from '../middleware/Session';

class Main extends React.Component {

	constructor(props) {
		super(props);

	}
    layoutSelector() {

        if (Session.isSessionSet('prg_lg')) {
            return (
							<DefaultLayout>
								{this.props.children}
							</DefaultLayout>
            )

        }else{
            return (
							<SignupLayout>
								{this.props.children}
							</SignupLayout>

            )
        }
    }

    render() {
        return this.layoutSelector();

    }
}

module.exports = Main
