
import React from 'react'
import Session  from '../../middleware/Session';
import QuickChatBubble from '../chat/QuickChatBubble'
import Chat from '../../middleware/Chat';
import CallCenter from '../../middleware/CallCenter';

export default class QuickChatHandler extends React.Component{
    constructor(props) {
        super(props);

        this.state= {
            chatWith:this.getUrl(),
            userLoggedIn : Session.getSession('prg_lg'),
            my_connections:[],
            chatWithUserName:"",
            unreadConversations:[],
            conversations:[],
            messages:[],
            uri:'usr:proglobe'+this.getUrl(),
            bubbleList : this.props.chatList,
            isNavHidden: this.props.isNavHidden
        };

        this.b6 = CallCenter.b6;
        //CallCenter.initBit6();
        this.convUsers = [];
        this.conversations = [];
        this.unreadConversations = [];
        this.msgDivIds = [];
        this.messages = [];
        this.checkChatWith = this.getUrl();
        this.initChat(this.b6);
        this.loadMyConnections();

        this.onBubbleClose = this.onBubbleClose.bind(this);

    };

    componentWillReceiveProps(nextProps) {
        this.setState({bubbleList: nextProps.chatList, isNavHidden: nextProps.isNavHidden});
    }

    componentDidMount() {
        //Chat.bit6AuthVerification(this.b6);

        //Chat.initGroupChat(this.b6, null, null);
        //Chat.getGroupById(this.b6, "ZU0pxrYOGiPTwWz3R8rpUx");
        //Chat.addMemberToGroupChat(this.b6, null, "ZU0pxrYOGiPTwWz3R8rpUx");
    }

    initChat(b6){
        let _this = this;



        // A conversation has changed
        b6.on('conversation', function(c, op) {
            if(_this.state.bubbleList != 'undefined' || _this.state.bubbleList != null) {
                _this.onConversationChange(c, op, b6);
            }
        });

        // A message has changed
        b6.on('message', function(m, op) {
            if(_this.state.bubbleList != 'undefined' || _this.state.bubbleList != null) {
                _this.onMessageChange(m, op, b6);
            }
        });
    }

    // Convert element id to a Conversation id
    domIdToConversationId(id) {
        let r = id.split('__');
        id = r.length > 0 ? r[1] : id
        return bit6.Conversation.fromDomId(id);
    }

    // Get Chat Tab jQuery selector for a Conversation
    tabDomIdForConversation(c) {
        return '#tab__' + c.domId();
    }

    // Get jQuery selector for a Message
    domIdForMessage(m) {
        return '#msg__' + m.domId();
    };

    // Get Messages Container jQuery selector for a Conversation
    msgsDomIdForConversation(c) {
        return '#msgs__' + c.domId();
    }

    isQuickChatUser(title) {

        for(let chat_con in this.state.bubbleList){
            if(chat_con.title == title) {
                return true;
            }
        }

        return false
    }

    onConversationChange(c,op,b6){

        let conv = {};

        let tabId = this.tabDomIdForConversation(c);
        let msgsId = this.msgsDomIdForConversation(c);

        // Conversation deleted
        if (op < 0) {
            return
        }

        let proglobe_title = b6.getNameFromIdentity(c.id);
        let proglobe_title_array = proglobe_title.split('proglobe');
        let title = proglobe_title_array[1];

        //console.log("conversation chaged to > " + title);

        // New conversation
        if (op > 0) {

            if (c.deleted) {
                return;
            }

            if(title != 'undefined' && title != 'new' && this.isQuickChatUser(title)){

                if(typeof this.convUsers[title] == 'undefined'){
                    for(let my_con in this.state.my_connections){
                        if(title === this.state.my_connections[my_con].user_name){
                            this.convUsers[title] = this.state.my_connections[my_con];
                            conv = {
                                id:tabId.substring(1),
                                tabId:tabId,
                                proglobeTitle:proglobe_title,
                                title:title,
                                user:this.state.my_connections[my_con],
                                connection_status: this.state.my_connections[my_con].connection_status
                            };

                            //Update Conversation data
                            let stamp = Lib.getRelativeTime(c.updated);
                            let latestText = '';
                            let lastMsg = c.getLastMessage();
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
                                let first_conv = this.conversations[0];
                                let first_id = first_conv.id;
                                let first_conv_id = this.domIdToConversationId(first_id);
                                let first_conversation = b6.getConversation(first_conv_id);

                                if (first_conversation && first_conversation.id != c.id && c.updated > first_conversation.updated) {
                                    this.conversations.splice(0,0,conv);
                                    if(typeof this.checkChatWith == 'undefined'){
                                        this.setState({chatWith : conv.title});
                                        this.setState({chatWithUserName:conv.user.first_name+" "+conv.user.last_name});
                                        this.setState({uri : 'usr:proglobe'+conv.title});
                                    }
                                } else{
                                    this.conversations.push(conv);
                                }
                            } else{
                                this.conversations.push(conv);
                                if(typeof this.checkChatWith == 'undefined'){
                                    this.setState({chatWith : conv.title});
                                    this.setState({chatWithUserName:conv.user.first_name+" "+conv.user.last_name});
                                    this.setState({uri : 'usr:proglobe'+conv.title});
                                }
                            }

                            let message = {};
                            message = {
                                id:msgsId,
                                title:title,
                                messages:[]
                            };

                            this.messages.push(message);
                            this.setState({messages:this.messages});
                        }
                    }
                }

            }
        }

        if(op >= 0 && title != 'undefined' && title != 'new' && this.isQuickChatUser(title)){

            // Update Conversation data
            let stamp = Lib.getRelativeTime(c.updated);
            let latestText = '';
            let lastMsg = c.getLastMessage();
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

            for(let con in this.conversations){
                if(this.conversations[con].title == title){
                    this.conversations[con].date = stamp;
                    this.conversations[con].latestMsg = latestText;
                    cur_conv = con;
                }
            }

            if (c.unread > 0 && this.unreadConversations.indexOf(c.id) == -1) {
                this.unreadConversations.push(c.id);
            }

            if(this.conversations.length > 0 && cur_conv !=  0){
                let first_conv = this.conversations[0];
                let first_id = first_conv.id;
                let first_conv_id = this.domIdToConversationId(first_id);
                let first_conversation = b6.getConversation(first_conv_id);

                let current_conv = this.conversations[cur_conv];
                let current_conv_id = current_conv.id;
                let current_conversation_id = this.domIdToConversationId(current_conv_id);
                let current_conversation = b6.getConversation(current_conversation_id);

                if (first_conversation && first_conversation.id != current_conversation.id && current_conversation.updated > first_conversation.updated) {
                    this.conversations.splice(cur_conv,1);
                    this.conversations.splice(0,0,current_conv);
                    if(typeof this.checkChatWith == 'undefined'){
                        this.setState({chatWith : current_conv.title});
                        this.setState({chatWithUserName:current_conv.user.first_name+" "+current_conv.user.last_name});
                        this.setState({uri : 'usr:proglobe'+current_conv.title});
                    }
                }
            }

            if(typeof this.checkChatWith != 'undefined' && this.checkChatWith != 'new' && "usr:"+proglobe_title == this.state.uri){

                //var conversation = b6.getConversation(this.state.uri);

                if (b6.markConversationAsRead(c) > 0) {
                    // Some messages have been marked as read
                    // update chat list
                    if(this.unreadConversations.indexOf(c.id) != -1){
                        this.unreadConversations.splice(this.unreadConversations.indexOf(c.id),1);
                    }
                }

            }
        }

        this.setState({conversations:this.conversations});
        this.setState({unreadConversations:this.unreadConversations});

    }

    onMessageChange(m, op, b6){


        if(op < 0 || Object.keys(m).length > 7){
            return;
        }
        let convId = m.getConversationId();
        let c = b6.getConversation(convId);
        let msgsId = this.msgsDomIdForConversation(c);
        let divId = this.domIdForMessage(m);

        let proglobe_title = b6.getNameFromIdentity(c.id);
        let proglobe_title_array = proglobe_title.split('proglobe');
        let title = proglobe_title_array[1];

        if(this.msgDivIds.indexOf(divId) == -1){
            this.msgDivIds.push(divId);
            //let cssClass = m.incoming() ? 'receiver chat-block' : 'sender chat-block';
            let cssClass = m.incoming() ? 'receiver' : 'sender';

            if (typeof this.props.chatList != 'undefined' && this.props.chatList.length > 0) {
                for (let my_con in this.props.chatList) {
                    let usr_title = "usr:" + this.props.chatList[my_con].proglobeTitle;
                    if (convId == usr_title) {
                        if (m.incoming()) {
                            b6.markMessageAsRead(m);
                        }
                    }
                }
            }

            // Message content to show
            let text = m.content;

            // This is a call history item
            if (m.isCall()) {
                let ch = m.channel();
                let r = [];
                if (ch & bit6.Message.AUDIO) {
                    r.push('Audio');
                }
                if (ch & bit6.Message.VIDEO) {
                    r.push('Video');
                }
                if (ch & bit6.Message.DATA) {
                    if (r.length === 0) {
                        r.push('Data');
                    }
                }
                text = r.join(' + ') + ' Call';
                if (m.data && m.data.duration) {
                    let dur = m.data.duration;
                    let mins = Math.floor(dur / 60);
                    let secs = dur % 60;
                    text += ' - ' + (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
                }
            }

            var updated = false;
            let m_messages = {
                msg_title: title,
                message: []
            };
            let msg = {
                id: divId.substring(1),
                cssClass: cssClass,
                text: text
            };

            this.messages = this.state.messages;

            if (typeof this.messages != 'undefined' && this.messages != null) {
                for (let msgs in this.messages) {
                    if (msgs.msg_title === title) {
                        this.messages[msgs].message.push(msg);
                        updated = true;
                    }
                }
                if (!updated) {
                    m_messages.message.push(msg);
                    this.messages.push(m_messages);
                }
            } else {
                m_messages.message.push(msg);
                this.messages.push(m_messages);
            }

            if (typeof this.state.bubbleList != 'undefined' && this.state.bubbleList.length > 0) {
                this.setState({messages:this.messages});
            }

        }

    }

    loadMyConnections(){
        $.ajax({
            url: '/connection/me/unfriend',
            method: "GET",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.state.userLoggedIn.token }
        }).done(function(data){
            if(data.status.code == 200){
                this.setState({my_connections:data.my_con});
            }
        }.bind(this));
    }

    loadRoute(url){
        this.setState({chatWith : url});
        this.setState({chatWithUserName : ""});
        if(url !== 'new'){
            this.setState({uri:'usr:proglobe'+url});
            this.loadChat(url);
        }
        window.history.pushState('Chat','Chat','/chat/'+url);
    }

    selectChange(e){
        this.loadRoute(e);
        //if(e.target.value.length != 0 ){
        //
        //}else{
        //    console.log("no user selected")
        //}
    }

    getUrl(){
        return  '';
    }

    sendChat(msgObj){
        let user = Session.getSession('prg_lg');
        let _b6 = CallCenter.b6;
        _b6.session.displayName = user.first_name + " " + user.last_name;
        _b6.compose(msgObj.uri).text(msgObj.message).send(function(err) {
            if (err) {
                console.log('error', err);
            }
            else {
                console.log("msg sent");
            }
        }.bind(this));

    };

    doVideoCall(callObj){
        //TODO Call has to be integrated after callcenter is completed
        //Chat.startOutgoingCall(callObj.uri, true);
    };

    doAudioCall(callObj){
        //TODO Call has to be integrated after callcenter is completed
        //Chat.startOutgoingCall(callObj.uri, false);
    };

    makeConversationRead(uri){
        var conv = this.b6.getConversation(uri);

        if (conv != null && this.b6.markConversationAsRead(conv) > 0) {
            // Some messages have been marked as read
            // update chat list
            if(this.unreadConversations.indexOf(conv.id) != -1){
                this.unreadConversations.splice(this.unreadConversations.indexOf(conv.id), 1);
                this.setState({unreadConversations:this.unreadConversations});
            }
            //Chat.updateHeaderUnreadCount(conv.id);
        }
    };

    onBubbleClose(title){
        this.props.bubClose(title);
    };


    render() {

        let _this =  this;

        if(typeof this.props.chatList == 'undefined' || this.props.chatList.length == 0 ){
            return null
        }

        let chats = this.props.chatList.map(function(conv, key){
            return (
                <QuickChatBubble
                    key={key}
                    chatData={conv}
                    messages={_this.state.messages}
                    bubbleClosed={_this.onBubbleClose.bind(this)}
                    sendMyMessage={_this.sendChat.bind(this)}
                    doAudioCall = {_this.doAudioCall.bind(this)}
                    doVideoCall = {_this.doVideoCall.bind(this)}
                    isNavHidden={_this.state.isNavHidden}
                    />
            );
        });

        return (
            <div className="bubble-holder">
                <section className={this.state.isNavHidden == true ? "chat-bubble-holder menu-hidden" : "chat-bubble-holder"}>
                    <div className="container clearfix">
                        {chats}
                    </div>
                </section>
            </div>
        );

    }
}
