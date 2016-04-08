/**
 * This is chat index component
 */
import React from 'react';
import ReactDom from 'react-dom'
import { Scrollbars } from 'react-custom-scrollbars';
import Session  from '../../middleware/Session';
import Chat  from '../../middleware/Chat';
import {Alert} from '../../config/Alert';
import ChatListView from '../../components/elements/ChatListView';

let errorStyles = {
    color         : "#ed0909",
    fontSize      : "0.8em",
    textTransform : "capitalize",
    margin        : '0 0 15px',
    display       : "block"
};

export default class Index extends React.Component{
    constructor(props) {
        super(props);

        if (window.location.protocol == 'http:' ) {
            var url_arr = window.location.href.split('http');
            window.location.href = 'https'+url_arr[1];
        }

        this.state= {
            chatWith:this.getUrl(),
            userLoggedIn : Session.getSession('prg_lg'),
            my_connections:[],
            chatWithUserName:"",
            validateAlert:"",
            unreadConversations:[],
            conversations:[]
        };

        this.b6 = Chat.b6;

        if(this.state.chatWith == 'new'){
            this.loadMyConnections();
        } else{
            this.loadChat(this.state.chatWith);
        }
        this.initChat(this.b6);
        this.convUsers = [];
        this.conversations = [];
        this.unreadConversations = [];
    };

    initChat(b6){
        let _this = this;
        b6.on('conversation', function(c, op) {
            window.setTimeout(function() {
                _this.onConversationChange(c, op, b6);
                console.log("am I .")
            }, 2000);

        });
    }

    // Get Chat Tab jQuery selector for a Conversation
    tabDomIdForConversation(c) {
        return '#tab__' + c.domId();
    }

    getRelativeTime(stamp) {
        var now = Date.now();
        // 24 hours in milliseconds
        var t24h = 24 * 60 * 60 * 1000;
        var d = new Date(stamp);
        var s = (now - stamp > t24h) ? d.toLocaleDateString() : d.toLocaleTimeString();
        return s;
    }

    onConversationChange(c,op,b6){

        var conv = {};

        let _unreadCount = this.state.unreadCount;
        _unreadCount++;
        console.log(_unreadCount);

        var tabId = this.tabDomIdForConversation(c);

        // Conversation deleted
        if (op < 0) {
            return
        }

        var proglobe_title = b6.getNameFromIdentity(c.id);
        var proglobe_title_array = proglobe_title.split('proglobe');
        var title = proglobe_title_array[1];

        //console.log(title);

        // New conversation
        if (op > 0) {

            if (c.deleted) {
                return;
            }

            if(title != 'undefined' && title != 'new'){


                $.ajax({
                    url: '/get-profile/'+title,
                    method: "GET",
                    dataType: "JSON",
                    success: function (data, text) {

                        if (data.status.code == 200 && data.profile_data != null) {

                            //console.log("here => ", data.profile_data);

                            this.convUsers[title] = data.profile_data;
                            conv = {
                                id:tabId.substring(1),
                                tabId:tabId,
                                proglobeTitle:proglobe_title,
                                title:title,
                                user:data.profile_data
                            };

                            //TODO::Show only 5 and if more display 'see all'

                            //Update Conversation data
                            var stamp = this.getRelativeTime(c.updated);
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

                            conv.date = stamp;
                            conv.latestMsg = latestText;

                            if (c.unread > 0 && this.unreadConversations.indexOf(c.id) == -1) {
                                this.unreadConversations.push(c.id);
                            }

                            this.conversations.push(conv)
                        }
                    }.bind(this),
                    error: function (request, status, error) {
                        console.log(request.responseText);
                        console.log(status);
                        console.log(error);
                    }
                });

            }
        }

        if(op >= 0 && title != 'undefined' && title != 'new'){
            //console.log("existing conversation");

            // Update Conversation data
            var stamp = this.getRelativeTime(c.updated);
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

            conv.date = stamp;
            conv.latestMsg = latestText;

            if (c.unread > 0 && this.unreadConversations.indexOf(c.id) == -1) {
                this.unreadConversations.push(c.id);
            }


        }



        this.setState({unreadConversations:this.unreadConversations});
        this.setState({headerChatUnreadCount:_unreadCount});
        this.setState({conversations:this.conversations});
        this.setState({unreadCount:_unreadCount});

        if(_unreadCount > 0){
            ReactDom.render((
                <span class="total">{this.state.headerChatUnreadCount}</span>
            ), document.getElementById('unread_chat_count_header'));
        }



        //console.log("this.state.unreadConversations => ");
        //console.log(this.state.unreadConversations);

        //console.log("this.state.conversations => ");
        //console.log(this.state.conversations);

    }

    loadMyConnections(){
        $.ajax({
            url: '/connection/me',
            method: "GET",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.state.userLoggedIn.token }
        }).done(function(data){
            if(data.status.code == 200){
                this.setState({my_connections:data.my_con})
            }
        }.bind(this));
    }

    loadChat(chatWith){
        let _this = this;
        if(chatWith != 'undefined'){
            $.ajax({
                url: '/get-profile/' + chatWith,
                method: "GET",
                dataType: "JSON"
            }).done(function(data){
                if (data.status.code == 200 && data.profile_data != null) {
                    this.setState({chatWithUserName:data.profile_data.first_name+" "+data.profile_data.last_name});
                    this.uri = 'usr:proglobe'+chatWith;
                    Chat.showMessages(this.uri);
                }
            }.bind(this));
        }
    }

    loadRoute(url){
        let _this = this;
        _this.setState({chatWith : url});
        _this.setState({chatWithUserName : ""});
        if(url == 'new'){
            this.loadMyConnections();
        }else{
            this.loadChat(url);
        }
        window.history.pushState('Chat','Chat','/chat/'+url);
    }

    selectChange(e){
        if(e.target.value.length != 0 ){
            this.loadRoute(e.target.value);
        }else{
            console.log("no user selected")
        }
    }

    getUrl(){
        return  this.props.params.chatWith;
    }

    sendChat(){

        let _this = this;

        var msg = $("#msgText").val();

        if(typeof this.state.chatWith == 'undefined' || this.state.chatWith == 'new'){
            _this.setState({validateAlert: Alert.EMPTY_RECEIVER+"send message"});
            return 0;
        } else if(msg==""){
            _this.setState({validateAlert: Alert.EMPTY_MESSAGE});
            return 0;
        } else{
            _this.setState({validateAlert: ""});
            this.b6.compose(this.uri).text(msg).send(function(err) {
                $("#msgText").val("");
                if (err) {
                    console.log('error', err);
                }
                else {
                    console.log("msg sent");
                }
            });
        }

    }

    doVideoCall(){

        let _this = this;

        if(typeof _this.state.chatWith == 'undefined' || this.state.chatWith == 'new'){
            _this.setState({validateAlert: Alert.EMPTY_RECEIVER+"make audio call"});
            return 0;
        } else{
            _this.setState({validateAlert: ""});
            Chat.startOutgoingCall(this.uri, true);
        }

    }

    doAudioCall(){

        let _this = this;

        if(typeof _this.state.chatWith == 'undefined' || this.state.chatWith == 'new'){
            _this.setState({validateAlert: Alert.EMPTY_RECEIVER+"make video call"});
            return 0;
        } else{
            _this.setState({validateAlert: ""});
            Chat.startOutgoingCall(this.uri, false);
        }

    }

    render() {

        const {
            chatWith,
            userLoggedIn,
            my_connections,
            chatWithUserName,
            validateAlert,
            conversations,
            unreadConversations,
            unreadCount
            }=this.state;

        console.log("rendering");
        console.log(conversations);


        let convs = conversations.map(function(conv,key){
            console.log("let")

            return (
                <div className="tab msg-holder" key={key}>
                    <a href="javascript:void(0)">
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
            <div className="pg-middle-chat-screen-area container-fluid">
                <div className="pg-middle-chat-content-header pg-chat-screen-header">
                    <div className="container">
                        <h2>Message and video calls</h2>
                    </div>
                </div>
                <div className="chat-window container">
                    <div className="header">
                        <LeftMenu unreadConversations = {unreadConversations} unreadCount = {unreadCount}/>
                        <RightMenu
                            loadRoute ={this.loadRoute.bind(this)}
                            chatWith = {chatWith}
                            chatWithUserName = {chatWithUserName}
                            my_connections = {my_connections}
                            selectChange = {this.selectChange.bind(this)}
                            doAudioCall = {this.doAudioCall.bind(this)}
                            doVideoCall = {this.doVideoCall.bind(this)}
                            />
                    </div>
                    <div className="chat-body">

                        <div className="conv-holder col-sm-4">
                            <Scrollbars style={{ height: 486 }} autoHide={true} autoHideTimeout={1000} autoHideDuration={200}>
                                <div id="chatList">
                                    {convs}
                                </div>
                            </Scrollbars>
                        </div>
                        <MessageList
                            loggedUser = {userLoggedIn}
                            chatWith = {chatWith}
                            sendChat = {this.sendChat.bind(this)}
                            validateAlert = {validateAlert}
                            />
                    </div>
                </div>
            </div>
        );
    }
}


export class LeftMenu extends React.Component{
    constructor(props){
        super(props)
        this.state ={
        };
        this.loggedUser = this.props.loggedUser;
    }
    render() {
        return (
            <div className="chat-inbox-options col-sm-4">
                <div className="inbox">
                    <p id="unread_inbox_p">inbox

                        {this.props.unreadCount > 0 ? <span className="total">{this.props.unreadCount}</span> : null}
                    </p>
                </div>
                <div className="otherMsg">
                    <p>Other</p>
                </div>
                <div className="more">
                    <p>more...</p>
                </div>
            </div>
        )
    }
}


export class RightMenu extends React.Component{
    constructor(props){
        super(props)
        this.state ={};
        this.loggedUser = this.props.loggedUser;
    }
    render() {
        return (
            <div className="col-sm-8 chat-person-options">
                <div className="connection-name">
                    <p id="chat_with">{this.props.chatWithUserName}</p>
                </div>
                {
                    (this.props.chatWith == 'new')?
                        <div className="connection-list btn btn-default">
                            <select id="connection_list"
                                    className="pgs-sign-select"
                                    onChange={this.props.selectChange}>
                                <option/>
                                {this.props.my_connections.map(function(connection, i){
                                    return <option value={connection.user_name}
                                                   key={i}
                                        >
                                        {connection.first_name+" "+connection.last_name}</option>;
                                })}
                            </select>
                        </div> : null
                }
                <div className="media-options-holder">
                    <div className="media-options">
                        {
                            (this.props.chatWith !== 'new')?
                                <span className="opt new-message">
                                                <a href='#' onClick={()=>this.props.loadRoute('new')}>New Message</a>
                                            </span> : null
                        }
                                    <span className="opt chat-icon">
                                        <i className="fa"></i>
                                    </span>
                                    <span className="opt video-icon" onClick={this.props.doVideoCall}>
                                        <i className="fa fa-video-camera"></i>
                                    </span>
                                    <span className="opt call-icon" onClick={this.props.doAudioCall}>
                                        <i className="fa fa-phone"></i>
                                    </span>
                                    <span className="opt search-icon">
                                        <i className="fa fa-search"></i>
                                    </span>
                    </div>
                    <div className="all-media btn btn-default">
                        <span className="btn-text">All Media</span>
                        <i className="fa fa-caret-down"></i>
                    </div>
                </div>
            </div>
        )
    }
}


export class ChatList extends React.Component{
    constructor(props){
        super(props)
        this.state ={
            //conversations :this.props.conversations
        };
        this.loggedUser = this.props.loggedUser;
        console.log("ChatList => ");
        //console.log(this.state.conversations);
    }
    render() {
        //const {conversations} =this.state;
        let _this = this;

        return (
            <div className="conv-holder col-sm-4">
                <Scrollbars style={{ height: 486 }} autoHide={true} autoHideTimeout={1000} autoHideDuration={200}>
                    <div id="chatList">
                        {conv}
                    </div>
                </Scrollbars>
            </div>
        )
    }
}


export class MessageList extends React.Component{
    constructor(props){
        super(props)
        this.state ={};
        this.loggedUser = this.props.loggedUser;
    }
    render() {
        return (
            <div className="chat-msg-holder col-sm-8">
                <div className="chat-view">
                    <Scrollbars style={{ height: 335 }} autoHide={true} autoHideTimeout={1000} autoHideDuration={200}>
                        <div id="msgListRow">
                            <div className="col-xs-12">
                                <div id="msgList"></div>
                            </div>
                        </div>
                    </Scrollbars>
                </div>
                <div className="chat-msg-input-holder">
                    {
                        (this.loggedUser.profile_image != null ? <img src={this.loggedUser.profile_image} alt="" width="40" height="40" id="my_profile_img"/>:<img src="/images/default-profile-pic.png" alt="" width="40" height="40" id="my_profile_img"/>)
                    }

                    <div className="msg-input">
                        <textarea className="form-control" placeholder="New Message..." id="msgText" name="msg" ></textarea>
                    </div>
                    {this.props.validateAlert ? <p className="form-validation-alert" style={errorStyles} >{this.props.validateAlert}</p> : null}
                </div>
                <div className="chat-msg-options-holder">
                    <div className="send-msg">
                        <span className="send-msg-helper-text">Press enter to send</span>
                        <span className="btn btn-default send-btn" onClick={this.props.sendChat}>Send</span>
                    </div>
                </div>
            </div>
        )
    }
}