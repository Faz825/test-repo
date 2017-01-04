/**
 * This class will handle back-end calls & other functions related to call center
 */

import Socket from './Socket';
import Session from '../middleware/Session';
import {Config} from '../config/Config';

class CallCenter {

    constructor() {
        this.socket = Socket.socket;

        var bit6Opts = {'apikey': Config.BIT6_API_KEY};
        this.b6 = new bit6.Client(bit6Opts);
    }

    initBit6(b6) {
        var _this = this;

        bit6Auth(false);

        function bit6Auth(isNewUser) {
            if (Session.getSession('prg_lg') != null) {
                var oUser = Session.getSession('prg_lg');

                if (b6.session.authenticated) {
                    b6.session.displayName = oUser.first_name + " " + oUser.last_name;
                    return true;
                }

                // Convert username to an identity URI

                var ident = _this.getBit6Identity(oUser);
                var pass = 'proglobe_' + oUser.id;

                // Call either login or signup function
                var fn = isNewUser ? 'signup' : 'login';
                b6.session[fn]({'identity': ident, 'password': pass}, function (err) {
                    if (err) {
                        bit6Auth(true);
                    }
                    else {
                        b6.session.displayName = oUser.first_name + " " + oUser.last_name;
                        return true;
                    }
                });
            }
        }
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