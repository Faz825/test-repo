/**
 * This is chat index component
 */
import React from 'react';
import ReactDom from 'react-dom';
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
            }, 1000);
        });
    }

    // Convert element id to a Conversation id
    domIdToConversationId(id) {
        var r = id.split('__');
        id = r.length > 0 ? r[1] : id
        return bit6.Conversation.fromDomId(id);
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

                            if(this.conversations.length > 0){
                                var first_conv = this.conversations[0];
                                var first_id = first_conv.id;
                                //console.log("2 => "+notificationTopTabId)
                                var first_conv_id = this.domIdToConversationId(first_id);
                                var first_conversation = b6.getConversation(first_conv_id);

                                if (first_conversation && first_conversation.id != c.id && c.updated > first_conversation.updated) {
                                    this.conversations.splice(0,0,conv);
                                } else{
                                    this.conversations.push(conv);
                                }
                            } else{
                                this.conversations.push(conv);
                            }
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

            var i = 0;
            var cur_conv = 0;
            for(let con in this.conversations){
                console.log(con);
                if(con.title == title){
                    this.conversations[i].date = stamp;
                    this.conversations[i].latestMsg = latestText;
                    cur_conv = i;
                }
                i++;
            }

            if (c.unread > 0 && this.unreadConversations.indexOf(c.id) == -1) {
                this.unreadConversations.push(c.id);
            }

            if(this.conversations.length > 0){
                var first_conv = this.conversations[0];
                var first_id = first_conv.id;
                var first_conv_id = this.domIdToConversationId(first_id);
                var first_conversation = b6.getConversation(first_conv_id);

                var current_conv = this.conversations[cur_conv];
                var current_conv_id = current_conv.id;
                //console.log("2 => "+notificationTopTabId)
                var current_conversation_id = this.domIdToConversationId(current_conv_id);
                var current_conversation = b6.getConversation(current_conversation_id);


                if (first_conversation && first_conversation.id != current_conversation.id && current_conversation.updated > first_conversation.updated) {
                    this.conversations.splice(0,0,current_conv);
                    this.conversations.splice(0,0,current_conv);

                }
            }
        }

        this.setState({unreadConversations:this.unreadConversations});
        this.setState({conversations:this.conversations});

        //if(_unreadCount > 0){
        //    ReactDom.render((
        //        <span className="total">{this.state.headerChatUnreadCount}</span>
        //    ), document.getElementById('unread_chat_count_header'));
        //}

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
        this.setState({chatWith : url});
        this.setState({chatWithUserName : ""});
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

    sendChat(formData){

        console.log("Global sendChat")

        console.log(formData)

        console.log(this.uri)


        //var msg = $("#msgText").val();

        //if(typeof this.state.chatWith == 'undefined' || this.state.chatWith == 'new'){
        //    _this.setState({validateAlert: Alert.EMPTY_RECEIVER+"send message"});
        //    return 0;
        //} else if(msg==""){
        //    _this.setState({validateAlert: Alert.EMPTY_MESSAGE});
        //    return 0;
        //} else{
        //    _this.setState({validateAlert: ""});
            this.b6.compose(this.uri).text(formData.msg).send(function(err) {
                if (err) {
                    console.log('error', err);
                }
                else {
                    console.log("msg sent");
                }
            });
        //}

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
            conversations,
            unreadConversations
            }=this.state;

        return (
            <div className="pg-middle-chat-screen-area container-fluid">
                <div className="pg-middle-chat-content-header pg-chat-screen-header">
                    <div className="container">
                        <h2>Message and video calls</h2>
                    </div>
                </div>
                <div className="chat-window container">
                    <div className="header">
                        <LeftMenu unreadConversations = {unreadConversations}/>
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
                        <ChatList conversations = {conversations} chatWith = {chatWith}/>
                        <div className="chat-msg-holder col-sm-8">
                            <MessageList
                                loggedUser = {userLoggedIn}
                                chatWith = {chatWith}
                                sendChat = {this.sendChat.bind(this)}
                                />
                            <ComposeMessage loggedUser = {userLoggedIn}
                                            chatWith = {chatWith}
                                            sendChat = {this.sendChat.bind(this)}/>
                        </div>
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
        super(props);
        this.state ={};
        this.loggedUser = this.props.loggedUser;
    }
    render() {
        let convs = this.props.conversations.map(function(conv,key){

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
            <div className="conv-holder col-sm-4">
                <Scrollbars style={{ height: 486 }} autoHide={true} autoHideTimeout={1000} autoHideDuration={200}>
                    <div id="chatList">
                        {convs}
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
                <div className="chat-view">
                    <Scrollbars style={{ height: 335 }} autoHide={true} autoHideTimeout={1000} autoHideDuration={200}>
                        <div id="msgListRow">
                            <div className="col-xs-12">
                                <div id="msgList"></div>
                            </div>
                        </div>
                    </Scrollbars>
                </div>
        )
    }
}


export class ComposeMessage extends React.Component{
    constructor(props) {
        super(props);
        this.loggedUser = this.props.loggedUser;
        this.state = {
            validateAlert: "",
            formData: {}
        };
        this.elementChangeHandler = this.elementChangeHandler.bind(this);
    }

    elementChangeHandler(event){

        this.state.formData['msg'] = event.target.value;

        let _error = "";
        if(this.state.formData['msg'] == ""){
            _error = Alert.EMPTY_MESSAGE;
        }
        this.setState({validateAlert:_error})

    }

    sendMessage(e){
        e.preventDefault();
        let _this = this;
        console.log(this.props.chatWith);
        if(typeof this.props.chatWith == 'undefined' || this.props.chatWith == 'new'){
            this.setState({validateAlert: Alert.EMPTY_RECEIVER+"send message"});
            return 0;
        } else if(!this.state.formData['msg'] || this.state.formData['msg'] == "") {
            console.log(this.state.formData);
            this.setState({validateAlert: Alert.EMPTY_MESSAGE});
        } else{
                this.state.formData['status'] = 1;
                this.props.sendChat(this.state.formData);
                this.setState({validateAlert: ""});
                this.setState({formData: {}});
        }
    }

    render(){
        //let formData = this.state.formData;
        return(
            <form onSubmit={this.sendMessage.bind(this)}>
                <div className="chat-msg-input-holder">
                    {
                        (this.loggedUser.profile_image != null ? <img src={this.loggedUser.profile_image} alt="" width="40" height="40" id="my_profile_img"/>:<img src="/images/default-profile-pic.png" alt="" width="40" height="40" id="my_profile_img"/>)
                    }
                    <div className="msg-input">
                        <textarea className="form-control" placeholder="New Message..." name="msg" value={this.state.formData.msg}
                                  onChange={(event)=>{ this.elementChangeHandler(event)}}></textarea>
                    </div>
                    {this.state.validateAlert ? <p className="form-validation-alert" style={errorStyles} >{this.state.validateAlert}</p> : null}
                </div>
                <div className="chat-msg-options-holder">
                    <div className="send-msg">
                        <span className="send-msg-helper-text">Press enter to send</span>
                        <button type="submit" className="btn btn-default send-btn">Send</button>
                    </div>
                </div>
            </form>
        )
    }
}