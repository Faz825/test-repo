/**
 * This class will handle back-end calls & other functions related to call center
 */

import Socket from './Socket';
import Session from '../middleware/Session';
import {Config} from '../config/Config';
import {CallChannel} from '../config/CallcenterStats';

let bit6Client = null;

class CallCenter {
    constructor() {
        if (!bit6Client) {
            bit6Client = new bit6.Client({'apikey': Config.BIT6_API_KEY});
        }
        this.b6 = bit6Client;
        this.bit6Auth();
        this.loggedUser = Session.getSession('prg_lg');
        this.socket = Socket.socket;
    }

    bit6Auth() {
        var authedUser = Session.getSession('prg_lg');

        if (authedUser) {
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
                        _this.b6.session.displayName = oUser.first_name + " " + oUser.last_name;

                        if (!_this.getBit6PrivateGroup(_this.b6.session.client.groups, authedUser)) {
                            var opts = {
                                meta: {
                                    title: 'private_group_' + authedUser.user_name,
                                    group_id: Config.BIT6_PRIVATE_GROUP_SLUG + '_' + authedUser.user_name
                                }
                            };

                            _this.createPrivateGroup(opts, function (groupRes) {
                                console.log(groupRes);
                            });
                        }

                        console.log(_this.b6.session);

                        return true;
                    }
                });
            }
        }
    }

    getContacts() {
        let _this = this;

        return $.ajax({
            url: '/contacts/all',
            method: "GET",
            dataType: "JSON",
            headers: {'prg-auth-header': _this.loggedUser.token}
        });
    }

    getCallRecords() {
        let _this = this;

        return $.ajax({
            url: '/call/get-records',
            method: "GET",
            dataType: "JSON",
            headers: {'prg-auth-header': _this.loggedUser.token}
        });
    }

    getGroupMembers(groupid) {
        let _this = this;

        return $.ajax({
            url: '/contact/group-members',
            method: "POST",
            data: {group_id: groupid},
            headers: {'prg-auth-header': _this.loggedUser.token}
        });
    }

    /**
     * @param ident - bit6 ident
     * @param pass - bit6 password
     * @param oUser - user object
     * **/
    bit6SignUp(ident, pass, oUser) {
        var _this = this;

        var authedUser = Session.getSession('prg_lg');

        this.b6.session['signup']({'identity': ident, 'password': pass}, function (err) {
            if (err) {
                return false;
            }
            else {
                _this.b6.session.displayName = oUser.first_name + " " + oUser.last_name;

                var opts = {
                    meta: {
                        title: 'private_group_' + authedUser.user_name,
                        group_id: Config.BIT6_PRIVATE_GROUP_SLUG + '_' + authedUser.user_name
                    }
                };

                _this.createPrivateGroup(opts, function (groupRes) {
                    console.log(groupRes);
                });

                return true;
            }
        });
    }

    /**
     * create private group for user
     * @param groupData - group params object
     * @param callBack - group creation callback
     * **/
    createPrivateGroup(groupData, callBack) {
        this.b6.createGroup(groupData, function (error, group) {
            if (error) {
                console.log('error', error);
                callBack({status: 400, error: error});
            } else {
                console.log('created group >>', group);
                callBack({status: 200, data: group});
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
     * get bit6 - private group_id of user
     * @params groups - bit6 groups of the user
     * @params user - authed user
     * **/

    getBit6PrivateGroup(groups, user) {
        for (var key in groups) {
            var group_id = groups[key].meta.group_id;

            if (group_id == Config.BIT6_PRIVATE_GROUP_SLUG + '_' + user.user_name) {
                return groups[key];
            }
        }
        return false;
    }

    /**
     * @param aContacts - multiple user-id's or single user-id
     * @param status - status of user (online,offline,work-mode)
     * */
    changeUserMode(oContact, status) {
        this.socket.emit('contacts status', {contact: oContact, status: status});
    }

    /**
     * @param oCall - bit6 incoming call object
     * **/
    getCallType(oCall) {
        if (oCall.options.audio && !oCall.options.video) {
            return CallChannel.AUDIO;
        } else if (oCall.options.audio && oCall.options.video) {
            return CallChannel.VIDEO;
        } else {
            return false;
        }
    }

    /**
     * @param oRecord - new call record with call status
     * **/
    addCallRecord(oRecord) {
        let _this = this;

        return $.ajax({
            url: '/call/add-record',
            method: "POST",
            data: {callRecord: oRecord},
            headers: {'prg-auth-header': _this.loggedUser.token}
        });
    }

    /**
     * @param oUserMode - change user mode - online, offline & work-mode
     * **/
    updateUserMode(oUserMode) {
        let _this = this;

        return $.ajax({
            url: '/me/update/user-mode',
            method: "POST",
            data: {userMode: oUserMode},
            headers: {'prg-auth-header': _this.loggedUser.token}
        });
    }
}

export default new CallCenter;