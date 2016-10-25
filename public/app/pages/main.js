import React from 'react'
import SignupLayout from './layout/SignupLayout'
import DefaultLayout from './layout/DefaultLayout'
import AmbiLayout from './layout/AmbiLayout'
import Session  from '../middleware/Session';
import Signup  from './signup/Signup';


class Main extends React.Component {

	constructor(props) {
        super(props);

    }


    layoutSelector() {


        if (Session.isSessionSet('prg_lg')) {
            return (
                    // <DefaultLayout>

                    // </DefaultLayout>
                    <AmbiLayout>
                        {this.props.children}
                    </AmbiLayout>
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
