/**
 * This is call center index component
 */

import React from 'react';
import ReactDom from 'react-dom';
import {Modal, ButtonToolbar, DropdownButton, MenuItem, Popover, OverlayTrigger} from 'react-bootstrap';
import Session from '../../middleware/Session';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import {CallChannel, CallType, CallStatus, UserMode, ContactType} from '../../config/CallcenterStats';
import ContactList from "./ContactList";
import RecentList from "./RecentList";
import StatusList from "./StatusList";
import CallModel from "./CallModel";
import CallCenter from '../../middleware/CallCenter';

export default class Index extends React.Component {
    constructor(props) {
        super(props);

        var loggedUser = Session.getSession('prg_lg');

        if (loggedUser == null) {
            window.location.href = "/";
        } else {
            this.b6 = CallCenter.b6;
        }

        this.state = {
            loggedUser: loggedUser,
            targetUser: null,
            inProgressCall: false,
            callMode: CallChannel.AUDIO,
            bit6Call: null,
            userContacts: [],
            callRecords: {all: [], missed: [], individual: [], groups: [], multi: []},
            userStatus: loggedUser.online_mode,
            activeMainCat: "",
            activeSubCat: "",
            showModal: false,
            minimizeBar: false,
            searchValue: "",
            isStatusVisible: false,
            activeTabData: null
        };

        // Call Record
        this.callRecord = {
            targets: []
        };

        // Get Contacts
        let _this = this;
        this.allContacts = [];

        CallCenter.getCallRecords().done(function (data) {
            if (data.status.code == 200) {
                _this.setState({recentCalls: _this.processCallRecords(data.call_records)});
                _this.setActiveTabData('recent', 'all');
            }
        });

        CallCenter.getContacts().done(function (data) {
            if (data.status.code == 200) {
                _this.setState({userContacts: data.contacts});
                
                for (var key in data.contacts) {
                    for (var subKey in data.contacts[key].users) {
                        let type = data.contacts[key].users[subKey].type;
                        if (type == ContactType.INDIVIDUAL) {
                            _this.allContacts.push(data.contacts[key].users[subKey]);
                        }
                    }
                }

            }
        });

        this.answerVideo = this.answerVideo.bind(this);
        this.answerAudio = this.answerAudio.bind(this);
        this.reject = this.reject.bind(this);
        this.currUserList = null;
    }

    getContacts(cat, subCat) {
        this.setActiveTabData(cat, subCat);
        this.setState({activeMainCat: cat, activeSubCat: subCat, searchValue: ""});
    }

    getCallRecords(cat, subCat) {
        this.setActiveTabData(cat, subCat);
        this.setState({activeMainCat: cat, activeSubCat: subCat, searchValue: ""});
    }

    getContactsByStatus(cat, subCat) {
        this.setActiveTabData(cat, subCat);
        this.setState({activeMainCat: cat, activeSubCat: subCat, searchValue: ""});
    }

    setActiveTabData(cat, subCat) {
        if (cat == "contact" && subCat == "all") {
            this.setState({activeTabData: this.state.userContacts});
        } else if (cat == "contact" && subCat == "individual") {
            let dataSet = [],
                usersSet = [],
                letter = "";

            let aContacts = this.state.userContacts;

            for (var key in aContacts) {
                letter = aContacts[key].letter;
                for (var subKey in aContacts[key].users) {
                    let type = aContacts[key].users[subKey].type;
                    if (type == ContactType.INDIVIDUAL) {
                        usersSet.push(aContacts[key].users[subKey]);
                    }
                }
                if (usersSet.length >= 1) {
                    dataSet.push({"letter": letter, "users": usersSet});
                    usersSet = [];
                }
            }

            this.setState({activeTabData: dataSet});
        } else if (cat == "contact" && subCat == "groups") {
            let dataSet = [],
                usersSet = [],
                letter = "";

            let aContacts = this.state.userContacts;

            for (var key in aContacts) {
                letter = aContacts[key].letter;
                for (var subKey in aContacts[key].users) {
                    let type = aContacts[key].users[subKey].type;
                    if (type == ContactType.GROUP) {
                        usersSet.push(aContacts[key].users[subKey]);
                    }
                }
                if (usersSet.length >= 1) {
                    dataSet.push({"letter": letter, "users": usersSet});
                    usersSet = [];
                }
            }

            this.setState({activeTabData: dataSet});
        } else if (cat == "recent" && subCat == "all") {
            this.setState({activeTabData: this.state.recentCalls});
        } else if (cat == "recent" && subCat == "missed") {

        } else if (cat == "recent" && subCat == "individual") {

        } else if (cat == "recent" && subCat == "groups") {

        } else if (cat == "recent" && subCat == "multi") {

        } else if (cat == "status" && subCat == "online") {
            let dataSet = [],
                usersSet = [],
                letter = "";

            let aContacts = this.state.userContacts;

            for (var key in aContacts) {
                letter = aContacts[key].letter;
                for (var subKey in aContacts[key].users) {
                    let onlineStatus = aContacts[key].users[subKey].online_mode;
                    if (onlineStatus == UserMode.ONLINE.VALUE) {
                        usersSet.push(aContacts[key].users[subKey]);
                    }
                }
                if (usersSet.length >= 1) {
                    dataSet.push({"letter": letter, "users": usersSet});
                    usersSet = [];
                }
            }

            this.setState({activeTabData: dataSet});
        } else if (cat == "status" && subCat == "work_mode") {
            let dataSet = [],
                usersSet = [],
                letter = "";

            let aContacts = this.state.userContacts;

            for (var key in aContacts) {
                letter = aContacts[key].letter;
                for (var subKey in aContacts[key].users) {
                    let onlineStatus = aContacts[key].users[subKey].online_mode;
                    if (onlineStatus == UserMode.WORK_MODE.VALUE) {
                        usersSet.push(aContacts[key].users[subKey]);
                    }
                }
                if (usersSet.length >= 1) {
                    dataSet.push({"letter": letter, "users": usersSet});
                    usersSet = [];
                }
            }

            this.setState({activeTabData: dataSet});
        }

        this.setState({activeMainCat: cat, activeSubCat: subCat, searchValue: ""});
    }

    processCallRecords(aCallRecords) {
        let callRecords = [];

        for (var i = 0; i < aCallRecords.length; i++) {
            let callChannel = null;
            let callType = null;
            let callStatus = null;
            let time = null;
            let dd = null;

            let date = new Date(aCallRecords[i].call_started_at);
            let hh = date.getHours();
            let m = date.getMinutes();
            let s = date.getSeconds();

            (hh > 12) ? dd = 'PM' : dd = 'AM';
            (m < 10) ? m = '0' + m : m = m;
            (hh < 10) ? hh = '0' + hh : hh = hh;

            time = hh + ':' + m + ' ' + dd;

            (aCallRecords[i].call_channel == CallChannel.VIDEO) ? callChannel = 'video' : callChannel = 'phone';
            (aCallRecords[i].call_type == CallType.INCOMING) ? callType = CallType.INCOMING : callType = CallType.OUTGOING;

            if (aCallRecords[i].call_status == CallStatus.MISSED) {
                callStatus == 'missed';
            } else if (aCallRecords[i].call_status == CallStatus.ANSWERED) {
                callStatus == 'answered';
            } else if (aCallRecords[i].call_status == CallStatus.REJECTED) {
                callStatus == 'rejected';
            } else if (aCallRecords[i].call_status == CallStatus.CANCELLED) {
                callStatus == 'cancelled';
            }

            callRecords.push({
                user_id: aCallRecords[i].receivers_list[0].user_id,
                first_name: aCallRecords[i].receivers_list[0].first_name,
                last_name: aCallRecords[i].receivers_list[0].last_name,
                calls: 1,
                time: time,
                call_type: callType,
                call_channel: callChannel,
                call_status: callStatus,
                online_mode: aCallRecords[i].receivers_list[0].online_mode,
                images: aCallRecords[i].receivers_list[0].images
            });
        }

        return callRecords;
    }

    loadContactData(cat, subCat) {
        let userGroupList = [
            {
                letter: "A",
                users: [
                    {
                        "user_id": "57fcded7a083f22a099afff1",
                        "email": "test2@gmail.com",
                        "onlineStatus": 2,
                        "contactType": 2,
                        "call_type": 'phone',
                        "calls": 1,
                        "callStatus": 1,
                        "first_name": "test1",
                        "last_name": "ambi",
                        "zip_code": null,
                        "dob": "2-02-2013",
                        "country": "United States",
                        "user_name": "test2.ambi.86688",
                        "introduction": null,
                        "cur_exp_id": "57fcdeeba083f22a099affff",
                        "cur_working_at": "asd",
                        "cur_designation": "asd",
                        "call_time": "2:03 AM",
                        "city_details": "United States",
                        "connection_count": 0,
                        "calls": "2",
                        "images": {
                            "profile_image": {
                                "id": "DEFAULT",
                                "file_name": "default-profile-image.png",
                                "file_type": ".png",
                                "http_url": "/images/default-profile-pic.png"
                            }
                        },
                        "receivers_list": [
                            {
                                "name": "Steve Young",
                                "user_id": 1,
                                "call_status": 1
                            },
                            {
                                "name": "Christina Chapman",
                                "user_id": 2,
                                "call_status": 4
                            }
                        ],
                        "connected_at": "2016-10-11T12:47:03.594Z"
                    },
                    {
                        "user_id": "57fcded7a083f22a099afff2",
                        "email": "test2@gmail.com",
                        "onlineStatus": 2,
                        "contactType": 2,
                        "call_type": 'video',
                        "calls": 1,
                        "callStatus": 2,
                        "first_name": "test2",
                        "last_name": "ambi",
                        "zip_code": null,
                        "dob": "2-02-2013",
                        "country": "United States",
                        "user_name": "test2.ambi.86688",
                        "introduction": null,
                        "cur_exp_id": "57fcdeeba083f22a099affff",
                        "cur_working_at": "asd",
                        "cur_designation": "asd",
                        "call_time": "2:03 AM",
                        "city_details": "United States",
                        "connection_count": 0,
                        "calls": "2",
                        "images": {
                            "profile_image": {
                                "id": "DEFAULT",
                                "file_name": "default-profile-image.png",
                                "file_type": ".png",
                                "http_url": "/images/default-profile-pic.png"
                            }
                        },
                        "receivers_list": [
                            {
                                "name": "Steve Young",
                                "user_id": 1,
                                "call_status": 1
                            },
                            {
                                "name": "Christina Chapman",
                                "user_id": 2,
                                "call_status": 4
                            }
                        ],
                        "connected_at": "2016-10-11T12:47:03.594Z"
                    }
                ]
            },
            {
                letter: "B",
                users: [
                    {
                        "user_id": "57fcded7a083f22a099afff3",
                        "email": "test2@gmail.com",
                        "onlineStatus": 1,
                        "contactType": 2,
                        "call_type": "phone",
                        "calls": 1,
                        "callStatus": 1,
                        "first_name": "test3",
                        "last_name": "ambi",
                        "zip_code": null,
                        "dob": "2-02-2013",
                        "country": "United States",
                        "user_name": "test2.ambi.86688",
                        "introduction": null,
                        "cur_exp_id": "57fcdeeba083f22a099affff",
                        "cur_working_at": "asd",
                        "cur_designation": "asd",
                        "call_time": "2:03 AM",
                        "city_details": "United States",
                        "connection_count": 0,
                        "calls": "2",
                        "images": {
                            "profile_image": {
                                "id": "DEFAULT",
                                "file_name": "default-profile-image.png",
                                "file_type": ".png",
                                "http_url": "/images/default-profile-pic.png"
                            }
                        },
                        "receivers_list": [
                            {
                                "name": "Steve Young",
                                "user_id": 1,
                                "call_status": 1
                            },
                            {
                                "name": "Christina Chapman",
                                "user_id": 2,
                                "call_status": 4
                            }
                        ],
                        "connected_at": "2016-10-11T12:47:03.594Z"
                    }
                ]
            }
        ];

        let recentList = [
            {
                "user_id": "57fcded7a083f22a099afffe",
                "email": "test2@gmail.com",
                "onlineStatus": 1,
                "contact_type": 1,
                "call_type": 'phone',
                "calls": 1,
                "first_name": "test3",
                "last_name": "ambi",
                "zip_code": null,
                "dob": "2-02-2013",
                "country": "United States",
                "user_name": "test2.ambi.86688",
                "introduction": null,
                "cur_exp_id": "57fcdeeba083f22a099affff",
                "cur_working_at": "asd",
                "cur_designation": "asd",
                "call_time": "2:03 AM",
                "city_details": "United States",
                "connection_count": 0,
                "calls": "2",
                "images": {
                    "profile_image": {
                        "id": "DEFAULT",
                        "file_name": "default-profile-image.png",
                        "file_type": ".png",
                        "http_url": "/images/default-profile-pic.png"
                    }
                },
                "receivers_list": [
                    {
                        "name": "Steve Young",
                        "user_id": 1,
                        "call_status": 1
                    },
                    {
                        "name": "Christina Chapman",
                        "user_id": 2,
                        "call_status": 4
                    }
                ],
                "connected_at": "2016-10-11T12:47:03.594Z"
            },
            {
                "user_id": "57fcded7a083f22a099afffe",
                "email": "test2@gmail.com",
                "onlineStatus": 1,
                "contact_type": 1,
                "call_type": 'video',
                "calls": 1,
                "first_name": "test2",
                "last_name": "ambi",
                "zip_code": null,
                "dob": "2-02-2013",
                "country": "United States",
                "user_name": "test2.ambi.86688",
                "introduction": null,
                "cur_exp_id": "57fcdeeba083f22a099affff",
                "cur_working_at": "asd",
                "cur_designation": "asd",
                "call_time": "2:03 AM",
                "city_details": "United States",
                "connection_count": 0,
                "calls": "2",
                "images": {
                    "profile_image": {
                        "id": "DEFAULT",
                        "file_name": "default-profile-image.png",
                        "file_type": ".png",
                        "http_url": "/images/default-profile-pic.png"
                    }
                },
                "receivers_list": [
                    {
                        "name": "Steve Young",
                        "user_id": 1,
                        "call_status": 1
                    },
                    {
                        "name": "Christina Chapman",
                        "user_id": 2,
                        "call_status": 4
                    }
                ],
                "connected_at": "2016-10-11T12:47:03.594Z"
            }
        ];

        $.ajax({
            url: '/contacts/all',
            method: "GET",
            dataType: "JSON",
            headers: {'prg-auth-header': this.state.loggedUser.token}
        }).done(function (data) {
            data.contacts.push.apply(data.contacts, userGroupList);
            data.contacts.sort(function (a, b) {
                var nameA = a.letter.toUpperCase(); // ignore upper and lowercase
                var nameB = b.letter.toUpperCase(); // ignore upper and lowercase
                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }

                // names must be equal
                return 0;
            });
            if (data.status.code == 200) {
                if (cat == "contact" && subCat == "all") {
                    this.setState({userContacts: data.contacts});
                }
                else if (cat == "contact" && subCat == "groups") {
                    let dataSet = [],
                        usersSet = [],
                        letter = "";

                    for (var key in data.contacts) {
                        letter = data.contacts[key].letter;
                        for (var subKey in data.contacts[key].users) {
                            let type = data.contacts[key].users[subKey].type;
                            if (type == 2) {
                                usersSet.push(data.contacts[key].users[subKey]);
                            }
                        }
                        if (usersSet.length >= 1) {
                            dataSet.push({"letter": letter, "users": usersSet});
                            usersSet = [];
                        }
                    }

                    this.setState({userContacts: dataSet});

                }
                else if (cat == "contact" && subCat == "individual") {
                    let dataSet = [],
                        usersSet = [],
                        letter = "";

                    for (var key in data.contacts) {
                        letter = data.contacts[key].letter;
                        for (var subKey in data.contacts[key].users) {
                            let type = data.contacts[key].users[subKey].type;
                            if (type == 1) {
                                usersSet.push(data.contacts[key].users[subKey]);
                            }
                        }
                        if (usersSet.length >= 1) {
                            dataSet.push({"letter": letter, "users": usersSet});
                            usersSet = [];
                        }
                    }

                    this.setState({userContacts: dataSet});
                }
                else if (cat == "recent" && subCat == "all") {
                    this.setState({userContacts: userGroupList});
                }
                else if (cat == "status" && subCat == "online") {
                    let dataSet = [],
                        usersSet = [],
                        letter = "";

                    for (var key in data.contacts) {
                        letter = data.contacts[key].letter;
                        for (var subKey in data.contacts[key].users) {
                            let stat = data.contacts[key].users[subKey].onlineStatus;
                            if (stat == 1) {
                                usersSet.push(data.contacts[key].users[subKey]);
                            }
                        }
                        if (usersSet.length >= 1) {
                            dataSet.push({"letter": letter, "users": usersSet});
                            usersSet = [];
                        }
                    }

                    this.setState({userContacts: dataSet});
                }
                else if (cat == "status" && subCat == "busy") {
                    let dataSet = [],
                        usersSet = [],
                        letter = "";

                    for (var key in data.contacts) {
                        letter = data.contacts[key].letter;
                        for (var subKey in data.contacts[key].users) {
                            let stat = data.contacts[key].users[subKey].onlineStatus;
                            if (stat == 2) {
                                usersSet.push(data.contacts[key].users[subKey]);
                            }
                        }
                        if (usersSet.length >= 1) {
                            dataSet.push({"letter": letter, "users": usersSet});
                            usersSet = [];
                        }
                    }

                    this.setState({userContacts: dataSet});
                }
                else if (cat == "recent" && subCat == "missed") {
                    this.setState({userContacts: userGroupList});
                } else if (cat == "recent" && subCat == "individual") {
                    this.setState({userContacts: userGroupList});
                } else if (cat == "recent" && subCat == "groups") {
                    this.setState({userContacts: userGroupList});
                }
                else {
                    this.setState({userContacts: []});
                }
            }
            this.currUserList = this.state.userContacts;
            this.setState({activeMainCat: cat, activeSubCat: subCat, searchValue: ""});
        }.bind(this));
    }

    onMinimizePopup() {
        this.setState({inProgressCall: false, minimizeBar: true});
    }

    onPopupClose() {
        this.state.bit6Call.hangup();
        this.setState({inProgressCall: false, minimizeBar: false, bit6Call: null});
    }

    onDialing(user, callType) {
        this.startOutgoingCall(user, callType);
    }

    headerNavRecent() {
        let mainCat = this.state.activeMainCat;
        let subCat = this.state.activeSubCat;

        return (
            <div className="rw-contact-menu sub-menu">
                <div className={(subCat == "all") ? "col-sm-2-4 active" : "col-sm-2-4" } onClick={(event)=> {
                    this.getCallRecords("recent", "all")
                }}>All <span className="selector"></span></div>
                <div className={(subCat == "missed") ? "col-sm-2-4 active" : "col-sm-2-4" } onClick={(event)=> {
                    this.loadContactData("recent", "missed")
                }}>Missed <span className="selector"></span></div>
                <div className={(subCat == "individual") ? "col-sm-2-4 active" : "col-sm-2-4" } onClick={(event)=> {
                    this.loadContactData("recent", "individual")
                }}>Individual <span className="selector"></span></div>
                <div className={(subCat == "groups") ? "col-sm-2-4 active" : "col-sm-2-4" } onClick={(event)=> {
                    this.loadContactData("recent", "groups")
                }}>Groups <span className="selector"></span></div>
                <div className={(subCat == "multi") ? "col-sm-2-4 active" : "col-sm-2-4" } onClick={(event)=> {
                    this.loadContactData("recent", "multi")
                }}>Multi <span className="selector"></span></div>
            </div>
        )
    }

    headerNavContact() {
        let mainCat = this.state.activeMainCat;
        let subCat = this.state.activeSubCat;

        return (
            <div className="rw-contact-menu sub-menu">
                <div className={(subCat == "all") ? "col-sm-2-4 active" : "col-sm-2-4" } onClick={(event)=> {
                    this.getContacts("contact", "all")
                }}>All <span className="selector"></span></div>
                <div className={(subCat == "individual") ? "col-sm-2-4 active" : "col-sm-2-4" } onClick={(event)=> {
                    this.getContacts("contact", "individual")
                }}>Individual <span className="selector"></span></div>
                <div className={(subCat == "groups") ? "col-sm-2-4 active" : "col-sm-2-4" } onClick={(event)=> {
                    this.getContacts("contact", "groups")
                }}>Groups <span className="selector"></span></div>
            </div>
        )
    }

    headerNavStatus() {
        let mainCat = this.state.activeMainCat;
        let subCat = this.state.activeSubCat;

        return (
            <div className="rw-contact-menu sub-menu">
                <div className={(subCat == "online") ? "col-sm-2-4 active" : "col-sm-2-4" } onClick={(event)=> {
                    this.getContactsByStatus("status", "online")
                }}>Online <span className="selector"></span></div>
                <div className={(subCat == "busy") ? "col-sm-2-4 active" : "col-sm-2-4" } onClick={(event)=> {
                    this.getContactsByStatus("status", "work_mode")
                }}>Work-Mode <span className="selector"></span></div>
            </div>
        )
    }

    onUserStateUpdate(mode) {
        this.refs.overlay.hide();
        this.setState({userStatus: mode, isStatusVisible: false});

        CallCenter.updateUserMode(mode).done(function (data) {
            if (data.status.code == 200) {
                Session.updateSession('prg_lg', 'online_mode', data.onlineMode);
                CallCenter.changeUserMode(data.onlineMode);
            }
        });
    }

    onUserStatusClick() {
        this.setState({isStatusVisible: true});
    }

    getUserStatusClass(userStatus) {
        if (userStatus == UserMode.ONLINE.VALUE) {
            return 'online';
        } else if (userStatus == UserMode.WORK_MODE.VALUE) {
            return 'work-mode';
        } else {
            return 'offline';
        }
    }

    headerNav() {
        let mainCat = this.state.activeMainCat;
        let subCat = this.state.activeSubCat;

        const popoverClickRootClose = (
        <Popover id="popover-trigger-click-root-close" className="user-status-popover">
            <section className="cc-online-status-popup">
                <div className="status-type" onClick={(event)=> {
                    this.onUserStateUpdate(UserMode.ONLINE.VALUE)
                }}>
                    <span className="status online"></span>
                    <p className="type">{UserMode.ONLINE.TITLE}</p>
                </div>
                <div className="status-type" onClick={(event)=> {
                    this.onUserStateUpdate(UserMode.WORK_MODE.VALUE)
                }}>
                    <span className="status work-mode"></span>
                    <p className="type">{UserMode.WORK_MODE.TITLE}</p>
                </div>
                <div className="status-type" onClick={(event)=> {
                    this.onUserStateUpdate(UserMode.OFFLINE.VALUE)
                }}>
                    <span className="status offline"></span>
                    <p className="type">{UserMode.OFFLINE.TITLE}</p>
                </div>
                <div className="mood-msg status-type">
                    <span className="status addIcon"></span>
                    <p>Edit Mood Message</p>
                </div>
            </section>
        </Popover>
        );

        return (
            <div className="inner-header clearfix">
                <div className="col-sm-6 user-status">
                    <div className="image-wrapper">
                        <img
                            src={(this.state.loggedUser.hasOwnProperty('profile_image') && this.state.loggedUser.profile_image) ?
                                this.state.loggedUser.profile_image : "/images/default-profile-pic.png"}/>
                        <OverlayTrigger ref="overlay" trigger="click" rootClose placement="right" overlay={popoverClickRootClose}>
                            <span className={"status user-mode " + this.getUserStatusClass(this.state.userStatus)}
                                  onClick={this.onUserStatusClick.bind(this)}></span>
                        </OverlayTrigger>
                    </div>
                    <div className="name-wrapper">
                        <p className="name">{this.state.loggedUser.first_name + " " + this.state.loggedUser.last_name}</p>
                        <p className="status">{this.getUserStatusClass(this.state.userStatus)}</p>
                        {/*<div className="status-update">
                         <ButtonToolbar>
                         <DropdownButton bsSize="small" title={this.state.userStatus}
                         id="dropdown-size-small">
                         <MenuItem eventKey="online"
                         onSelect={this.onUserStateUpdate.bind(this)}>Online</MenuItem>
                         <MenuItem eventKey="offline" onSelect={this.onUserStateUpdate.bind(this)}>Offline</MenuItem>
                         <MenuItem eventKey="work-mode" onSelect={this.onUserStateUpdate.bind(this)}>Work
                         mode</MenuItem>
                         </DropdownButton>
                         </ButtonToolbar>
                         </div>*/}
                    </div>
                </div>
                <div className="col-sm-6 tab-wrapper">
                    <div className="rw-contact-menu main-menu clearfix">
                        <div className={(mainCat == "recent") ? "col-sm-4 active" : "col-sm-4" }
                             onClick={(event)=> {
                                 this.getCallRecords("recent", "all")
                             }}>Recent
                        </div>
                        <div className={(mainCat == "contact") ? "col-sm-4 active" : "col-sm-4" }
                             onClick={(event)=> {
                                 this.getContacts("contact", "all")
                             }}>Contact
                        </div>
                        <div className={(mainCat == "status") ? "col-sm-4 active" : "col-sm-4" }
                             onClick={(event)=> {
                                 this.getContactsByStatus("status", "online")
                             }}>Status
                        </div>
                    </div>
                    {(mainCat == "recent") ? this.headerNavRecent() : null}
                    {(mainCat == "contact") ? this.headerNavContact() : null}
                    {(mainCat == "status") ? this.headerNavStatus() : null}
                </div>
            </div>
        )
    }

    startOutgoingCall(oTargetUser, callMode) {
        // Outgoing call params
        let opts = {
            audio: true,
            video: false,
            screen: false
        };

        if (callMode == CallChannel.VIDEO) {
            opts.video = true;
            this.setState({callMode: CallChannel.VIDEO});
        } else {
            this.setState({callMode: CallChannel.AUDIO});
        }

        // Start the outgoing call
        let to = CallCenter.getBit6Identity(oTargetUser);
        var c = this.b6.startCall(to, opts);

        this.attachCallEvents(c);

        this.callRecord.contact = oTargetUser;
        this.callRecord.callChannel = this.state.callMode;
        this.callRecord.targets.push({user_id: oTargetUser.user_id});
        this.callRecord.dialedAt = new Date().toISOString();

        /* CallCenter.addCallRecord(this.callRecord).done(function (oData) {
         // console.log(oData);
         });*/

        c.connect(opts);

        this.setState({inProgressCall: true, targetUser: oTargetUser, bit6Call: c});
    };

    // Attach call state events to a RtcDialog
    attachCallEvents(c) {
        var _this = this;

        // Call progress
        c.on('progress', function () {
            console.log(c);
            _this.setState({bit6Call: c});
        });

        // Number of video feeds/elements changed
        c.on('videos', function () {
            console.log(c);
            _this.setState({bit6Call: c});
            // TODO show video call details in popup
        });

        // Call answered
        c.on('answer', function () {
            console.log(c);
            _this.setState({bit6Call: c});
            // TODO show timer , call buttons
        });

        // Error during the call
        c.on('error', function () {
            console.log(c);
            _this.setState({bit6Call: c});
            // TODO show call error in popup
        });

        // Call ended
        c.on('end', function () {
            console.log('end');
            console.log(c);
            _this.setState({inProgressCall: false, targetUser: null, callMode: CallChannel.AUDIO});
            // TODO show call end details in popup
        });
    }

    handleShowModal() {
        this.setState({showModal: true});
    }

    answerVideo() {
        console.log("Video");
        this.setState({inProgressCall: true, showModal: false});
    }

    answerAudio() {
        console.log("Audio");
        this.setState({inProgressCall: true, showModal: false});
    }

    reject() {
        console.log("reject");
        this.setState({showModal: false});
    }

    onPopupMaximize() {
        this.setState({inProgressCall: true, minimizeBar: false});
    }

    toggleMic(bMic) {
        var oCall = this.state.bit6Call;
        oCall.connect({audio: bMic});
        this.setState({callMode: (bMic) ? CallChannel.VIDEO : CallChannel.AUDIO, bit6Call: oCall});
    }

    toggleVideo(bVideo) {
        var oCall = this.state.bit6Call;
        oCall.connect({video: bVideo});
        this.setState({callMode: (bVideo) ? CallChannel.VIDEO : CallChannel.AUDIO, bit6Call: oCall});
    }

    toggleSpeaker() {

    }

    onSearch(e) {
        let val = e.target.value,
            userContacts = this.currUserList,
            dataSet = [],
            usersSet = [],
            letter = "";
        this.setState({searchValue: val});

        for (var key in userContacts) {
            letter = userContacts[key].letter;

            for (var subKey in userContacts[key].users) {
                let name = userContacts[key].users[subKey].first_name + " " + userContacts[key].users[subKey].last_name;
                if (name.includes(val)) {
                    usersSet.push(userContacts[key].users[subKey]);
                }
            }

            if (usersSet.length >= 1) {
                if (this.state.activeMainCat == "recent") {
                    dataSet.push({"users": usersSet});
                } else {
                    dataSet.push({"letter": letter, "users": usersSet});
                }
                usersSet = [];
            }
        }

        if (val == "") {
            this.setState({userContacts: this.currUserList});
        } else {
            this.setState({userContacts: dataSet});
        }
    }

    render() {
        let mainCat = this.state.activeMainCat,
            subCat = this.state.activeSubCat;

        return (
            <section className="call-center-container sub-container">
                <div className="container">
                    <section className="call-center-header">
                        <div className="row">
                            <div className="col-sm-4">
                                <h2>Call Center</h2>
                            </div>
                            <div className="col-sm-8">
                                <div className="actions-wrapper">
                                    <div className="search-call">
		                                <span className="inner-addon">
		                                    <i className="fa fa-search"></i>
		                                    <input type="text" className="form-control" placeholder="Search"
                                                   value={this.state.searchValue} onChange={this.onSearch.bind(this)}/>
		                                </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="call-center-inner-holder">
                        {this.headerNav()}
                        {
                            (mainCat == "recent") ?
                                <RecentList callRecords={this.state.activeTabData}
                                            onUserCall={this.onDialing.bind(this)}/>
                                :
                                null
                        }
                        {
                            (mainCat == "contact") ?
                                <ContactList userContacts={this.state.activeTabData}
                                             onUserCall={this.onDialing.bind(this)}/>
                                :
                                null
                        }
                        {
                            (mainCat == "status") ?
                                <StatusList userContacts={this.state.activeTabData}
                                            onUserCall={this.onDialing.bind(this)}/>
                                :
                                null
                        }
                    </section>
                    {
                        (this.state.minimizeBar) ?
                            <div className="callModelMinimized clearfix">
                                <span className="user-name">test</span>
                                <div className="opt-wrapper">
                                    <i className="fa fa-caret-square-o-up" onClick={(e) => this.onPopupMaximize(e)}></i>
                                    <i className="fa fa-times" onClick={(e) => this.onPopupClose(e)}></i>
                                </div>
                            </div>
                            :
                            null
                    }
                </div>
                {
                    (this.state.inProgressCall) ?
                        <div>
                            <ModalContainer zIndex={9999}>
                                <ModalDialog className="modalPopup">
                                    <CallModel
                                        bit6Call={this.state.bit6Call}
                                        loggedUser={this.state.loggedUser}
                                        targetUser={this.state.targetUser}
                                        toggleMic={this.toggleMic.bind(this)}
                                        toggleVideo={this.toggleVideo.bind(this)}
                                        closePopup={this.onPopupClose.bind(this)}
                                        allContacts={this.allContacts}
                                        minimizePopup={this.onMinimizePopup.bind(this)}/>
                                </ModalDialog>
                            </ModalContainer>
                        </div> : null
                }
            </section>
        );
    }
}

