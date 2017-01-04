/**
 * This class will handle back-end calls & other functions related to call center
 */

import Socket from './Socket';
import Session from '../middleware/Session';
import {Config} from '../config/Config';

var CallCenter = {
    socket: Socket.socket,
    b6: new bit6.Client({'apikey': Config.BIT6_API_KEY}),
    initBit6: function () {
        var _this = this;
        _this.bit6Auth(false);
    },
    bit6Auth: function bit6Auth(isNewUser) {
        if (Session.getSession('prg_lg') != null) {
            var _this = this;
            var oUser = Session.getSession('prg_lg');

            if (_this.b6.session.authenticated) {
                _this.b6.session.displayName = oUser.first_name + " " + oUser.last_name;
                return true;
            }

            // Convert username to an identity URI
            var ident = _this.getBit6Identity(oUser);
            var pass = 'proglobe_' + oUser.id;

            // Call either login or signup function
            var fn = isNewUser ? 'signup' : 'login';
            _this.b6.session[fn]({'identity': ident, 'password': pass}, function (err) {
                if (err) {
                    _this.bit6Auth(true);
                }
                else {
                    _this.b6.session.displayName = oUser.first_name + " " + oUser.last_name;
                    return true;
                }
            });
        }
    },
    getBit6Identity: function (oUser) {
        return Config.BIT6_IDENTITY_USER_SLUG + oUser.user_name;
    },
    contactsStatus: function (aContacts, status) {
        this.socket.emit('contacts status', {contacts: aContacts, status: status});
    }
};

export {CallCenter};