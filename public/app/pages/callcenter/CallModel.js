/**
 * This is call center call model component
 */

import React from "react";
import {Popover, OverlayTrigger} from 'react-bootstrap';

export default class CallModel extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isCallBtnEnabled: true,
            isVideoBtnEnabled: true,
            isValoumeBtnEnabled: true
        }

        this.userList = [
            {
                "user_id": "57fcded7a083f22a099afffe",
                "email": "prasad2@gmail.com",
                "mood": 1,
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
                "connected_at": "2016-10-11T12:47:03.594Z"
            },
            {
                "user_id": "57fcded7a083f22a099afffe",
                "email": "prasad2@gmail.com",
                "mood": 1,
                "contact_type": 1,
                "call_type": 2,
                "calls": 1,
                "first_name": "prasad2",
                "last_name": "sampath",
                "zip_code": null,
                "dob": "2-02-2013",
                "country": "United States",
                "user_name": "prasad2.sampath.86689",
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
                "connected_at": "2016-10-11T12:47:03.594Z"
            }
        ];
    }

    onCallBtnClick() {
        let isEnabled = this.state.isCallBtnEnabled;
        this.setState({isCallBtnEnabled: !isEnabled});
    }

    onVideoBtnClick() {
        let isEnabled = this.state.isVideoBtnEnabled;
        this.setState({isVideoBtnEnabled: !isEnabled});
    }

    onVolumeBtnClick() {
        let isEnabled = this.state.isValoumeBtnEnabled;
        this.setState({isValoumeBtnEnabled: !isEnabled});
    }

    render() {
        let i = (
            <Popover id="popover-contained" className="share-popover-contained callpopup popup-holder"
                     style={{maxWidth: "265px", width: "265px", zIndex: 9999}}>
                <div className="call-center-new-participant">
                    <i className="fa fa-search" aria-hidden="true"></i>
                    <input type="text" className="form-control" placeholder="Type name"/>
                </div>
            </Popover>
        );

        let _target_user = this.props.targetUser;

        return (
            <div className="popup-holder">
                <div className="row">
                    <div className="col-sm-12">
                        <div className="active-call-container">
                            <div className="top-nav">
                                <span className="close-ico" onClick={(e) => this.props.closePopup(e)}></span>
                                <OverlayTrigger rootClose trigger="click" placement="right" overlay={i}>
                                    <span className="add-new-ico"></span>
                                </OverlayTrigger>
                                <span className="minus-ico" onClick={(e) => this.props.minimizePopup(e)}></span>
                                <span className="expand-ico"></span>
                            </div>
                            <div className="active-user-block">
                                <img src="/images/call-center/cc-active-user.png" />
                                <div className="active-call-nav">
                                    <span className={(this.state.isVideoBtnEnabled) ? "video active" : "video"}
                                          onClick={this.onVideoBtnClick.bind(this)}></span>
                                    <span className={(this.state.isCallBtnEnabled) ? "mute" : "mute active"}
                                          onClick={this.onCallBtnClick.bind(this)}></span>
                                    <span className={(this.state.isValoumeBtnEnabled) ? "speaker" : "speaker active"}
                                          onClick={this.onVolumeBtnClick.bind(this)}></span>
                                    <span className="hang-up" onClick={(e) => this.props.closePopup(e)}></span>
                                </div>
                            </div>
                            <UserBlock users={this.userList} loggedUser={this.props.loggedUser}/>
                            <div className="call-timer">
                                <p className="call-status">On Call -</p>
                                <p className="call-time">00 : 00 : 10</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export class UserBlock extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            userName: this.props.loggedUser.user_name
        }

    }

    onUserClick(user) {
        this.setState({userName: user.user_name});
    }

    isUserActive(user) {
        return "user-block " + ((this.state.userName == user) ? "active" : null);
    }

    render() {
        let _this = this,
            _loggedUser = this.props.loggedUser,
            _usersHtml = this.props.users.map(function (user, key) {
                return (
                    <div className={_this.isUserActive(user.user_name)} onClick={_this.onUserClick.bind(_this, user)}
                         key={key}>
                        <img src={user.images.profile_image.http_url}/>
                        <span className="active-user"></span>
                    </div>
                )
            });
        return (
            <div className="participants">
                <div className={this.isUserActive(_loggedUser.user_name)}
                     onClick={this.onUserClick.bind(this, _loggedUser)}>
                    <img
                        src={(_loggedUser.profile_image) ? _loggedUser.profile_image : "/images/default-profile-pic.png"}/>
                    <div className="actions-wrapper">
                        <span className="video"></span>
                        <span className="mute"></span>
                    </div>
                    <span className="active-user"></span>
                </div>
                {_usersHtml}
            </div>
        )
    }
}