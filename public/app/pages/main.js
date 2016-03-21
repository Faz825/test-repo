import React from 'react'
import SignupLayout from './layout/SignupLayout'
import DefaultLayout from './layout/DefaultLayout'
import Session  from '../middleware/Session';

class Main extends React.Component {

	constructor(props) {

        super(props);

        if (Session.isSessionSet('prg_lg')) {

            var opts = {
                'apikey': '18j5x-sRBAbzhTW1ZD'
            };

            var b6 = new bit6.Client(opts);

            var bit6Auth = function (isNewUser) {
                // Convert username to an identity URI
                var ident = 'usr:proglobe_' + Session.getSession('prg_lg').user_name;
                var pass = 'proglobe_'+Session.getSession('prg_lg').id;
                // Call either login or signup function
                var fn = isNewUser ? 'signup' : 'login';
                console.log(isNewUser)
                b6.session[fn]({'identity': ident, 'password': pass}, function (err) {
                    if (err) {
                        bit6Auth(true);
                    }
                    else {
                        return true;
                    }
                });
            };

            bit6Auth(false);


            // Incoming call from another user
            b6.on('incomingCall', function(c) {
                console.log('Incoming call', c);
                //attachCallEvents(c);
                //$('#incomingCallFrom').text(b6.getNameFromIdentity(c.other) + ' is connecting...');
                //$('#incomingCall')
                //    .data({'dialog': c})
                //    .show();
            });

            // Got a real-time notification
            b6.on('notification', function(m) {
                console.log('demo got rt notification', m);
            });

        }

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


module.exports = Main;

