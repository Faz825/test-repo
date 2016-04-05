/**
 * This is chat index component
 */
import React from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import Session  from '../../middleware/Session';
import Chat  from '../../middleware/Chat';
import {Alert} from '../../config/Alert';

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
            validateAlert:""
        };
        this.b6 = Chat.b6;
        if(this.state.chatWith == 'new'){
            this.loadMyConnections();
        } else{
            this.loadChat(this.state.chatWith);
        }
        this.conversations = [];
        initChat(this.b6);
    };

    initChat(b6){
        // A conversation has changed
        b6.on('conversation', function(c, op) {
            //console.log("A conversation has changed")
            onConversationChange(c, op);
        });
    }

    // Get Chat Tab jQuery selector for a Conversation
    function tabDomIdForConversation(c) {
        return '#tab__' + c.domId();
    }

    // Get Messages Container jQuery selector for a Conversation
    function msgsDomIdForConversation(c) {
        return '#msgs__' + c.domId();
    }

    onConversationChange(c, op){
        // Update Conversation View
        function onConversationChange(c, op) {
            console.log("onConversationChange from INDEX")
            var tabId = tabDomIdForConversation(c);
            var msgsId = msgsDomIdForConversation(c);

             //Conversation deleted
            if (op < 0) {

                return
            }

            var proglobe_title = b6.getNameFromIdentity(c.id);
            var proglobe_title_array = proglobe_title.split('proglobe');
            var title = proglobe_title_array[1];

            // New conversation
            if (op > 0) {

                if (c.deleted) {
                    return;
                }

                if(title != 'undefined'){

                    $.ajax({
                        url: '/get-profile/'+title,
                        method: "GET",
                        dataType: "JSON",
                        success: function (data, text) {

                            if (data.status.code == 200 && data.profile_data != null) {

                                convUsers[title] = data.profile_data;
                                latestChatUser = title;

                                // Entry in the Chat List
                                if(currentChatUserName == proglobe_title){
                                    currentChatUser = data.profile_data;
                                    tabDiv = $('<div class="tab msg-holder msg-holder-selected" />')
                                        .attr('id', tabId.substring(1))
                                        .append(chatListADiv);
                                    $("#chat_with").html(currentChatUser['first_name']+" "+currentChatUser['last_name']);
                                } else{
                                    tabDiv = $('<div class="tab msg-holder" />')
                                        .attr('id', tabId.substring(1))
                                        .append(chatListADiv);
                                }
                                chatList.append(tabDiv);

                                // Create a container for message list for this conversation
                                msgsDiv = $('<div class="msgs" />')
                                    .attr('id', msgsId.substring(1))
                                    .hide();
                                $('#msgList').append(msgsDiv);

                                //console.log("notificationId.substring(1) => "+notificationId.substring(1))

                                //TODO::Show only 5 and if more display 'see all'
                                notificationDiv = $('<div class="tab msg-holder" />')
                                    .attr('id', notificationId.substring(1))
                                    .append(notificationListADiv);
                                notificationWrapperDiv.append(notificationDiv)

                                //Update Conversation data
                                var stamp = getRelativeTime(c.updated);
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

                                var connection_name = convUsers[title]['first_name']+" "+convUsers[title]['last_name'];
                                var connection_prof_img = '/images/default-profile-pic.png';

                                if (convUsers[title]['images'] != null && convUsers[title]['images']['profile_image'] != null) {
                                    connection_prof_img = convUsers[title]['images']['profile_image']['http_url']
                                }

                                // Apply data to DOM
                                tabDiv.find('a').attr('href', '/chat/'+title);
                                tabDiv.find('.chat-pro-img').find('img').attr('src', connection_prof_img);
                                tabDiv.find('.chat-body').find('.connection-name').html(connection_name);
                                tabDiv.find('.chat-body').find('.msg').html(latestText);
                                tabDiv.find('.chat-body').find('.chat-date').html(stamp);

                                notificationDiv.find('a').attr('href', '/chat/'+title);
                                notificationDiv.find('.chat-pro-img').find('img').attr('src', connection_prof_img);
                                notificationDiv.find('.chat-body').find('.connection-name').html(connection_name);
                                notificationDiv.find('.chat-body').find('.msg').html(latestText);
                                notificationDiv.find('.chat-body').find('.chat-date').html(stamp);

                                // If the updated conversation is newer than the top one -
                                // move this conversation to the top
                                var top = chatList.children(':first');
                                if (top.length > 0 && title != 'undefined') {
                                    var topTabId = top.attr('id');
                                    //console.log("1 => "+topTabId)
                                    var topConvId = domIdToConversationId(topTabId);
                                    var topConv = b6.getConversation(topConvId);

                                    if (topConv && topConv.id != c.id && c.updated > topConv.updated) {
                                        top.before(tabDiv);
                                    }
                                }

                                // If the updated conversation is newer than the top one -
                                // move this conversation to the top
                                var notificationTop = notificationWrapperDiv.children(':first');
                                if (notificationTop.length > 0 && title != 'undefined') {
                                    var notificationTopTabId = notificationTop.attr('id');
                                    //console.log("2 => "+notificationTopTabId)
                                    var notificationTopConvId = domIdToConversationId(notificationTopTabId);
                                    var notificationTopConv = b6.getConversation(notificationTopConvId);

                                    if (notificationTopConv && notificationTopConv.id != c.id && c.updated > notificationTopConv.updated) {
                                        notificationTop.before(notificationDiv);
                                    }
                                }

                                if (c.unread > 0 && unreadConversationCount.indexOf(c.id) == -1) {
                                    unreadCount += 1;
                                    unreadConversationCount.push(c.id);
                                }

                                if(currentChatUri != null){

                                    showTheConversation(currentChatUri);

                                    //var conv = b6.getConversation(currentChatUri);
                                    //
                                    //if(conv != null){
                                    //
                                    //    // Mark all messages as read
                                    //    if (b6.markConversationAsRead(conv) > 0) {
                                    //        // Some messages have been marked as read
                                    //        // update chat list
                                    //        if(unreadConversationCount.indexOf(c.id) != -1){
                                    //            unreadCount -= 1;
                                    //            unreadConversationCount.splice(c.id);
                                    //        }
                                    //    }
                                    //
                                    //
                                    //    var msgsDiv = $( msgsDomIdForConversation(conv) );
                                    //    // Show only message container for this conversation
                                    //    // Hide all the other message containers
                                    //    msgsDiv.show().siblings().hide();
                                    //    // Scroll to the bottom of the conversation
                                    //    //scrollToLastMessage();
                                    //
                                    //    // Request focus for the compose message text field
                                    //    $('#msgText').focus();
                                    //
                                    //}

                                }

                                for(var i = 0; i < c.messages.length; i++){
                                    onMessageChange(c.messages[i], op)
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

            if(op >= 0 && title != 'undefined'){
                //console.log("existing conversation");

                // Update Conversation data
                var stamp = getRelativeTime(c.updated);
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

                tabDiv.find('.chat-body').find('.msg').html(latestText);
                tabDiv.find('.chat-body').find('.chat-date').html(stamp);

                notificationDiv.find('.chat-body').find('.msg').html(latestText);
                notificationDiv.find('.chat-body').find('.chat-date').html(stamp);

                // If the updated conversation is newer than the top one -
                // move this conversation to the top
                var top = chatList.children(':first');
                if (top.length > 0 && title != 'undefined') {
                    var topTabId = top.attr('id');
                    var topConvId = domIdToConversationId(topTabId);
                    var topConv = b6.getConversation(topConvId);

                    if (topConv && topConv.id != c.id && c.updated > topConv.updated) {
                        //console.log("going to move the top ")
                        top.before(tabDiv);
                    }
                }

                // If the updated conversation is newer than the top one -
                // move this conversation to the top
                var notificationTop = notificationWrapperDiv.children(':first'); //console.log(notificationTop)
                if (notificationTop.length > 0 && title != 'undefined') {
                    var notificationTopTabId = notificationTop.attr('id');
                    var notificationTopConvId = domIdToConversationId(notificationTopTabId);
                    var notificationTopConv = b6.getConversation(notificationTopConvId);

                    if (notificationTopConv && notificationTopConv.id != c.id && c.updated > notificationTopConv.updated) {
                        notificationTop.before(notificationDiv);
                    }
                }

                if (c.unread > 0 && unreadConversationCount.indexOf(c.id) == -1) {
                    unreadCount += 1;
                    unreadConversationCount.push(c.id);
                }

                if(currentChatUri != null){

                    var conv = b6.getConversation(currentChatUri);

                    if (conv != null && b6.markConversationAsRead(conv) > 0) {
                        // Some messages have been marked as read
                        // update chat list
                        if(unreadConversationCount.indexOf(c.id) != -1){
                            unreadCount -= 1;
                            unreadConversationCount.splice(c.id);
                        }
                    }

                }
            }

            //console.log("Index of "+c.id+" = "+unreadConversationCount.indexOf(c.id));
            //console.log("unreadConversationCount.length => "+unreadConversationCount.length);

            if(unreadCount > 0){
                $("#unread_inbox_p").find('.total').remove();
                $("#unread_inbox_p").append('<span class="total">'+unreadCount+'</span>');
                $("#unread_chat_count_header").html('<span class="total">'+unreadCount+'</span>');
            }

        }
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
            validateAlert
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
                        <LeftMenu />
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
                        <ChatList />
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
        this.state ={};
        this.loggedUser = this.props.loggedUser;
    }
    render() {
        return (
            <div className="chat-inbox-options col-sm-4">
                <div className="inbox">
                    <p id="unread_inbox_p">inbox</p>
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
        this.state ={};
        this.loggedUser = this.props.loggedUser;
    }
    render() {
        return (
            <div className="conv-holder col-sm-4">
                <Scrollbars style={{ height: 486 }} autoHide={true} autoHideTimeout={1000} autoHideDuration={200}>
                    <div id="chatList">
                        <a href="">
                            <div class="chat-pro-img">
                                <img src="" alt="" width="40" height="40"/>
                            </div>
                            <div class="chat-body">
                                <span class="connection-name"></span>
                                <p class="msg"></p>
                                <span class="chat-date"></span>
                            </div>
                        </a>
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