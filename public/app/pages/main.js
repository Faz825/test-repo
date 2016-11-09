import React from 'react'
import SignupLayout from './layout/SignupLayout'
import DefaultLayout from './layout/DefaultLayout'
import AmbiLayout from './layout/AmbiLayout'
import Session  from '../middleware/Session';
import Signup  from './signup/Signup';


class Main extends React.Component {

	constructor(props) {
        super(props);
        this.state = {
            verify: false
        }

        this.loggedUser= Session.getSession('prg_lg');
        //this.verifyUser();
    }


    componentDidMount() {
        if (this.loggedUser) {
            console.log('/verify/me calling');
            $.ajax({
                url: '/verify/me',
                method: "GET",
                dataType: "JSON",
                headers: { 'prg-auth-header':this.loggedUser.token }
            }).done( function (data, text) {
                console.log(data);
                if(data.status.code == 200){
                    this.setState({verify: true});
                }
            }.bind(this));
        }
    }


    layoutSelector() {


        if (this.loggedUser && this.state.verify === true) {
            return (
                    // <DefaultLayout>
                    <AmbiLayout>
                        {this.props.children}
                    </AmbiLayout>
            )

        } else {
            return (
                    <SignupLayout>
                        {this.props.children ||<Signup />}
                    </SignupLayout>
            )
        }
    }

    verifyUser(){
        if (this.loggedUser) {
            $.ajax({
                url: '/verify/me',
                method: "GET",
                dataType: "JSON",
                headers: { 'prg-auth-header':this.loggedUser.token }
            }).done( function (data, text) {
                console.log(data);
                if(data.status.code == 200){
                    this.setState({verify: true});
                }
            }.bind(this));
        }
    }

    render() {
        return this.layoutSelector();

    }
}


module.exports = Main;
