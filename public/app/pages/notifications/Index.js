/**
 * This is notifications index class that handle all
 */

import React from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import Session  from '../../middleware/Session';
import Socket  from '../../middleware/Socket';
import SecretaryThumbnail from '../../components/elements/SecretaryThumbnail';

export default class Index extends React.Component{
    constructor(props){
        super(props);

        //notification will work on http
        if (window.location.protocol == 'https:' ) {
            var url_arr = window.location.href.split('https');
            window.location.href = 'http'+url_arr[1];
        }

        this.state={
            loggedUser:Session.getSession('prg_lg'),
            hours: "",
            minutes: "",
            notifications: [],
            notificationCount: 0,
            seeAllNotifications: false,
            unreadNotificationIds: []
        };

        this.currentTime = new Date();
        this.currentTimeUpdate = this.currentTimeUpdate.bind(this);
        this.loadNotifications(1);
        this.listenToNotification();
    }

    listenToNotification(){
        let _this = this;

        Socket.listenToNotification(function(data){
            console.log("Got Notification")
            if(data.user != _this.state.loggedUser.user_name){

                console.log(data)

                _this.state.notificationCount++;
                let _existingNotifications = _this.state.notifications;
                let _newNotifications = [];
                let _curNotification = {};
                let _alreadyExist = 0;

                for(var j = _existingNotifications.length - 1; j >= 0; j--){

                    if(_existingNotifications[j].post_id == data.post_id && _existingNotifications[j].notification_type == data.notification_type){
                        _alreadyExist = 2;
                        _curNotification = _existingNotifications[j];
                    }else if(_existingNotifications[j].post_id == data.post_id && _existingNotifications[j].notification_type != data.notification_type){
                        _alreadyExist = 1;
                        _curNotification = _existingNotifications[j];
                    }
                    else{
                        _newNotifications.unshift(_existingNotifications[j]);
                    }
                }

                if(_alreadyExist == 2){
                    _curNotification.sender_profile_picture = data.notification_sender.profile_image;
                    let _sender = _curNotification.sender_name;
                    _curNotification.sender_name = data.notification_sender.first_name+" "+data.notification_sender.last_name;
                    let _senderFirstArray = _sender.split("and");
                    if(_senderFirstArray.length > 1){
                        let _senderSecondArray = _senderFirstArray[0].trim().split(",");
                        if(_senderSecondArray.length > 1){
                            _curNotification.sender_count++;
                            _curNotification.sender_name += ", "+_senderSecondArray[0].trim()+" and "+_senderSecondArray[1].trim();
                        } else{
                            _curNotification.sender_name += " and "+_senderSecondArray[0].trim();
                        }
                    } else{
                        _curNotification.sender_name += " and "+_senderFirstArray[0].trim();
                    }
                    _newNotifications.unshift(_curNotification);

                }else if(_alreadyExist == 1) {
                    _curNotification.sender_profile_picture = data.notification_sender.profile_image;
                    _curNotification.sender_name = data.notification_sender.first_name+" "+data.notification_sender.last_name;
                    _curNotification.notification_type = data.notification_type;
                    _newNotifications.unshift(_curNotification);

                }else {
                    $.ajax({
                        url: '/notifications/get-details',
                        method: "GET",
                        dataType: "JSON",
                        data: {post_id:data.post_id},
                        headers: { 'prg-auth-header':_this.state.loggedUser.token }
                    }).done( function (data, text) {
                        console.log(data);
                        if(data.status.code == 200){
                            _this.setState({notificationCount:data.unreadCount});
                            _this.setState({notifications:data.notifications});
                        }
                    }.bind(_this));

                }

                _this.setState({notifications:_newNotifications});

            }


        });
    }

    loadNotifications(days){

        $.ajax({
            url: '/notifications/get-notifications',
            method: "GET",
            dataType: "JSON",
            data: {days:days},
            headers: { 'prg-auth-header':this.state.loggedUser.token }
        }).done( function (data, text) {

            if(data.status.code == 200){
                this.setState({notificationCount:data.unreadCount});
                this.setState({notifications:data.notifications});
            }
        }.bind(this));

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

    redirectToNotification(_notification){
        $.ajax({
            url: '/notifications/update-notifications',
            method: "POST",
            dataType: "JSON",
            data:{post_id:_notification.post_id, notification_type:_notification.notification_type},
            headers: { 'prg-auth-header':this.state.loggedUser.token }
        }).done( function (data, text) {
            window.location.href = '/profile/'+_notification.post_owner_username+'/'+_notification.post_id;
        }.bind(this));
    }

    markAllRead(){

        $.ajax({
            url: '/notifications/update-notifications',
            method: "POST",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.state.loggedUser.token }
        }).done( function (data, text) {
            this.loadNotifications();
        }.bind(this));


    }

    allNotifications(){
        this.loadNotifications(2);
        this.setState({seeAllNotifications : true});
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
                                    <p className="greeting-and-notifi">{greating + " " + loggedUser.first_name } {this.state.notificationCount > 0 ? ", you have "+this.state.notificationCount+" Notifications":""}</p>
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
                                                    <label htmlFor="readAll" >Mark All as Read</label>
                                                    <input type="checkbox" id="readAll" onChange={this.markAllRead.bind(this)}/>
                                                    <p className="notifi-sub-link"><i className="fa fa-cog"></i>Settings</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="box-body-wrapper">
                                            {this.state.notifications.length > 5?
                                                <Scrollbars style={{ height: 360 }}>
                                                    <div className="chat-notification-header" id="unread_chat_list">
                                                        <Notification notifications = {this.state.notifications} clickNotification = {this.redirectToNotification.bind(this)}/>
                                                    </div>
                                                </Scrollbars>
                                                :
                                                this.state.notifications.length > 0 ?
                                                    <div className="chat-notification-header" id="unread_chat_list">
                                                        <Notification notifications = {this.state.notifications} clickNotification = {this.redirectToNotification.bind(this)}/>
                                                    </div>
                                                    :
                                                    null

                                            }
                                            {!this.state.seeAllNotifications?
                                                <div className="row row-clr pg-secratery-chat-box-see-all">
                                                    <p onClick={this.allNotifications.bind(this)}>See all</p>
                                                </div>
                                                :
                                                null
                                            }
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

export class Notification extends React.Component{
    constructor(props) {
        super(props);
        this.state={
        };
    }

    render() {
        let _this = this;
        let notifications = this.props.notifications;

        if (notifications.length <= 0) {
            return <div />
        }
        let _notifications = notifications.map(function(notification,key){
            let _classNames = "tab msg-holder "; // unread notification
            if(notification.read_status){ // read notification
                _classNames += "read";
            }
            return (
                <div className={_classNames} key={key}>
                    <a href="javascript:void(0)" onClick={()=>_this.props.clickNotification(notification)}>
                        <div className="chat-pro-img">
                            <img src={notification.sender_profile_picture}/>
                        </div>
                        <div className="chat-body">
                            <p className="connection-name">{notification.sender_name}</p>
                            {notification.sender_count>0?<p> and {notification.sender_count} {notification.sender_count == 1? "other" : "others"} </p>:""}
                            <p className="type-of-action">{notification.notification_type == 'like'?"likes ":"" } {notification.notification_type == 'comment'?"commented on ":"" }
                                {notification.notification_type == 'share'?"shared ":"" }
                                {notification.post_owner_name} post</p>
                            <p className="chat-date">{notification.created_at.time_a_go}</p>
                        </div>
                    </a>
                </div>
            );
        });

        return (
            <div className="conv-holder">
                <div id="NotificationList">
                    {_notifications}
                </div>
            </div>
        );

    }
}
