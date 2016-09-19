import React from "react";
import Session  from '../../middleware/Session';
import Socket  from '../../middleware/Socket';
import { Scrollbars } from 'react-custom-scrollbars';

export default class NotificationPop extends React.Component{
    constructor(props){
        super(props);

        if(Session.getSession('prg_lg') == null){
            window.location.href = "/";
        }

        this.state={
            loggedUser:Session.getSession('prg_lg'),
            hours: "",
            minutes: "",
            notifications: [],
            notificationCount: this.props.notifyCount,
            seeAllNotifications: false,
            resultHeader:[],
            eleList:[],
            telNumber: "",
            selectedOpt: "",
            customHours: "",
            customMins: "",
            notifiType: this.props.notifiType
        };

        this.currentPage = 1;
        this.days = 1;
        this.listenToNotification();
        this.elementsList = [];
        this.loadNotifications();
    }

    componentWillReceiveProps(nextProps){
        this.setState({notifiType: nextProps.notifiType, notificationCount: nextProps.notifyCount});
    }

    listenToNotification(){
        let _this = this;

        Socket.listenToNotification(function(data){

            let _notificationType = typeof data.notification_type != "undefined" ? data.notification_type : data.data.notification_type;

            _this.loadNotifications();

        });
    }


    redirectToNotification(_notification){

        if(_notification.notification_type != 'Birthday' && _notification.notification_type != "share_notebook"){

            if(!_notification.read_status) {
                $.ajax({
                    url: '/notifications/update-notifications',
                    method: "POST",
                    dataType: "JSON",
                    data:{post_id:_notification.post_id, notification_type:_notification.notification_type, notification_id:_notification.notification_id},
                    headers: { 'prg-auth-header':this.state.loggedUser.token }
                }).done( function (data, text) {

                    if(_notification.notification_type == "share_notebook_response") {
                        this.loadNotifications();
                    } else {
                        window.location.href = '/profile/'+_notification.post_owner_username+'/'+_notification.post_id;
                    }

                }.bind(this));

            } else {

                if(_notification.notification_type != "share_notebook_response") {
                    window.location.href = '/profile/'+_notification.post_owner_username+'/'+_notification.post_id;
                }
            }

        }

    }

    loadNotifications(){
        var _data = {};
        if(this.days == 1){
            _data = {days:this.days, pg:this.currentPage}
        } else{
            _data = {pg:this.currentPage}
        }

        $.ajax({
            url: '/notifications/get-notifications',
            method: "GET",
            dataType: "JSON",
            data: _data,
            headers: { 'prg-auth-header':this.state.loggedUser.token }
        }).done( function (data, text) {

            if(data.status.code == 200){
                if(this.days == 1){
                    this.setState({notificationCount:data.unreadCount,resultHeader:data.header});
                }
                this.setState({notifications:data.notifications});
                this.elementsList = [];
                for(var i = 0; i < this.state.notifications.length; i++){
                    this.elementsList.push(this.state.notifications[i]);
                }
                this.setState({eleList: this.elementsList});
            }
        }.bind(this));

    }

    onUpdateSharedNoteBook(notification, stt) {

        if(typeof notification.notebook_id != 'undefined' && notification.notification_type == "share_notebook" && !notification.read_status){

            $.ajax({
                url: '/notifications/notebook-update',
                method: "POST",
                dataType: "JSON",
                data:{notebook_id:notification.notebook_id, notification_type:notification.notification_type, notification_id:notification.notification_id, status:stt, updating_user:notification.sender_id},
                headers: { 'prg-auth-header':this.state.loggedUser.token }
            }).done( function (data, text) {

                let _notificationData = {
                    notebook_id:notification.notebook_id,
                    notification_type:"share_notebook_response",
                    notification_sender:this.state.loggedUser,
                    notification_receiver:notification.sender_user_name
                };

                Socket.sendNotebookNotification(_notificationData);

                if(stt == 'REQUEST_REJECTED') {
                    this.loadNotifications();
                } else {
                    window.location.href = '/notes';
                }

            }.bind(this));
        }
    }

    render(){
        let elementsList = this.state.eleList;
        let type = this.state.notifiType;
        let notifiTypeTitle;
        let icon;
        const {
            notificationCount,
            }=this.state;

        if(type == "todos"){
            notifiTypeTitle = "ToDos";
            icon = "fa-list-alt";
        }else if(type == "social"){
            notifiTypeTitle = "Social Notifications";
            icon = "fa-globe";
        }else{
            notifiTypeTitle = "Productivity Notifications";
            icon = "fa-line-chart";
        }

        return(
            <div className="notifi-popup-holder">
                <div className="inner-wrapper">
                    <div className="header-holder">
                        <h3 className="section-title"><i className={"fa " + icon}></i>{notifiTypeTitle}</h3>
                        <span className="notifi-count">({notificationCount})</span>
                        <span className="fa fa-angle-left arrow"></span>
                        <span className="fa fa-angle-right arrow"></span>
                        <span className="close fa fa-times" onClick={() => this.props.onNotifiClose()}></span>
                    </div>
                    <div className="notifications-holder">
                        <Scrollbars style={{ height: 318 }}>
                            <Notification notifications = {elementsList}
                                updateNoteBook = {this.onUpdateSharedNoteBook.bind(this)} clickNotification = {this.redirectToNotification.bind(this)}/>
                        </Scrollbars>
                    </div>
                    <div className="all-notifications">
                        <a href="/notifications">See all</a>
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
            notificationList:this.props.notifications
        };
    }

    componentWillReceiveProps(nextProps){
        this.setState({notificationList: nextProps.notifications});
    }

    render() {
        let _this = this;
        let notifications = this.state.notificationList;

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
                        <div className="notification-body">
                            <p className="connection-name">{notification.sender_name}</p>
                            {notification.sender_count>0?<p className="extra-cont"> and {notification.sender_count} {notification.sender_count == 1? "other" : "others"} </p>:""}
                            <p className="type-of-action">
                                {notification.notification_type == 'like'?"likes ":"" }
                                {notification.notification_type == 'comment'?"commented on ":"" }
                                {notification.notification_type == 'share'?"shared ":"" }
                                {notification.notification_type == 'Birthday'?"has their bithday "+notification.birthday:"" }
                                {notification.notification_type != 'Birthday' &&
                                    notification.notification_type != 'share_notebook' &&
                                    notification.notification_type != 'share_notebook_response'
                                    ? notification.post_owner_name +" post":null}
                                {notification.notification_type == 'share_notebook' ? notification.post_owner_name +" has invited you to collaborate on " + notification.notebook_name :null}
                                {notification.notification_type == 'share_notebook_response' ? notification.post_owner_name + " has " + notification.notification_status + " your invitation to collaborate on " + notification.notebook_name :null}
                            </p>
                            <p className="chat-date">{notification.created_at.time_a_go}</p>

                            {notification.notification_type == 'share_notebook'  && !notification.read_status ? <button className="btn btn-default" onClick={()=>_this.props.updateNoteBook(notification, 'REQUEST_ACCEPTED')}>Accept</button> : null}
                            {notification.notification_type == 'share_notebook'  && !notification.read_status ? <button className="btn btn-default reject" onClick={()=>_this.props.updateNoteBook(notification, 'REQUEST_REJECTED')}>Decline</button> : null}

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
