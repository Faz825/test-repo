/**
 * This is notifications index class that handle all
 */

import React from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import Session  from '../../middleware/Session';
import SecretaryThumbnail from '../../components/elements/SecretaryThumbnail';

export default class Index extends React.Component{
    constructor(props){
        super(props);

        this.state={
            loggedUser:Session.getSession('prg_lg'),
            hours: "",
            minutes: ""
        }

        this.currentTime = new Date();
        this.currentTimeUpdate = this.currentTimeUpdate.bind(this);

    }

    componentWillMount(){
        this.currentTimeUpdate();
        this.currentDate();
    }

    componentDidMount(){
        window.setInterval(function () {
            this.currentTimeUpdate();
        }.bind(this), 1000);
    }

    addZero(i) {
        if (i < 10) {
            i = "0" + i;
        }
        return i;
    }

    currentTimeUpdate(){
        let _this = this;
        let currentTime = new Date();
        let hours = _this.addZero(currentTime.getHours() % 12 || 12);
        let minutes = _this.addZero(currentTime.getMinutes());

        this.setState({hours : hours, minutes : minutes});
    }

    ordinal_suffix_of(i) {
        let j = i % 10,
            k = i % 100;
        if (j == 1 && k != 11) {
            return i + "st";
        }
        if (j == 2 && k != 12) {
            return i + "nd";
        }
        if (j == 3 && k != 13) {
            return i + "rd";
        }
        return i + "th";
    }

    currentDate(){
        let _this = this;
        let days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
        let months = ["January", "February", "March", "April", "May","June", "July", "August", "September", "October","November", "December"];
        let weekDate = _this.currentTime.getDay();
        let rawDate = _this.currentTime.getDate();

        let year = _this.currentTime.getFullYear();
        let month = months[_this.currentTime.getMonth()];
        let date = days[weekDate];
        let dateAcr = this.ordinal_suffix_of(rawDate);

        return [year, month, date, dateAcr];
    }

    render() {
        let loggedUser = this.state.loggedUser;
        let _secretary_image = loggedUser.secretary_image_url;

        let partOfDay = "PM";
        let greating;
        let h = this.currentTime.getHours();
        let date = this.currentDate();

        if(h < 12){
            partOfDay = "AM";
            greating = 'Good Morning';
        }else if (h >= 12 && h <= 17){
			greating = 'Good Afternoon';
		}else if (h >= 17 && h <= 24){
            greating = 'Good Evening';
        }

        return (
            <div className="notificationsHolder container-fluid">
                <div className="row row-clr pg-news-page-content">
                    <div className="row row-clr">
                        <div className="col-xs-10 col-xs-offset-1">
                            <div className="row">
                                <div className="pg-middle-content-top-middle-secretary">
                                    <SecretaryThumbnail url={_secretary_image}/>
                                </div>
                                <div className="middle-info-holder">
                                    <p className="users-time">{this.state.hours + ":" + this.state.minutes + " " + partOfDay}</p>
                                    <p className="user-date">{date[2] + "," + date[1] + " " + date[3] + ", " + date[0]}</p>
                                    <p className="greeting-and-notifi">{greating + " " + loggedUser.first_name + ", you have 13 Notifications"}</p>
                                </div>
                            </div>
                            <div className="row notification-box-holder">
                                <div className="col-sm-4 notification-box">
                                    <div className="notifi-inner-wrapper">
                                        <div className="box-header-wrapper clearfix">
                                            <div className="col-sm-6">
                                                <h3 className="box-title">Network Notifications</h3>
                                            </div>
                                            <div className="col-sm-6">
                                                <div className="pg-top-mark-setings">
                                                    <label htmlFor="readAll">Mark All as Read</label>
                                                    <input type="checkbox" id="readAll" />
                                                    <p className="notifi-sub-link"><i className="fa fa-cog"></i>Settings</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="box-body-wrapper">
                                            <div className="chat-notification-header" id="unread_chat_list">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
