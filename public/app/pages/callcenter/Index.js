/**
 * This is call center index component
 */

import React from 'react';
import ReactDom from 'react-dom';
import {Modal, ButtonToolbar, DropdownButton, MenuItem} from 'react-bootstrap';
import Session from '../../middleware/Session';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import {CallChannel} from '../../config/CallcenterStats';
import ContactList from "./ContactList";
import RecentList from "./RecentList";
import StatusList from "./StatusList";
import CallModel from "./CallModel";
import CallCenter from '../../middleware/CallCenter';

export default class Index extends React.Component {
    constructor(props) {
        super(props);

        if (Session.getSession('prg_lg') == null) {
            window.location.href = "/";
        } else {
            this.b6 = CallCenter.b6;
            this.initCall(this.b6);
        }

        this.state = {
            loggedUser: Session.getSession('prg_lg'),
            targetUser: null,
            inProgressCall: false,
            callMode: CallChannel.AUDIO,
            userList: [],
            recentCalls: [],
            userStatus: "online",
            activeMainCat: "",
            activeSubCat: "",
            showModal: false,
            minimizeBar: false,
            searchValue: ""
        };

        // Call Record
        this.callRecord = {
            targets: []
        };

        this.loadContactData("recent", "all");

        this.answerVideo = this.answerVideo.bind(this);
        this.answerAudio = this.answerAudio.bind(this);
        this.reject = this.reject.bind(this);
        this.currUserList;
    }

    initCall(b6) {
        let _this = this;

        b6.on('video', function (v, d, op) {
            _this.onVideoCall(v, d, op);
        });
    }

    loadContactData(cat, subCat) {
        let userGroupList = [
            {
                letter: "A",
                users: [
                    {
                        "user_id": "57fcded7a083f22a099afff1",
                        "email": "prasad2@gmail.com",
                        "onlineStatus": 2,
                        "contactType": 2,
                        "call_type": 'phone',
                        "calls": 1,
                        "first_name": "prasad1",
                        "last_name": "sampath",
                        "zip_code": null,
                        "dob": "2-02-2013",
                        "country": "United States",
                        "user_name": "prasad2.sampath.86688",
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
                                "file_name": "default_profile_image.png",
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
                        "email": "prasad2@gmail.com",
                        "onlineStatus": 2,
                        "contactType": 2,
                        "call_type": 'video',
                        "calls": 1,
                        "first_name": "prasad2",
                        "last_name": "sampath",
                        "zip_code": null,
                        "dob": "2-02-2013",
                        "country": "United States",
                        "user_name": "prasad2.sampath.86688",
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
                                "file_name": "default_profile_image.png",
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
                        "email": "prasad2@gmail.com",
                        "onlineStatus": 1,
                        "contactType": 2,
                        "call_type": 2,
                        "calls": 1,
                        "first_name": "prasad3",
                        "last_name": "sampath",
                        "zip_code": null,
                        "dob": "2-02-2013",
                        "country": "United States",
                        "user_name": "prasad2.sampath.86688",
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
                                "file_name": "default_profile_image.png",
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
                "email": "prasad2@gmail.com",
                "onlineStatus": 1,
                "contact_type": 1,
                "call_type": 'phone',
                "calls": 1,
                "first_name": "prasad3",
                "last_name": "sampath",
                "zip_code": null,
                "dob": "2-02-2013",
                "country": "United States",
                "user_name": "prasad2.sampath.86688",
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
                        "file_name": "default_profile_image.png",
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
                "email": "prasad2@gmail.com",
                "onlineStatus": 1,
                "contact_type": 1,
                "call_type": 'video',
                "calls": 1,
                "first_name": "prasad2",
                "last_name": "sampath",
                "zip_code": null,
                "dob": "2-02-2013",
                "country": "United States",
                "user_name": "prasad2.sampath.86688",
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
                        "file_name": "default_profile_image.png",
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
                    this.setState({userList: data.contacts});
                }
                else if (cat == "contact" && subCat == "groups") {
                    let dataSet = [],
                        usersSet = [],
                        letter = "";

                    for (var key in data.contacts) {
                        letter = data.contacts[key].letter;
                        for (var subKey in data.contacts[key].users) {
                            let type = data.contacts[key].users[subKey].contactType;
                            if (type == 2) {
                                usersSet.push(data.contacts[key].users[subKey]);
                            }
                        }
                        if (usersSet.length >= 1) {
                            dataSet.push({"letter": letter, "users": usersSet});
                            usersSet = [];
                        }
                    }

                    this.setState({userList: dataSet});

                }
                else if (cat == "contact" && subCat == "individual") {
                    let dataSet = [],
                        usersSet = [],
                        letter = "";

                    for (var key in data.contacts) {
                        letter = data.contacts[key].letter;
                        for (var subKey in data.contacts[key].users) {
                            let type = data.contacts[key].users[subKey].contactType;
                            if (type == 1) {
                                usersSet.push(data.contacts[key].users[subKey]);
                            }
                        }
                        if (usersSet.length >= 1) {
                            dataSet.push({"letter": letter, "users": usersSet});
                            usersSet = [];
                        }
                    }

                    this.setState({userList: dataSet});
                }
                else if (cat == "recent" && subCat == "all") {
                    this.setState({userList: userGroupList});
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

                    this.setState({userList: dataSet});
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

                    this.setState({userList: dataSet});
                }
                else if (cat == "recent" && subCat == "missed") {
                    this.setState({userList: userGroupList});
                } else if (cat == "recent" && subCat == "individual") {
                    this.setState({userList: userGroupList});
                } else if (cat == "recent" && subCat == "groups") {
                    this.setState({userList: userGroupList});
                }
                else {
                    this.setState({userList: []});
                }
            }
            this.currUserList = this.state.userList;
            this.setState({activeMainCat: cat, activeSubCat: subCat, searchValue: ""});
        }.bind(this));
    }

    onMinimizePopup() {
        this.setState({inProgressCall: false, minimizeBar: true});
    }

    onPopupClose() {
        this.setState({inProgressCall: false, minimizeBar: false});
    }

    onDialing(user, callType) {
        this.startOutgoingCall(user, callType);
    }

    headerNavRecent() {
        let mainCat = this.state.activeMainCat;
        let subCat = this.state.activeSubCat;

        return (
            <div className="row rw-contact-menu">
                <div className={(subCat == "all") ? "col-sm-2-4 active" : "col-sm-2-4" } onClick={(event)=> {
                    this.loadContactData("recent", "all")
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
            <div className="row rw-contact-menu">
                <div className={(subCat == "all") ? "col-sm-4 active" : "col-sm-4" } onClick={(event)=> {
                    this.loadContactData("contact", "all")
                }}>All <span className="selector"></span></div>
                <div className={(subCat == "individual") ? "col-sm-4 active" : "col-sm-4" } onClick={(event)=> {
                    this.loadContactData("contact", "individual")
                }}>Individual <span className="selector"></span></div>
                <div className={(subCat == "groups") ? "col-sm-4 active" : "col-sm-4" } onClick={(event)=> {
                    this.loadContactData("contact", "groups")
                }}>Groups <span className="selector"></span></div>
            </div>
        )
    }

    headerNavStatus() {
        let mainCat = this.state.activeMainCat;
        let subCat = this.state.activeSubCat;

        return (
            <div className="row rw-contact-menu">
                <div className={(subCat == "online") ? "col-sm-6 active" : "col-sm-6" } onClick={(event)=> {
                    this.loadContactData("status", "online")
                }}>Online <span className="selector"></span></div>
                <div className={(subCat == "busy") ? "col-sm-6 active" : "col-sm-6" } onClick={(event)=> {
                    this.loadContactData("status", "busy")
                }}>Busy <span className="selector"></span></div>
            </div>
        )
    }

    onUserStateUpdate(eventKey) {
        console.log(eventKey);
        this.setState({userStatus: eventKey});
    }

    headerNav() {
        let mainCat = this.state.activeMainCat;
        let subCat = this.state.activeSubCat;

        return (
            <div className="inner-header">
                <div className="row">
                    <div className="col-sm-6 user-status">
                        <div className="image-wrapper">
                            <img
                                src={(this.state.loggedUser.profile_image == "") ? "/images/default-profile-pic.png" : this.state.loggedUser.profile_image}/>
                            <span className={"status " + this.state.userStatus}></span>
                        </div>
                        <div className="name-wrapper">
                            <p className="name">{this.state.loggedUser.first_name + " " + this.state.loggedUser.last_name}</p>
                            <div className="status-update">
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
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="row rw-contact-menu">
                            <div className={(mainCat == "recent") ? "col-sm-4 active" : "col-sm-4" }
                                 onClick={(event)=> {
                                     this.loadContactData("recent", "all")
                                 }}>Recent
                            </div>
                            <div className={(mainCat == "contact") ? "col-sm-4 active" : "col-sm-4" }
                                 onClick={(event)=> {
                                     this.loadContactData("contact", "all")
                                 }}>Contact
                            </div>
                            <div className={(mainCat == "status") ? "col-sm-4 active" : "col-sm-4" }
                                 onClick={(event)=> {
                                     this.loadContactData("status", "online")
                                 }}>Status
                            </div>
                        </div>
                        {(mainCat == "recent") ? this.headerNavRecent() : null}
                        {(mainCat == "contact") ? this.headerNavContact() : null}
                        {(mainCat == "status") ? this.headerNavStatus() : null}
                    </div>
                </div>
            </div>
        )
    }

    // Let's say you want to display the video elements in DOM element '#container'
    // Get notified about video elements to be added or removed
    // v - video element to add or remove
    // d - Dialog - call controller. null for a local video feed
    // op - operation. 1 - add, 0 - update, -1 - remove
    onVideoCall(v, d, op) {
        console.log("====== video call ======");

        // TODO Please change the container name for popup container
        var vc = $('#webcamStage');
        if (op < 0) {
            vc[0].removeChild(v);
        }
        else if (op > 0) {
            v.setAttribute('class', d ? 'remote' : 'local');
            vc.append(v);
        }
        // Total number of video elements (local and remote)
        var n = vc[0].children.length;
        // Display the container if we have any video elements
        if (op != 0) {
            vc.toggle(n > 0);
        }
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

        this.callRecord.targets.push({user_id: oTargetUser.user_id});

        c.connect(opts);

        this.setState({inProgressCall: true});
        this.setState({targetUser: oTargetUser});
        console.log("===== startOutgoingCall ===");
        console.log(c);
    };

    // Attach call state events to a RtcDialog
    attachCallEvents(c) {
        var _this = this;

        // Call progress
        c.on('progress', function () {
            _this.callRecord.dialedAt = new Date().toISOString();
            CallCenter.addCallRecord(_this.callRecord);
        });

        // Number of video feeds/elements changed
        c.on('videos', function () {
            console.log('video');
            console.log(c);
            // TODO show video call details in popup
        });

        // Call answered
        c.on('answer', function () {
            console.log('answered');
            console.log(c);
            // TODO show timer , call buttons
        });
        // Error during the call
        c.on('error', function () {
            console.log('error');
            console.log(c);
            // TODO show call error in popup
        });
        // Call ended
        c.on('end', function () {
            console.log('end');
            console.log(c);
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

    onSearch(e) {
        let val = e.target.value,
            userList = this.currUserList,
            dataSet = [],
            usersSet = [],
            letter = "";
        this.setState({searchValue: val});

        for (var key in userList) {
            letter = userList[key].letter;

            for (var subKey in userList[key].users) {
                let name = userList[key].users[subKey].first_name + " " + userList[key].users[subKey].last_name;
                if (name.includes(val)) {
                    usersSet.push(userList[key].users[subKey]);
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
            this.setState({userList: this.currUserList});
        } else {
            this.setState({userList: dataSet});
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
                                <RecentList userList={this.state.userList} onUserCall={this.onDialing.bind(this)}/>
                                :
                                null
                        }
                        {
                            (mainCat == "contact") ?
                                <ContactList userList={this.state.userList} onUserCall={this.onDialing.bind(this)}/>
                                :
                                null
                        }
                        {
                            (mainCat == "status") ?
                                <StatusList userList={this.state.userList} onUserCall={this.onDialing.bind(this)}/>
                                :
                                null
                        }
                    </section>
                    {
                        (this.state.minimizeBar) ?
                            <div className="callModelMinimized clearfix">
                                <span className="user-name">Prasad</span>
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
                                        callMode={this.state.callMode}
                                        loggedUser={this.state.loggedUser}
                                        targetUser={this.state.targetUser}
                                        closePopup={this.onPopupClose.bind(this)}
                                        minimizePopup={this.onMinimizePopup.bind(this)}/>
                                </ModalDialog>
                            </ModalContainer>
                        </div> : null
                }
            </section>
        );
    }
}

