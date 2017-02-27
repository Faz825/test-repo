/**
 * Quick chat unread conversation list component
 */
import React from 'react';
import { Link} from 'react-router';
import { Scrollbars } from 'react-custom-scrollbars';
import Session from '../../middleware/Session';
import Chat from '../../middleware/Chat';
import Lib from '../../middleware/Lib';
import CallCenter from '../../middleware/CallCenter';

export default class ConversationList extends React.Component{
    constructor(props){
        super(props);
        this.state ={
            conversations : this.props.conversations,
            connections: this.props.connections,
            showChatNotification: this.props.showChatNotification
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

    componentWillReceiveProps(nextProps) {
        //console.log("ConversationList componentWillReceiveProps")
        this.setState({connections: nextProps.connections, conversations: nextProps.conversations, showChatNotification: nextProps.showChatNotification});
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

    setToConnections(_list) {
        this.props.chatConversations(_list);
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
                for(let my_con in this.state.connections){
                    if(title === this.state.connections[my_con].user_name){
                        this.convUsers[title] = this.state.connections[my_con];

                        conv = {
                            id:notificationId.substring(1),
                            tabId:notificationId,
                            proglobeTitle:proglobe_title,
                            title:title,
                            user:this.state.connections[my_con],
                            connection_status:this.state.connections[my_con].connection_status
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
                        //this.setState({conversations:cons});

                        this.setToConnections(cons);

                        if (c.unread > 0 && this.unreadConversationCount.indexOf(c.id) == -1) {
                            this.unreadCount += 1;
                            this.unreadConversationCount.push(c.id);

                        }

                        if(this.unreadCount > 0 && !_blockMessages){
                            //$("#unread_chat_count_header").html('<span class="total notifi-num">'+this.unreadCount+'</span>');
                            this.props.unreadChatCount(this.unreadCount);
                        } else{
                            //$("#unread_chat_count_header").html('');
                            this.props.unreadChatCount(0);
                        }



                        // IF user is in block messages mode then notify the sender


                        //console.log("c.unread ==> ",c.unread);
                        //console.log("_blockMessages ==> ",_blockMessages);
                        //console.log("this.notifiedUsers.indexOf(c.id) ==> ",this.notifiedUsers.indexOf(c.id));

                        if(c.unread > 0 && _blockMessages && this.notifiedUsers.indexOf(c.id) == -1){

                            let _startTime = Session.getSession('prg_wm').startTimer;
                            let _lastMsgTime = c.updated;
                            //let _now = new Date().getTime();
                            //let _1minsb4 = _now - (60*1000);

                            if(_lastMsgTime > _startTime){



                                let _uri = c.uri;
                                console.log(_uri);
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

            } else {
                if(title != 'undefined' && typeof this.convUsers[title] == 'undefined'){
                    for(let my_con in this.state.connections){
                        if(title === this.state.connections[my_con].user_name) {
                            this.convUsers[title] = this.state.connections[my_con];

                            conv = {
                                id:notificationId.substring(1),
                                tabId:notificationId,
                                proglobeTitle:proglobe_title,
                                title:title,
                                user:this.state.connections[my_con],
                                connection_status:this.state.connections[my_con].connection_status
                            };

                            //Update Conversation data
                            var mId = '';
                            if (lastMsg) {
                                if(lastMsg.data && lastMsg.data.id) {
                                    mId = lastMsg.data.id;
                                }
                            }

                            conv.date = stamp;
                            conv.latestMsg = latestText;
                            conv.message_id = "msg__m" + mId;

                            cons = this.state.conversations;
                            cons.push(conv);
                            //this.setState({conversations:cons});
                        }
                    }
                }
            }

            this.setToConnections(cons);

            if (c.unread > 0 && this.unreadConversationCount.indexOf(c.id) == -1) {
                this.unreadCount += 1;
                this.unreadConversationCount.push(c.id);
            }

            if(this.unreadCount > 0 && !_blockMessages){
                //$("#unread_chat_count_header").html('<span class="total notifi-num">'+this.unreadCount+'</span>');
                this.props.unreadChatCount(this.unreadCount);
            } else{
                //$("#unread_chat_count_header").html('');
                this.props.unreadChatCount(0);
            }


        }

    }

    notificationDomIdForConversation(c){
        return '#notification__' + c.domId();
    }

    onLoadQuickChat(conv, _unreads) {
        //console.log("onLoadQuickChat > ");
        this.props.loadQuickChat(conv);
        let _blockMessages = this.checkWorkMode();

        let convId = "usr:" + conv.proglobeTitle;
        let index = this.getUnreadIndex(convId);

        if(this.unreadCount > 0){

            if(index > -1) {

                let c = this.b6.getConversation(convId);

                if (this.b6.markConversationAsRead(c) > 0) {
                    this.unreadConversationCount.splice(index,1);
                    this.unreadCount--;
                    if(this.unreadCount <= 0 || _blockMessages){
                        //$("#unread_chat_count_header").html('');
                        this.props.unreadChatCount(0);
                    } else {
                        //$("#unread_chat_count_header").html('<span class="total notifi-num">' + this.unreadCount + '</span>');
                        this.props.unreadChatCount(this.unreadCount);
                    }
                }
            }
        } else {
            this.props.unreadChatCount(0);
        }
    }

    getUnreadIndex(convId) {
        let index = this.unreadConversationCount.indexOf(convId);
        return index;
    }

    render() {
        /*let _this = this;
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

         )*/

        //console.log('this.state.conversations >>', this.state.conversations);

        let _count = this.state.conversations.length;

        let _this = this;
        let _convs = this.state.conversations.map(function(conv,key){

            let convId = "usr:" + conv.proglobeTitle;
            let _index = _this.getUnreadIndex(convId);

            return (
                <div className={_index > -1 ? "chat-item clearfix unread" : "chat-item clearfix"} onClick={()=>_this.onLoadQuickChat(conv, _this.unreadCount)} key={key}>
                    <div className="prof-img">
                        <img src={conv.user.images.profile_image.http_url} className="img-responsive" />
                    </div>
                    <div className="chat-preview">
                        <div className="chat-preview-header clearfix">
                            <h3 className="prof-name">{conv.user.first_name + " " + conv.user.last_name}</h3>
                            <p className="chat-time">@ {conv.date}</p>
                        </div>
                        <p className="chat-msg">{conv.latestMsg}</p>
                        <span className="mark-read" title="mark as read"></span>
                    </div>
                </div>
            );

        });

        return (
            (this.state.showChatNotification) ?
                <section className="chat-popover-holder">
                    <div className="inner-wrapper">
                        <div className="popover-header">
                            <div className="top-section clearfix">
                                <p className="inbox-count header-text clearfix">
                                    <span className="count">({_count})</span>inbox
                                </p>
                                <p className="mark-all header-text">mark all as read</p>
                                <p className="new-msg header-text">new message</p>
                            </div>
                            <div className="bottom-section">
                                <input type="text" className="form-control" />
                            </div>
                        </div>
                        <div className="chat-list-holder">
                            <Scrollbars style={{ height: 355 }}>
                                {_convs}
                            </Scrollbars>
                        </div>
                        <p className="see-all">see all</p>
                    </div>
                </section>
                :
                null

        );
    }
}