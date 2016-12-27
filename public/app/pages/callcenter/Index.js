/**
 * This is call center index component
 */

import React from 'react';
import ReactDom from 'react-dom';
import {Modal} from 'react-bootstrap';
import Session from '../../middleware/Session';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import User from "./User";
import CallModel from "./CallModel";
import CallHandler from './CallHandler';

export default class Index extends React.Component {
    constructor(props) {
        super(props);

        if(Session.getSession('prg_lg') == null){
            window.location.href = "/";
        }

        this.state = {
            loggedUser: Session.getSession('prg_lg'),
            isShowingModal: false,
            userList: [],
            recentCalls: [],
            userStatus: [],
            activeMainCat: "",
            activeSubCat: "",
            showModal: false,
            minimizeBar: false
        }

        this.loadContactData("recent", "all");

        this.answerVideo = this.answerVideo.bind(this);
        this.answerAudio = this.answerAudio.bind(this);
        this.reject = this.reject.bind(this);
    }

    loadContactData(cat, subCat) {
        let userGroupList = [
            {
                letter: "A",
                users: [
                    {
                        "name": "Khaitan",
                        "status": "offline",
                        "type": "group"
                    }
                ]
            },
            {
                letter: "B",
                users: [
                    {
                        "name": "Prasad",
                        "status": "work-mode",
                        "type": "group"
                    }
                ]
            },
            {
                letter: "C",
                users: [
                    {
                        "name": "Soham",
                        "status": "online",
                        "type": "group"
                    },
                    {
                        "name": "Khaitan",
                        "status": "offline",
                        "type": "group"
                    }
                ]
            },
            {
                letter: "D",
                users: [
                    {
                        "name": "Khaitan",
                        "status": "offline",
                        "type": "group"
                    }
                ]
            },
            {
                letter: "E",
                users: [
                    {
                        "name": "Prasad",
                        "status": "work-mode",
                        "type": "group"
                    }
                ]
            },
            {
                letter: "F",
                users: [
                    {
                        "name": "Soham",
                        "status": "online",
                        "type": "group"
                    },
                    {
                        "name": "Khaitan",
                        "status": "offline",
                        "type": "group"
                    }
                ]
            }
        ];

        let recentList = [
            {
				"user_id": "57fcded7a083f22a099afffe",
				"email": "prasad2@gmail.com",
				"mood" : 1,
				"contact_type": 1,
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
			},
            {
				"user_id": "57fcded7a083f22a099afffe",
				"email": "prasad2@gmail.com",
				"mood" : 1,
				"contact_type": 1,
				"call_type": 2,
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

        function filterByType(contact) {
			console.log(contact);
			if (contact.contact_type == 1) {
				return true;
			}
		}

        $.ajax({
            url: '/contacts/all',
            method: "GET",
            dataType: "JSON",
            headers: {'prg-auth-header': this.state.loggedUser.token}
        }).done(function (data) {
            if (data.status.code == 200) {
                if (cat == "contact" && subCat == "all") {
                    this.setState({userList: data.contacts});
                } else if (cat == "contact" && subCat == "individual") {
                	this.setState({userList: data.contacts});

                	for (var key in data.contacts) {
			            for (var key1 in data.contacts[key].users) {
			            	//console.log(data.contacts[key].users[key1].dob);
				        }
			        }
            	}
                // } else if (cat == "contact" && subCat == "groups") {
                //     this.setState({userList: userGroupList});
                // } else if (cat == "recent" && subCat == "all") {
                //     this.setState({userList: recentList});
                // } else if (cat == "recent" && subCat == "missed") {
                //     this.setState({userList: recentMissedList});
                // } else if (cat == "recent" && subCat == "individual") {
                //     this.setState({userList: recentIndividualList});
                // } else if (cat == "recent" && subCat == "groups") {
                //     this.setState({userList: recentgroupsList});
                // } 
                	else {
                    this.setState({userList: []});
                	}
                }
                this.setState({activeMainCat: cat, activeSubCat: subCat});
        }.bind(this));

    }

    onMinimizePopup(){
    	this.setState({isShowingModal : false, minimizeBar : true});
    }

    onPopupClose() {
        this.setState({isShowingModal: false, minimizeBar : false});
    }

    callPopup() {
        return (
            <div>
                {this.state.isShowingModal &&
                <ModalContainer zIndex={9999}>
                    <ModalDialog className="modalPopup">
                        <CallModel closePopup={this.onPopupClose.bind(this)} loggedUser={this.state.loggedUser} minimizePopup={this.onMinimizePopup.bind(this)} />
                    </ModalDialog>
                </ModalContainer>
                }
            </div>
        );
    }

    onUserCalling(user,callType) {
    	console.log(user, callType);
        this.setState({isShowingModal: true});
    }

    userCallPopup() {
        return (
            <Modal show={this.state.showModal} onHide={this.close}>
                <div className="alert fade in" id="incomingCall">
                    <img src="/images/default-profile-pic.png" id="incoming_call_alert_other_profile_image"
                         className="img-circle img-custom-medium bottom-margin-20"/>
                    <h4 id="incomingCallFrom">User is calling...</h4>
                    <div>
                        <button type="button" className="btn btn-success income-call" id="answerVideo"
                                onClick={()=>this.answerVideo()}>Video
                        </button>
                        <button type="button" className="btn btn-success income-call" id="answerAudio"
                                onClick={()=>this.answerAudio()}>Audio
                        </button>
                        <button type="button" className="btn btn-danger income-call" id="reject"
                                onClick={()=>this.reject()}>Reject
                        </button>
                    </div>
                </div>
            </Modal>
        )
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
                            <span className="status online"></span>
                        </div>
                        <div className="name-wrapper">
                            <p className="name">{this.state.loggedUser.first_name + " " + this.state.loggedUser.last_name}</p>
                            <p className="status">Online</p>
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
                                     this.loadContactData("status", "all")
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

    handleShowModal() {
        this.setState({showModal: true});
    }

    answerVideo() {
        console.log("Video");
        this.setState({isShowingModal: true, showModal: false});
    }

    answerAudio() {
        console.log("Audio");
        this.setState({isShowingModal: true, showModal: false});
    }

    reject() {
        console.log("reject");
        this.setState({showModal: false});
    }

    onPopupMaximize(){
    	this.setState({isShowingModal: true, minimizeBar : false});
    }

    render() {
        let mainCat = this.state.activeMainCat;
        let subCat = this.state.activeSubCat;

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
		                                    <input type="text" className="form-control" placeholder="Search"/>
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
                                <RecentList userList={this.state.userList} onUserCall={this.onUserCalling.bind(this)}/>
                                :
                                null
                        }
                        {
                            (mainCat == "contact") ?
                                <ContactList userList={this.state.userList} onUserCall={this.onUserCalling.bind(this)}/>
                                :
                                null
                        }
                    </section>
                    {
                    	(this.state.minimizeBar)?
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
                {this.userCallPopup()}
                {this.callPopup()}
            </section>
        );
    }
}

export class ContactList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {}
    }

    onCalling(user,callType) {
        this.props.onUserCall(user,callType);
    }

    render() {
        let _this = this;
        let usersList = this.props.userList.map(function (user, key) {
            return (
                <div className="contact-group" key={key}>
                    <p className="group-name">{user.letter}</p>
                    <div className="contact-wrapper">
                        <User users={user.users} type="contact" onCalling={_this.onCalling.bind(_this)}/>
                    </div>
                </div>
            )
        })
        return (
            <div className="contacts-list">
                {usersList}
            </div>
        );
    }
}

export class RecentList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {}

    }

    onCalling(user,callType) {
        this.props.onUserCall(user,callType);
    }

    render() {
        let _this = this;
        let recentList = this.props.userList.map(function (user, key) {
            return (
                <User users={user.users} type="recent" key={key} onCalling={_this.onCalling.bind(_this)}/>
            )
        })
        return (
            <div className="recent-list">
                <div className="list-wrapper">
                    {recentList}
                </div>
            </div>
        );
    }
}

