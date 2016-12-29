'use strict';

var async = require('async');

var Connection = require('mongoose').model('Connection');

var CallCenterController = {
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
        addCallRecord: function (req, res) {

        },

        /**
         * get call center records
         * @param req
         * @param res
         */
        getCallRecords: function (req, res) {
            var Call = require('mongoose').model('Call');
            var User = require('mongoose').model('User');
            var Upload = require('mongoose').model('Upload');
            var CurrentSession = Util.getCurrentSession(req);
            var _async = require('async');
            var UserId = Util.getCurrentSession(req).id;

            var RecordLists = [], resultData = [];
            var call_status = (typeof req.query.call_status != 'undefined' && req.query.call_status != null) ? req.query.call_status : null;

            _async.waterfall([
                function getRecords(callBack) {
                    Call.get({}, {}, function (err, result) {
                        callBack(null, result.records);
                    });
                },
                function getIndividualProfile(RecordObjects, callBack) {

                    if (typeof RecordObjects != undefined && RecordObjects.length > 0) {

                        _async.each(RecordObjects, function (RecordObject, callBack) {
                            var RecordList = RecordObject;
                            var receiversLists = RecordList['receivers_list'];
                            var profileDatas = [];

                            if (typeof receiversLists != undefined && receiversLists != null) {
                                _async.each(receiversLists, function (receiversList, callBack) {

                                    _async.waterfall([
                                        function getUserById(callBack) {
                                            var _search_param = {
                                                _id: receiversList.user_id
                                            };

                                            User.getUser(_search_param, {}, function (resultSet) {
                                                if (resultSet.status == 200) {
                                                    callBack(null, resultSet.user)
                                                }
                                            })
                                        },
                                        function getProfileImage(profileData, callBack) {

                                            if (typeof profileData != undefined && profileData != null) {
                                                Upload.getProfileImage(profileData.user_id.toString(), function (profileImageData) {
                                                    profileData['call_status'] = receiversList['call_status'];
                                                    if (profileImageData.status != 200) {
                                                        profileData['images'] = {
                                                            'profile_image': {
                                                                id: "DEFAULT",
                                                                file_name: "/images/default_profile_image.png",
                                                                file_type: ".png",
                                                                http_url: Config.DEFAULT_PROFILE_IMAGE
                                                            }

                                                        };
                                                    } else {
                                                        profileData['images'] = profileImageData.image;
                                                    }
                                                    profileDatas.push(profileData);
                                                    callBack(null);
                                                });

                                            } else {
                                                callBack(null);
                                            }
                                        }
                                    ], function (err) {
                                        callBack(null);
                                    });

                                }, function (err) {
                                    callBack(null);
                                });
                            }
                            RecordList['receiver_data'] = profileDatas;
                            RecordLists.push(RecordList);
                        }, function (err) {
                            callBack(null);
                        });

                    } else {
                        callBack(null);
                    }
                },
                function filterRecord(callBack) {
                    console.log(RecordLists);
                    console.log(call_status);

                    if (call_status != null) {

                        for (var i = 0; i < RecordLists.length; i++) {
                            var isCallStatus = false;
                            if (RecordLists[i] != null) {
                                var receive_List = RecordLists[i]['receivers_list'];

                                for (var x = 0; x < receive_List.length; x++) {
                                    if (receive_List[x] != null) {
                                        if (receive_List[x]['call_status'] == call_status) {
                                            isCallStatus = true;
                                        }
                                    }
                                }

                                if (isCallStatus == true) {
                                    resultData.push(RecordLists[i]);
                                }
                            }
                        }
                        // resultData = RecordLists;
                        callBack(null);

                    } else {
                        resultData = RecordLists;
                        callBack(null);
                    }
                }
            ], function (err) {
                var outPut = {};
                if (err) {
                    outPut['status'] = ApiHelper.getMessage(400);
                    res.status(400).send(outPut);
                } else {
                    outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                    outPut['records'] = resultData;
                    res.status(200).send(outPut);
                }
            });
        },

        /**
         * update call center records
         * @param req
         * @param res
         */
        updateCallRecord: function (req, res) {

        }
    }
}

module.exports = CallCenterController;
