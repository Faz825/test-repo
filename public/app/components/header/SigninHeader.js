/**
 * Header is to display menu items for the si
 */
import React from 'react';
import { Link} from 'react-router';
import Logo from './Logo';
import { Scrollbars } from 'react-custom-scrollbars';
import GlobalSearch from './GlobalSearch';
import ProfileImg from './ProfileImg';
import LogoutButton from '../../components/elements/LogoutButton';
import Session from '../../middleware/Session';
import Chat from '../../middleware/Chat';
import Lib from '../../middleware/Lib';
import CallCenter from '../../middleware/CallCenter';
import DummyConversationList from './DummyConversationList'
import FriendRequestList from './FriendRequestList'

export default class Header extends React.Component {

    constructor(props) {
        super(props);
        this.state={
            headerChatUnreadCount:0,
            my_connections:[],
            showChatNotification: false,
            showFriendRequestNotification: false

        }
        this.quickChatUsers = [];
        this.logged_me = Session.getSession('prg_lg');
        if(this.logged_me != null){
            this.loadMyConnections(this.logged_me.token);
        }
    }

    showChatList(){
        $("#chat_notification_wrappersss").toggle();
        //if($("#chat_notification_wrapper").is(':visible')){
        //    $("#chat_notification_a").addClass('chat-notification-wrapper-opened');
        //} else{
        //    $("#chat_notification_a").removeClass('chat-notification-wrapper-opened')
        //}
    }

    loadMyConnections(token){
        $.ajax({
            url: '/connection/me/unfriend',
            method: "GET",
            dataType: "JSON",
            headers: { 'prg-auth-header':token }
        }).done(function(data){
            if(data.status.code == 200){
                this.setState({my_connections:data.my_con});
            }
        }.bind(this));
    }

    initiateQuickChat(conv) {
        this.props.quickChat(conv);
    }

    initiateDummyQuickChat(id) {
        this.props.dummyQuickChat(id);
    }

    toggleChatNotifications() {
        let _ct = this.state.showChatNotification;
        this.setState({
            showFriendRequestNotification: false,
            showChatNotification: !_ct
        });
    }

    toggleFriendRequestNotifications() {
        let _frl = this.state.showFriendRequestNotification;
        this.setState({
            showFriendRequestNotification: !_frl,
            showChatNotification: false
        });
    }

    render(){
        return(
            <header>
                <div className="container">
                    <div className="clearfix">
                        <Logo url ="/images/logo.png" />
                        <GlobalSearch/>
                        <div className="notification-holder clearfix">
                            <div className="news-feed opt-holder">
                                <div className="icon-holder"></div>
                            </div>
                            <div onClick={this.toggleChatNotifications.bind(this)} className="chat-icon opt-holder chat-dropdown-holder dropDown-holder" id="chat_notification_a">
                                <div className="icon-holder"></div>
                                <div id="unread_chat_count_header" className="notifi-num notifi-alert-holder"></div>
                                {
                                    /*<div id="chat_notification_wrapper" className="chat-notification-wrapper">
                                    <img className="drop_downarrow" src="/images/drop_arrow.png" alt="" />
                                        <Scrollbars style={{ height: 260 }}>
                                            {/!*<ConversationList connections={this.state.my_connections} loadQuickChat={this.initiateQuickChat.bind(this)}/>*!/}
                                            <DummyConversationList onMessaging={this.initiateDummyQuickChat.bind(this)}/>
                                            <div className="chat-dropdown-link-holder">
                                                <a href="/chat">See All</a>
                                            </div>
                                        </Scrollbars>
                                    </div>*/
                                }
                            </div>
                            <div onClick={this.toggleFriendRequestNotifications.bind(this)} className="friends-icon opt-holder">
                                <div className="icon-holder"></div>
                                <div className="notifi-alert-holder">
                                    <span className="notifi-num">2</span>
                                </div>
                            </div>
                            <ProfileImg />
                        </div>
                    </div>

                    {this.state.showChatNotification ? <DummyConversationList onMessaging={this.initiateDummyQuickChat.bind(this)}/> : null}
                    {this.state.showFriendRequestNotification ? <FriendRequestList /> : null}

                </div>
            </header>

        );
    }

}

export class ConversationList extends React.Component{
    constructor(props){
        super(props);
        this.state ={
            conversations : []
        };
        this.b6 = CallCenter.b6;
        //CallCenter.initBit6();
        this.initChat(this.b6);
        this.unreadConversationCount = [];
        this.unreadConversationTitles = [];
        this.unreadCount = 0;
        this.conv_ids = [];
        this.convUsers = [];
        this.quickChatUsers = [];
        this.notifiedUsers = [];
    }

    initChat(b6){
        let _this = this;

        // A conversation has changed
        b6.on('conversation', function(c, op) {
            _this.onConversationChange(c, op, b6);
        });
    }

    componentDidMount(){
        console.log("ConversationList componentDidMount")
    }

    checkWorkMode(){

        let _messages = false;

        if(Session.getSession('prg_wm') != null){
            let _currentTime = new Date().getTime();
            let _finishTime = Session.getSession('prg_wm').endTime;

            if (_currentTime > _finishTime){
                Session.destroy("prg_wm");
            } else{
                _messages = Session.getSession('prg_wm').messages;
            }
        }

        return _messages;

    }

    // Update Conversation View
    onConversationChange(c, op, b6) {
        let conv = {};
        let cons = [];

        // Conversation deleted
        if (op < 0) {
            return
        }

        var notificationId = this.notificationDomIdForConversation(c);
        var proglobe_title = b6.getNameFromIdentity(c.id);
        var proglobe_title_array = proglobe_title.split('proglobe');
        var title = proglobe_title_array[1];

        let _blockMessages = this.checkWorkMode();
        let oUser = Session.getSession('prg_lg');

        // New conversation
        if (op > 0) {

            if (c.deleted) {
                return;
            }

            if(title != 'undefined' && typeof this.convUsers[title] == 'undefined'){

                for(let my_con in this.props.connections){

                    if(title === this.props.connections[my_con].user_name){

                        this.convUsers[title] = this.props.connections[my_con];

                        conv = {
                            id:notificationId.substring(1),
                            tabId:notificationId,
                            proglobeTitle:proglobe_title,
                            title:title,
                            user:this.props.connections[my_con],
                            connection_status:this.props.connections[my_con].connection_status
                        };

                        if(this.conv_ids.indexOf(c.id) == -1){
                            this.conv_ids.push(c.id);
                        }

                        //Update Conversation data
                        var stamp = Lib.getRelativeTime(c.updated);
                        var latestText = '';
                        var mId = '';
                        var lastMsg = c.getLastMessage();
                        if (lastMsg) {
                            // Show the text from the latest conversation

                            if (lastMsg.content)
                                latestText = lastMsg.content;
                            // If no text, but has an attachment, show the mime type
                            else if (lastMsg.data && lastMsg.data.type) {
                                latestText = lastMsg.data.type;
                            }
                            if(lastMsg.data && lastMsg.data.id) {
                                mId = lastMsg.data.id;
                            }
                        }

                        conv.date = stamp;
                        conv.latestMsg = latestText;
                        conv.message_id = "msg__m" + mId;

                        cons = this.state.conversations;
                        cons.push(conv);
                        this.setState({conversations:cons});

                        if (c.unread > 0 && this.unreadConversationCount.indexOf(c.id) == -1) {
                            this.unreadCount += 1;
                            this.unreadConversationCount.push(c.id);

                        }

                        if(this.unreadCount > 0 && !_blockMessages){
                            $("#unread_chat_count_header").html('<span class="total notifi-num">'+this.unreadCount+'</span>');
                        } else{
                            $("#unread_chat_count_header").html('');
                        }

                        // IF user is in block messages mode then notify the sender


                        //console.log("c.unread ==> ",c.unread);
                        //console.log("_blockMessages ==> ",_blockMessages);
                        //console.log("this.notifiedUsers.indexOf(c.id) ==> ",this.notifiedUsers.indexOf(c.id));

                        if(c.unread > 0 && _blockMessages && this.notifiedUsers.indexOf(c.id) == -1){

                            let _startTime = Session.getSession('prg_wm').startTimer; console.log("_startTime",_startTime);
                            let _lastMsgTime = c.updated;console.log("_lastMsgTime",_lastMsgTime);
                            //let _now = new Date().getTime();
                            //let _1minsb4 = _now - (60*1000);

                            if(_lastMsgTime > _startTime){



                                let _uri = c.uri; console.log(_uri);
                                let _msg = "On work mode";

                                b6.session.displayName = oUser.first_name + " " + oUser.last_name;
                                b6.compose(_uri).text(_msg).send(function(err) {
                                    if (err) {
                                        console.log('error', err);
                                    }
                                    else {
                                        console.log("msg sent");
                                    }
                                });

                                this.notifiedUsers.push(c.id);

                            }
                        }

                    }
                }
            }
        }
        if(op >= 0 && title != 'undefined'){
            //Update Conversation data
            var stamp = Lib.getRelativeTime(c.updated);
            var latestText = '';
            var lastMsg = c.getLastMessage();
            if (lastMsg) {
                // Show the text from the latest conversation
                if (lastMsg.content)
                    latestText = lastMsg.content;
                // If no text, but has an attachment, show the mime type
                else if (lastMsg.data && lastMsg.data.type) {
                    latestText = lastMsg.data.type;
                }
            }
            var cur_conv = 0;
            var updated = false;

            cons = this.state.conversations;

            for(let con in cons){
                if(cons[con].title == title){
                    cons[con].date = stamp;
                    cons[con].latestMsg = latestText;
                    cur_conv = con;
                    updated = true;
                }
            }

            if(updated) {
                this.setState({conversations:cons});
            }

            if (c.unread > 0 && this.unreadConversationCount.indexOf(c.id) == -1) {
                this.unreadCount += 1;
                this.unreadConversationCount.push(c.id);
            }

            if(this.unreadCount > 0 && !_blockMessages){
                $("#unread_chat_count_header").html('<span class="total notifi-num">'+this.unreadCount+'</span>');
            } else{
                $("#unread_chat_count_header").html('');
            }
        }

    }

    notificationDomIdForConversation(c){
        return '#notification__' + c.domId();
    }

    onLoadQuickChat(conv) {

        this.props.loadQuickChat(conv);
        let _blockMessages = this.checkWorkMode();

        if(this.unreadCount > 0){

            let convId = "usr:" + conv.proglobeTitle;
            let index = this.getUnreadIndex(convId);

            if(index > -1) {

                let c = this.b6.getConversation(convId);

                if (this.b6.markConversationAsRead(c) > 0) {
                    this.unreadConversationCount.splice(index,1);
                    this.unreadCount--;
                    if(this.unreadCount <= 0 || _blockMessages){
                        $("#unread_chat_count_header").html('');
                    } else {
                        $("#unread_chat_count_header").html('<span class="total notifi-num">' + this.unreadCount + '</span>');
                    }
                }
            }
        }
    }

    getUnreadIndex(convId) {
        let index = this.unreadConversationCount.indexOf(convId);
        return index;
    }

    render() {
        let _this = this;
        let convs = this.state.conversations.map(function(conv,key){
            let _classNames = "tab msg-holder ";

            return (
                <div className={_classNames} key={key}>
                    <a href="javascript:void(0)" onClick={()=>_this.onLoadQuickChat(conv)}>
                        <div className="chat-pro-img">
                            <img src={conv.user.images.profile_image.http_url}/>
                        </div>
                        <div className="chat-body">
                            <span className="connection-name">{conv.user.first_name + " " + conv.user.last_name}</span>
                            <p className="msg">{conv.latestMsg}</p>
                            <span className="chat-date">{conv.date}</span>
                        </div>
                    </a>
                </div>
            );
        });

        return (
                <div className="chat-notification-header" id="unread_chat_list">
                    {convs}
                </div>

        )
    }
}
