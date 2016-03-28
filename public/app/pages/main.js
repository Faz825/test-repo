import React from 'react'
import SignupLayout from './layout/SignupLayout'
import DefaultLayout from './layout/DefaultLayout'
import Session  from '../middleware/Session';
import Chat  from '../middleware/Chat';
import Signup  from './signup/Signup';

class Main extends React.Component {

	constructor(props) {

        super(props);

        if (Session.isSessionSet('prg_lg')) {
            Chat.bit6Auth(false);
        }

    }

    layoutSelector() {


        if (Session.isSessionSet('prg_lg')) {
            return (
                    <DefaultLayout>
                        {this.props.children }
                    </DefaultLayout>
            )

        }else{
            return (
                    <SignupLayout>
                        {this.props.children ||<Signup />}
                    </SignupLayout>

            )
        }
    }

    render() {
        return this.layoutSelector();

    }
}


module.exports = Main;
