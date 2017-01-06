/**
 * This class will handle back-end calls & other functions related to call center
 */

import Socket from './Socket';
import Session from '../middleware/Session';
import {Config} from '../config/Config';

let bit6Client = null;

class CallCenter {
    constructor() {
        if (!bit6Client) {
            bit6Client = new bit6.Client({'apikey': Config.BIT6_API_KEY});
        }
        this.b6 = bit6Client;
        this.bit6Auth();
    }

    bit6Auth() {
        if (Session.getSession('prg_lg') != null) {
            var _this = this;
            var oUser = Session.getSession('prg_lg');

            if (this.b6.session.authenticated) {
                console.log('user already logged in');
                this.b6.session.displayName = oUser.first_name + " " + oUser.last_name;
            } else {
                // Convert username to an bit6 identity
                let ident = _this.getBit6Identity(oUser);
                let pass = 'proglobe_' + oUser.id;

                this.b6.session['login']({'identity': ident, 'password': pass}, function (err) {
                    if (err) {
                        console.log('sign-in error : ');
                        console.log(err);
                        _this.bit6SignUp(ident, pass, oUser);
                    } else {
                        console.log('logged in');
                        _this.b6.session.displayName = oUser.first_name + " " + oUser.last_name;
                        return true;
                    }
                });
            }
        }
    }

    /**
     * @param ident - bit6 ident
     * @param pass - bit6 password
     * @param oUser - user object
     * **/
    bit6SignUp(ident, pass, oUser) {
        var _this = this;

        this.b6.session['signup']({'identity': ident, 'password': pass}, function (err) {
            if (err) {
                return false;
            }
            else {
                _this.b6.session.displayName = oUser.first_name + " " + oUser.last_name;
                return true;
            }
        });
    }

    /**
     * @param oUser - logged user object
     * **/
    getBit6Identity(oUser) {
        return Config.BIT6_IDENTITY_USER_SLUG + oUser.user_name;
    }

    /**
     * @param aContacts - multiple user-id's or single user-id
     * @param status - status of user (online,offline,work-mode)
     * */
    contactsStatus(aContacts, status) {
        this.socket.emit('contacts status', {contacts: aContacts, status: status});
    }
}

export default new CallCenter;