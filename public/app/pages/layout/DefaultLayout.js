import React from 'react'
import SignupIndex from '../signup/Index';
import SigninHeader from '../../components/header/SigninHeader'
import SidebarNav from '../../components/sidebarNav/SidebarNav'
import FooterHolder from '../../components/footer/FooterHolder'
import Session  from '../../middleware/Session';
import Dashboard  from '../dashboard/Dashboard';
import InCallPane  from '../chat/InCallPane';
//import QuickChatBubble from '../../components/chat/QuickChatBubble'
//import QuickChat from '../chat/QuickChat'
import QuickChatBubble from '../chat/QuickChatBubble'
import Chat from '../../middleware/Chat';

export default class DefaultLayout extends React.Component{
    constructor(props){
        super(props);

        this.state={
            chatBubble:[]
        }

    }

    loadQuickChat(val){
        console.log("quick chant clicked");
        console.log(val);
        this.setState({chatBubble:val});
    }

    render(){



        return(
            <div className="row row-clr pg-full-wrapper">
                <SigninHeader quickChat={this.loadQuickChat.bind(this)} />
                <SidebarNav side="left" menuItems={{items:[
                  {"name": "Notes", "link" : "/notes", "imgName": "nav-ico-2"},
                  {"name": "Folders", "link" : "/folders", "imgName": "folder-icon"},
                  {"name": "Doc", "link" : "/doc", "imgName": "document-icon"},
                  {"name": "Pro Calendar", "link" : "/calender-weeks", "imgName": "nav-ico-5"}
                ]
              }}/>

                <SidebarNav side="right" menuItems={{items:[
                  {"name": "News", "link" : "/news", "imgName": "nav-ico-1"},
                  {"name": "interests", "link" : "/interests", "imgName": "nav-ico-8"},
                  {"name": "Groups", "link" : "/professional-networks", "imgName": "nav-ico-10"},
                  {"name": "Call Center", "link" : "/chat", "imgName": "call-center-icon"}
                ]
              }}/>
                <div className="row row-clr pg-middle-sign-wrapper">
                    <div className="container-fluid pg-custom-container">
                        {this.props.children || <Dashboard />}
                    </div>
                </div>
                <FooterHolder />
                <InCallPane />
                <QuickChatHandler chatList={this.state.chatBubble}/>
            </div>
        );
    }
}

export class QuickChatMain extends React.Component{
    constructor(props) {
        super(props);

        this.state ={
            cc : {},
            ops : -1,
            mm : '',
            type : ''
        };

        this.bubbleList = this.props.chatList;

        this.b6 = Chat.b6;
        this.initChat(this.b6);



    };

    initChat(b6){
        let _this = this;

        // A conversation has changed
        b6.on('conversation', function(c, op) {
            //console.log("11111111111111111 -------");
            //_this.onConversationChange(c, op, b6);
            _this.setState({cc:c, ops:op, type: 'conversation'});
        });

        // A message has changed
        b6.on('message', function(m, op) {
            //_this.onMessageChange(m, op, b6);
        });
    }



    render() {


        //console.log(this.props.chatList);
        let _this =  this;

        if(this.props.chatList == 'undifined' || this.props.chatList == null ){
            return (<div />)
        }

        let chats = this.props.chatList.map(function(conv, key){
            return (
                <QuickChatTest key={key} chatData={conv} ops={_this.state.ops} cc={_this.state.cc} type={_this.state.type} b66={_this.b6}/>
            );
        });

        return (
            <div>
                {chats}
            </div>
        );

    }
}


export class QuickChatHandler extends React.Component{
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
            uri:'usr:proglobe'+this.getUrl()
        };

        this.b6 = Chat.b6;
        this.convUsers = [];
        this.conversations = [];
        this.unreadConversations = [];
        this.msgDivIds = [];
        this.messages = [];
        this.checkChatWith = this.getUrl();
        this.initChat(this.b6);
        //this.loadChat(this.state.chatWith);
        this.loadMyConnections();

        this.bubbleList = this.props.chatList;

    };

    initChat(b6){
        let _this = this;



        // A conversation has changed
        b6.on('conversation', function(c, op) {
            if(_this.bubbleList != 'undefined' || _this.bubbleList != null) {
                _this.onConversationChange(c, op, b6);
            }
        });

        // A message has changed
        b6.on('message', function(m, op) {
            if(_this.bubbleList != 'undefined' || _this.bubbleList != null) {
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

        for(let chat_con in this.bubbleList){
            if(chat_con.title == title) {
                return true;
            }
        }

        return false
    }

    onConversationChange(c,op,b6){
        //console.log("loading bubble conversations ------- 555");
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
                                user:this.state.my_connections[my_con]
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
                                        //window.history.pushState('Chat','Chat','/chat/'+conv.title);
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
                                    //window.history.pushState('Chat','Chat','/chat/'+conv.title);
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
                        //window.history.pushState('Chat','Chat','/chat/'+current_conv.title);
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
        if(this.msgDivIds.indexOf(divId) == -1){
            this.msgDivIds.push(divId);
            let cssClass = m.incoming() ? 'receiver' : 'sender';

            if(typeof this.checkChatWith != 'undefined' && this.checkChatWith != 'new'){
                if (convId == this.state.uri) {
                    // Mark this new message as read since it is on the screen
                    if (m.incoming()) {
                        b6.markMessageAsRead(m);
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


            //let my_name = '';
            //let my_prof_img = '/images/default-profile-pic.png';
            //let other_name = '';
            //let other_prof_img = '/images/default-profile-pic.png';
            //
            //if (this.state.userLoggedIn != null) {
            //    my_name = this.state.userLoggedIn['first_name'] + " " + this.state.userLoggedIn['last_name'];
            //    if (this.state.userLoggedIn['profile_image'] != null) {
            //        my_prof_img = this.state.userLoggedIn['profile_image'];
            //    }
            //}
            //
            //let other_array = m.other.split('proglobe');
            //let other = other_array[1];
            //
            //if (this.convUsers != null && this.convUsers[other] != null) {
            //    other_name = this.convUsers[other]['first_name'] + ' ' + this.convUsers[other]['last_name'];
            //    if (this.convUsers[other]['images'] != null && this.convUsers[other]['images']['profile_image'] != null) {
            //        other_prof_img = this.convUsers[other]['images']['profile_image']['http_url']
            //    }
            //}
            //
            //var display_name = m.incoming() ? other_name : my_name;
            //var display_prof_img = m.incoming() ? other_prof_img : my_prof_img;

            let msg = {
                id:divId.substring(1),
                cssClass:cssClass,
                text:text
            };

            var updated = false;
            for(let con in this.messages){
                if(this.messages[con].id == msgsId){
                    this.messages[con].messages.push(msg);
                    updated = true;
                }
            }
            if(!updated) {
                this.messages.push(msg);
            }
            //console.log(this.messages);
            this.setState({messages:this.messages});
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
                this.setState({my_connections:data.my_con});
            }
        }.bind(this));
    }

    loadChat(chatWith){
        if(chatWith != 'undefined' && chatWith != 'new'){
            this.checkChatWith = chatWith;
            $.ajax({
                url: '/get-profile/' + chatWith,
                method: "GET",
                dataType: "JSON"
            }).done(function(data){
                if (data.status.code == 200 && data.profile_data != null) {
                    this.setState({chatWithUserName:data.profile_data.first_name+" "+data.profile_data.last_name});
                    this.makeConversationRead(this.state.uri);
                }
            }.bind(this));
        }
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

    sendChat(msg, title, uri){

        this.checkChatWith = title;
        this.makeConversationRead(uri);

        this.b6.compose(this.state.uri).text(msg).send(function(err) {
            if (err) {
                console.log('error', err);
            }
            else {
                console.log("msg sent");
            }
        });

    }

    doVideoCall(){

        let _this = this;

        if(typeof _this.state.chatWith == 'undefined' || this.state.chatWith == 'new'){
            _this.setState({validateAlert: Alert.EMPTY_RECEIVER+"make audio call"});
            return 0;
        } else{
            _this.setState({validateAlert: ""});
            this.checkChatWith = this.getUrl();
            this.makeConversationRead(this.state.uri);
            Chat.startOutgoingCall(this.state.uri, true);
        }

    }

    doAudioCall(){

        let _this = this;

        if(typeof _this.state.chatWith == 'undefined' || this.state.chatWith == 'new'){
            _this.setState({validateAlert: Alert.EMPTY_RECEIVER+"make video call"});
            return 0;
        } else{
            _this.setState({validateAlert: ""});
            this.checkChatWith = this.getUrl();
            this.makeConversationRead(this.state.uri);
            Chat.startOutgoingCall(this.state.uri, false);
        }

    }

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
    }



    render() {

        //console.log(this.props.chatList);
        let _this =  this;

        if(this.props.chatList == 'undifined' || this.props.chatList == null ){
            return (<div />)
        }

        let chats = this.props.chatList.map(function(conv, key){
            return (
                <QuickChatBubble key={key} chatData={conv} messages={_this.state.messages} />
            );
        });

        return (
            <div>
                {chats}
            </div>
        );

    }
}




