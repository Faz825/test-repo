import React from "react";
import Session  from '../../middleware/Session';
import Socket  from '../../middleware/Socket';

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
            notificationCount: 0,
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
        this.setState({notifiType: nextProps.notifiType});
    }

    listenToNotification(){
        let _this = this;

        Socket.listenToNotification(function(data){

            let _existingNotifications = _this.state.eleList;
            let _newNotifications = [];
            let _oldNotification = {}, _newNotification = {};
            let _alreadyExist = false;

            let _notificationType = typeof data.notification_type != "undefined" ? data.notification_type : data.data.notification_type;


            if(_notificationType == "share_notebook") {
                window.location.reload();

            } else if(_notificationType == "Birthday") {
                _this.state.notificationCount++;
                _newNotifications.push(data);
                for (var j = 0; j < _existingNotifications.length; j++) {
                    _newNotifications.push(_existingNotifications[j]);
                }
                //_this.state.eleList = _newNotifications;
                this.setState({eleList: _newNotifications});
                //_this.setState({notifications:_newNotifications});

            } else if(_notificationType == "share_notebook_response") {
                window.location.reload();

            } else {
                if(data.user != _this.state.loggedUser.user_name){

                    _this.state.notificationCount++;

                    for(var j = _existingNotifications.length - 1; j >= 0; j--){
                        if(_existingNotifications[j].post_id == data.data.post_id && _existingNotifications[j].notification_type == data.data.notification_type){
                            _alreadyExist = true;
                            _oldNotification = _existingNotifications[j];
                        } else{
                            _newNotifications.unshift(_existingNotifications[j]);
                        }
                    }

                    if(_alreadyExist == true){

                        let _oldsender = _oldNotification.sender_name;
                        let _newsender = data.data.notification_sender.first_name+" "+data.data.notification_sender.last_name;
                        let _oldSenderCount = _oldNotification.sender_count;

                        let _senderFirstArray = _oldsender.split("and");

                        if(_senderFirstArray.length > 1){
                            let _senderSecondArray = _senderFirstArray[0].trim().split(",");
                            if(_senderSecondArray.length > 1){
                                _oldSenderCount++;
                                _newsender += ", "+_senderSecondArray[0].trim()+" and "+_senderSecondArray[1].trim();
                            } else{
                                _newsender += " and "+_senderSecondArray[0].trim();
                            }
                        } else{
                            _newsender += " and "+_senderFirstArray[0].trim();
                        }

                        let _createdAt = _oldNotification.created_at;
                        _createdAt['time_a_go'] = 'Just Now';

                        _newNotification = {
                            post_id:_oldNotification.post_id,
                            notification_type:_oldNotification.notification_type,
                            read_status:false,
                            created_at:_createdAt,
                            post_owner_username:_oldNotification.post_owner_username,
                            post_owner_name:_oldNotification.post_owner_name,
                            sender_profile_picture:data.data.notification_sender.profile_image,
                            sender_name:_newsender,
                            sender_count:_oldSenderCount
                        };
                        _newNotifications.unshift(_newNotification);
                    }else{
                        $.ajax({
                            url: '/notifications/get-details',
                            method: "GET",
                            dataType: "JSON",
                            data: {post_id:data.data.post_id, notification_type:data.data.notification_type},
                            headers: { 'prg-auth-header':_this.state.loggedUser.token }
                        }).done( function (data, text) {
                            if(data.status.code == 200){
                                _newNotifications.unshift(data.data);
                            }
                        }.bind(_this));

                    }

                    //_this.setState({notifications:_newNotifications});
                    //_this.elementsList = _newNotifications;
                    this.setState({eleList: _newNotifications});
                }

            }
        });
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
                for(var i = 0; i < this.state.notifications.length; i++){
                    this.elementsList.push(this.state.notifications[i]);
                }
                this.setState({eleList: this.elementsList});
            }
        }.bind(this));

    }

    onUpdateSharedNoteBook(notification, stt) {

        if(typeof notification.notebook_id != 'undefined' && notification.notification_type == "share_notebook"){

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
                        window.location.reload();
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
            notifications,
            notificationCount
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
        console.log(type);

        return(
            <div className="notifi-popup-holder">
                <div className="inner-wrapper">
                    <div className="header-holder">
                        <h3 className="section-title"><i className={"fa " + icon}></i>{notifiTypeTitle}</h3>
                        <span className="notifi-count">(7)</span>
                        <span className="fa fa-angle-left arrow"></span>
                        <span className="fa fa-angle-right arrow"></span>
                    </div>
                    <div className="notifications-holder">
                        <Notification notifications = {elementsList}
                                      updateNoteBook = {this.onUpdateSharedNoteBook.bind(this)} />
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
                                {notification.notification_type == 'share_notebook' ? notification.post_owner_name +" has invited you to collaborate on a notebook" :null}
                                {notification.notification_type == 'share_notebook_response' ? notification.post_owner_name + " has " + notification.notification_status + " your notebook invitation" :null}
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
