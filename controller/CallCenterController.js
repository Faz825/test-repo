'use strict';

var async = require('async');

var ES = require('../middleware/ES');
var Connection = require('mongoose').model('Connection');
var mUser = require('mongoose').model('User');
var mCall = require('mongoose').model('Call');

var CallCenterController = {
    me: {
        updateMode: function (req, res, next) {
            var CurrentSession = Util.getCurrentSession(req);

            var onlineMode = null;

            if (req.body.userMode == mUser.modes.ONLINE) {
                onlineMode = mUser.modes.ONLINE;
            } else if (req.body.userMode == mUser.modes.OFFLINE) {
                onlineMode = mUser.modes.OFFLINE;
            } else if (req.body.userMode == mUser.modes.WORK_MODE) {
                onlineMode = mUser.modes.WORK_MODE;
            } else {
                onlineMode = mUser.modes.OFFLINE;
            }

            mUser.saveUpdates(CurrentSession.id, {"onlineMode": onlineMode}, function (r) {
                var outPut = {
                    status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS)
                };

                if (r.status == 200) {
                    return res.status(200).json(outPut);
                } else {
                    outPut = {
                        status: ApiHelper.getMessage(200, Alert.ERROR, r.error)
                    };
                    return res.status(200).json(outPut);
                }
            });
        }
    },
    contact: {
        /**
         * Get all contacts - Connections
         * @param req
         * @param res
         * @param next
         * */
        getAll: function (req, res, next) {
            var CurrentSession = Util.getCurrentSession(req);
            var criteria = {
                user_id: CurrentSession.id,
                q: req.query['q']
            };

            async.waterfall([
                function (callback) {
                    Connection.getMyConnection(criteria, function (resultSet) {
                        callback(null, resultSet.results);
                    });
                },
                function (aConns, callback) {
                    var aAlphabet = [];

                    if (aConns.length > 0) {
                        aConns.sort(function (a, b) {
                            var textA = a.first_name.toUpperCase();
                            var textB = b.first_name.toUpperCase();
                            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                        });

                        for (var i = 0; i < aConns.length; i++) {
                            var first_letter = aConns[i].first_name[0].toUpperCase();

                            if (aAlphabet.indexOf(first_letter) == -1) {
                                aAlphabet.push(first_letter);
                            }
                        }

                        aAlphabet.sort();

                        var aContacts = [];
                        var aContactIds = [];

                        for (var i = 0; i < aAlphabet.length; i++) {
                            aContacts.push({
                                letter: aAlphabet[i],
                                users: []
                            });
                        }

                        for (var i = 0; i < aConns.length; i++) {
                            var first_letter = aConns[i].first_name[0].toUpperCase();

                            aContactIds.push(aConns[i].user_id);

                            for (var x = 0; x < aContacts.length; x++) {
                                if (aContacts[x].letter == first_letter) {
                                    // online status must be coming from Elastic Search.
                                    aConns[i].onlineStatus = 1;
                                    // contactType must be coming from Elastic Search.
                                    aConns[i].contactType = 1;
                                    aContacts[x].users.push(aConns[i]);
                                }
                            }
                        }

                    }


                    var outPut = {
                        status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                        contacts: aContacts
                    };

                    return res.status(200).json(outPut);
                }
            ], function (error) {
                return error ? console.log(error) : next(error);
            });
        }
    },
    call: {
        /**
         * add call center record
         * @param req
         * @param res
         */
        addCallRecord: function (req, res, next) {
            var oCallRecord = req.body.callRecord;

            var CurrentSession = Util.getCurrentSession(req);

            var oNewRecord = {
                user_id: CurrentSession.id,
                // should be support for both individual or group
                contact_type: oCallRecord.contact.contactType,
                call_channel: oCallRecord.callChannel,
                receivers_list: oCallRecord.targets,
                started_at: oCallRecord.dialedAt,
                call_status: mCall.callStatus.MISSED,
                call_type: mCall.callTypes.OUTGOING
            };

            mCall.addNew(oNewRecord, function (oCallRes) {
                if (oCallRes.status == 200) {
                    return res.status(200).json(oCallRes.data);
                }
            });
        },
        /**
         * get call center records
         * @param req
         * @param res
         */
        getCallRecords: function (req, res, next) {

        },

        /**
         * update call center records
         * @param req
         * @param res
         */
        updateCallRecord: function (req, res, next) {

        }
    }
}

module.exports = CallCenterController;
