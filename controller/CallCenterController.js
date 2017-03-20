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
                    var outPut = {};

                    if (r.status == 200) {
                        outPut = {status: ApiHelper.getMessage(200, Alert.SUCCESS)};
                        return res.status(200).json(outPut);
                    } else {
                        outPut = {status: ApiHelper.getMessage(400, Alert.ERROR)};
                        return res.status(400).json(outPut);
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
                        if (typeof aConns != 'undefined' && aConns.length > 0) {
                            var aAlphabet = [];

                            aConns.sort(function (a, b) {
                                var textA = a.first_name.toUpperCase();
                                var textB = b.first_name.toUpperCase();
                                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                            });

                            // for (var i = 0; i < aConns.length; i++) {
                            //     var first_letter = aConns[i].first_name[0].toUpperCase();

                            //     if (aAlphabet.indexOf(first_letter) == -1) {
                            //         aAlphabet.push(first_letter);
                            //     }
                            // }

                            aAlphabet.sort();

                            var aContacts = [];

                            for (var i = 0; i < aAlphabet.length; i++) {
                                aContacts.push({
                                    letter: aAlphabet[i],
                                    users: []
                                });
                            }

                            // for (var i = 0; i < aConns.length; i++) {
                            //     var first_letter = aConns[i].first_name[0].toUpperCase();

                            //     for (var x = 0; x < aContacts.length; x++) {
                            //         if (aContacts[x].letter == first_letter) {
                            //             // online status must be coming from Elastic Search.
                            //             aConns[i].onlineStatus = 1;
                            //             // contactType must be coming from Elastic Search.
                            //             aConns[i].contactType = 1;
                            //             aContacts[x].users.push(aConns[i]);
                            //         }
                            //     }
                            // }

                            callback(null, aContacts);
                        } else {
                            callback(null, []);
                        }
                    }
                ], function (error, aContacts) {
                    var outPut = {};

                    if (error) {
                        outPut.status = ApiHelper.getMessage(400, Alert.ERROR);
                        return res.status(400).json(outPut);
                    } else {
                        outPut.contacts = aContacts;
                        outPut.status = ApiHelper.getMessage(200, Alert.SUCCESS);
                        return res.status(200).json(outPut);
                    }
                });
            }
        }
        ,
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
                    var outPut = {};

                    if (oCallRes.status == 400) {
                        outPut.error = oCallRes.error;
                        outPut.status = ApiHelper.getMessage(400, Alert.ERROR);
                        return res.status(400).json(outPut);
                    } else {
                        outPut.call_reocrd = oCallRes.data;
                        outPut.status = ApiHelper.getMessage(200, Alert.SUCCESS);
                        return res.status(200).json(outPut);
                    }
                });
            }
            ,
            /**
             * get call center records
             * @param req
             * @param res
             */
            getCallRecords: function (req, res, next) {
                var CurrentSession = Util.getCurrentSession(req);

                var _cache_key = CallConfig.CACHE_PREFIX + CurrentSession.id.toString(),
                    _async = require('async');

                var query = {
                    q: req.query['q'],
                    index: _cache_key
                };

                _async.waterfall([
                    function searchCallRecords(callback) {
                        ES.search(query, function (esCallRecordsResult) {
                            var esCallRecords = esCallRecordsResult.result;

                            var aReceiverIds = [];

                            esCallRecords.forEach(function (oRecord) {
                                oRecord.receivers_list.forEach(function (oReceiver) {
                                    if (aReceiverIds.indexOf(oReceiver.user_id) == -1) {
                                        aReceiverIds.push(oReceiver.user_id);
                                    }
                                });
                            });

                            var aReceivers = [];

                            callback(null, aReceiverIds, aReceivers, esCallRecords);
                        });
                    }, function getReceivers(aReceiverIds, aReceivers, aCallRecords, callback) {
                        _async.each(aReceiverIds, function (receiverId, getReceiverCallback) {

                            var query = {
                                q: 'user_id:' + receiverId,
                                index: 'idx_usr'
                            };

                            ES.search(query, function (oUserResult) {
                                aReceivers.push(oUserResult.result[0]);
                                getReceiverCallback();
                            });

                        }, function (error) {
                            error ? callback(error) : callback(null, aReceivers, aCallRecords);
                        });
                    }, function prepareCallRecords(aReceivers, aCallRecords, callback) {
                        aCallRecords.forEach(function (oCallRecord) {
                            var aReceiverIds = [];

                            oCallRecord.receivers_list.forEach(function (oReceiver) {
                                aReceiverIds.push(oReceiver.user_id);
                            });

                            oCallRecord.receivers_list = [];

                            aReceivers.forEach(function (oReceiver) {
                                if (aReceiverIds.indexOf(oReceiver.user_id) != -1) {
                                    oCallRecord.receivers_list.push(oReceiver);
                                }
                            });
                        });

                        callback(null, aCallRecords);
                    }
                ], function (error, aCallRecords) {
                    var outPut = {};

                    if (error) {
                        outPut.error = error;
                        outPut.status = ApiHelper.getMessage(400, Alert.ERROR);
                        return res.status(400).json(outPut);
                    } else {
                        outPut.call_records = aCallRecords;
                        outPut.status = ApiHelper.getMessage(200, Alert.SUCCESS);
                        return res.status(200).json(outPut);
                    }
                });

            }
            ,

            /**
             * update call center records
             * @param req
             * @param res
             */
            updateCallRecord: function (req, res, next) {

            }
        }
    }
    ;

module.exports = CallCenterController;
