
/**
 * This is quick chat component
 */
import React from 'react';
import ReactDom from 'react-dom';
import { Scrollbars } from 'react-custom-scrollbars';
import Session from '../../middleware/Session';
import Chat from '../../middleware/Chat';
import {Alert} from '../../config/Alert';
import Lib from '../../middleware/Lib';
import Autosuggest from 'react-autosuggest';

let errorStyles = {
    color         : "#ed0909",
    fontSize      : "0.8em",
    textTransform : "capitalize",
    margin        : '0 0 15px',
    display       : "block"
};

let unfriendStyles = {
    color         : "#ed0909",
    fontSize      : "0.8em",
    margin        : "0 15px"
};

export default class QuickChatBubble extends React.Component{
    constructor(props) {
        super(props);

        this.state ={
            userLoggedIn : Session.getSession('prg_lg'),
            messages:[],
            uri:'usr:proglobe'+this.props.chatData.title,
            isMinimized : false,
            isNavHidden: this.props.isNavHidden,
            chatData: this.props.chatData,
            isActiveBubble: this.props.isActiveBubble

        };

        this.messages = [];
        this.onChatMinimize = this.onChatMinimize.bind(this);
    };

    componentDidMount() {
        for (let m in this.props.messages) {
            if (this.props.chatData.title == this.props.messages[m].msg_title) {
                this.messages.push(this.props.messages[m].message[0]);
            }
        }
        this.setState({messages:this.messages});
    }

    componentWillReceiveProps(nextProps) {

        this.messages = [];
        for (let m in this.props.messages) {
            if (nextProps.chatData.title == this.props.messages[m].msg_title) {
                this.messages.push(this.props.messages[m].message[0]);
            }
        }
        this.setState({messages:{}});
        this.setState({messages:this.messages, isNavHidden: nextProps.isNavHidden, chatData: nextProps.chatData, isActiveBubble: nextProps.isActiveBubble});
    }

    //shouldComponentUpdate(nextProps, nextState) {
    //    if (this.props.conv.title !== nextProps.conv.title) {
    //        this.messages = [];
    //        for (let m in this.props.messages) {
    //            if (nextProps.conv.title == this.props.messages[m].msg_title) {
    //                this.messages.push(this.props.messages[m].message[0]);
    //            }
    //        }
    //        this.setState({messages: this.messages});
    //    }
    //    return this.props.conv.title !== nextProps.conv.title;
    //}

    onbubbleClosed(data){
        this.props.bubbleClosed(data.title);

        //for(let key in this.refs) {
        //    if(key == data.title){
        //        const unmountNode = this.refs[key];
        //        let unmount = ReactDom.unmountComponentAtNode(unmountNode);
        //    }
        //}
    }

    sendMsg(msg){
        this.props.sendMyMessage(msg);
    }

    doVideoCall(){

        let callBody = {
            title: this.state.chatData.title,
            uri: this.state.uri
        }
        this.props.doVideoCall(callBody);
    }

    doAudioCall(){
        let callBody = {
            title: this.state.chatData.title,
            uri: this.state.uri
        }
        this.props.doAudioCall(callBody);
    }

    onLoadProfile(){
        window.location.href = '/profile/'+this.state.chatData.user.user_name;
    }

    onChatMinimize(state){
        if(state){
            this.setState({isMinimized: true});
        }else{
            this.setState({isMinimized: false});
        }
    }

    render() {
        const {
            userLoggedIn,
            messages
            }=this.state;

        if(this.state.chatData.id == "NEW_CHAT_MESSAGE") {

            return (

                <div>
                    <NewChatMessage
                        conv={this.state.chatData}
                        bubbleClose={this.onbubbleClosed.bind(this)}
                        doAudioCall = {this.doAudioCall.bind(this)}
                        doVideoCall = {this.doVideoCall.bind(this)}
                        onLoadProfile = {this.onLoadProfile.bind(this)}
                        onMinimize = {this.onChatMinimize.bind(this)}

                        loggedUser = {userLoggedIn}
                        messages = {messages}
                        minimizeChat = {this.state.isMinimized}

                        sendChat={this.sendMsg.bind(this)}
                        setActiveBubbleId= {this.props.setActiveBubbleId}
                        isActiveBubble= {this.state.isActiveBubble}
                        my_connections={this.props.my_connections}
                        setNewChatToList= {this.props.setNewChatToList}
                    />
                </div>

            );

        } else {
            return (

                <div>
                    <ChatHeader
                        conv={this.state.chatData}
                        bubbleClose={this.onbubbleClosed.bind(this)}
                        doAudioCall = {this.doAudioCall.bind(this)}
                        doVideoCall = {this.doVideoCall.bind(this)}
                        onLoadProfile = {this.onLoadProfile.bind(this)}
                        onMinimize = {this.onChatMinimize.bind(this)}

                        loggedUser = {userLoggedIn}
                        messages = {messages}
                        minimizeChat = {this.state.isMinimized}

                        sendChat={this.sendMsg.bind(this)}
                        setActiveBubbleId= {this.props.setActiveBubbleId}
                        isActiveBubble= {this.state.isActiveBubble}
                        my_connections={this.props.my_connections}
                        setNewChatToList= {this.props.setNewChatToList}
                    />
                </div>

            );
        }



        /*return (



            {
                /!*<div className={(this.state.isMinimized)? "chat-popup popup-minimized" : "chat-popup"} ref={this.props.chatData.title}>
                    <div className="row inner-wrapper q-chat">
                        <ChatHeader
                            conv={this.props.chatData}
                            bubbleClose={this.onbubbleClosed.bind(this)}
                            doAudioCall = {this.doAudioCall.bind(this)}
                            doVideoCall = {this.doVideoCall.bind(this)}
                            onLoadProfile = {this.onLoadProfile.bind(this)}
                            onMinimize = {this.onChatMinimize.bind(this)}
                            />
                        <MessageList
                            conv={this.props.chatData}
                            loggedUser = {userLoggedIn}
                            messages = {messages}
                            minimizeChat = {this.state.isMinimized}
                            />
                        <ComposeMessage
                            sendChat={this.sendMsg.bind(this)}
                            conv={this.props.chatData}
                            minimizeChat = {this.state.isMinimized}
                            />
                    </div>
                </div>*!/
            }

        );*/

    }
}

export class NewChatMessage extends React.Component{
    constructor(props){
        super(props)
        this.state ={
            minimized: this.props.minimizeChat,
            conversations: this.props.conv,
            userLoggedIn: Session.getSession('prg_lg'),
            messages: this.props.messages,
            isActiveBubble: this.props.isActiveBubble,
            suggestions: [],
            suggestionsList: [],
            value: ''
        };

        this.onMinimiseClick = this.onMinimiseClick.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onSuggestionsUpdateRequested = this.onSuggestionsUpdateRequested.bind(this);
        this.getSuggestionValue = this.getSuggestionValue.bind(this);
        this.isMinimized = false;
    }

    componentWillReceiveProps(nextProps) {
        this.setState({minimized:nextProps.minimizeChat, conversations: nextProps.conv, messages: nextProps.messages, isActiveBubble: nextProps.isActiveBubble});
    }

    onCloseClick(e){
        this.props.bubbleClose(this.props.conv);
    }

    onMinimiseClick(e){
        this.isMinimized = !this.state.minimized;
        this.props.onMinimize(this.isMinimized);
    }

    onHeaderClick(e) {
        let convId = "usr:" + this.state.conversations.proglobeTitle;
        this.props.setActiveBubbleId(convId);
    }

    getSuggestions(value, data) {
        const escapedValue = Lib.escapeRegexCharacters(value.trim());
        if (escapedValue === '') {
            return [];
        }
        const regex = new RegExp('^' + escapedValue, 'i');
        return data.filter(data => regex.test(data.first_name+" "+data.last_name));
    }

    getSuggestionValue(suggestion) {
        this.props.setNewChatToList(this.props.conv, suggestion.user_name);
        return suggestion.first_name + " " + suggestion.last_name;
    }

    renderSuggestion(suggestion) {
        return (
            <div id={suggestion.user_id} className="user">{suggestion.first_name+" "+suggestion.last_name}</div>
        );
    }

    onChange(event, { newValue }) {
        this.setState({ value: newValue });
    }

    onSuggestionsUpdateRequested({ value }) {
        this.setState({
            suggestions: this.getSuggestions(value, this.props.my_connections),
            suggestionsList : this.getSuggestions(value, this.props.my_connections)
        });
    }

    render() {

        const {
            conversations,
            value,
            suggestions
            } = this.state;

        let user = conversations.user;

        const inputProps = {
            placeholder: 'To',
            value,
            onChange: this.onChange
        };

        return (
            <div className={this.state.isActiveBubble ? "chat-bubble new active" : "chat-bubble new"}>
                <div className="bubble-header clearfix" id="hdr_btn" onClick={this.onHeaderClick.bind(this)}>
                    <div className="username-holder">
                        <h3 className="name">new message</h3>
                    </div>
                    <div className="opt-icons clearfix">
                        <span className="icon close-icon"  id="cls_btn" onClick={this.onCloseClick.bind(this)}></span>
                    </div>
                </div>
                <div className="conv-holder">
                    <div className="pick-user">
                        <div className="users-popup">

                        <Autosuggest suggestions={suggestions}
                                     onSuggestionsUpdateRequested={this.onSuggestionsUpdateRequested}
                                     getSuggestionValue={this.getSuggestionValue}
                                     renderSuggestion={this.renderSuggestion}
                                     inputProps={inputProps} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}


export class ChatHeader extends React.Component{
    constructor(props){
        super(props)
        this.state ={
            minimized: this.props.minimizeChat,
            conversations: this.props.conv,
            userLoggedIn: Session.getSession('prg_lg'),
            messages: this.props.messages,
            isActiveBubble: this.props.isActiveBubble,
        };

        this.onMinimiseClick = this.onMinimiseClick.bind(this);
        this.isMinimized = false;
    }

    componentWillReceiveProps(nextProps) {
        this.setState({minimized:nextProps.minimizeChat, conversations: nextProps.conv, messages: nextProps.messages, isActiveBubble: nextProps.isActiveBubble});
    }

    onCloseClick(e){
        this.props.bubbleClose(this.props.conv);
    }

    onMinimiseClick(e){
        this.isMinimized = !this.state.minimized;
        this.props.onMinimize(this.isMinimized);
    }

    onHeaderClick(e) {
        let convId = "usr:" + this.state.conversations.proglobeTitle;
        this.props.setActiveBubbleId(convId);
    }

    render() {

        const {
            conversations,
            minimized,
            userLoggedIn,
            messages
            } = this.state;

        let user = conversations.user;

        return (
            (minimized)?
                <div className="chat-bubble minimized" onClick={this.onMinimiseClick.bind(this)}>
                    <div className="bubble-header clearfix">
                        <div className="pro-pic">
                            <img src={user.images.profile_image.http_url} alt={user.first_name + " " + user.last_name} onClick={this.props.onLoadProfile} className="img-responsive" />
                        </div>
                        <div className="username-holder"  onClick={this.onMinimiseClick.bind(this)}>
                            <h3 className="name" onClick={this.onMinimiseClick.bind(this)}>{user.first_name + " " + user.last_name}</h3>
                            {
                                (typeof conversations.connection_status != 'undefined' && conversations.connection_status == 'CONNECTION_UNFRIEND') ?
                                    <span className="all-media-btn">( Not a Friend )</span>
                                    :
                                    <span className="all-media-btn">all media</span>
                            }
                        </div>
                        <div className="opt-icons clearfix">
                            <span className="icon close-icon" onClick={this.onCloseClick.bind(this)}></span>
                        </div>
                    </div>
                </div>
                :
                <div className={this.state.isActiveBubble ? "chat-bubble active" : "chat-bubble"}>
                    <div className="bubble-header clearfix" id="hdr_btn" onClick={this.onHeaderClick.bind(this)}>
                        <div className="pro-pic">
                            <img src={user.images.profile_image.http_url} alt={user.first_name + " " + user.last_name} onClick={this.props.onLoadProfile} className="img-responsive" />
                        </div>
                        <div className="username-holder">
                            <h3 className="name">{user.first_name + " " + user.last_name}</h3>
                            {
                                (typeof conversations.connection_status != 'undefined' && conversations.connection_status == 'CONNECTION_UNFRIEND') ?
                                    <span className="all-media-btn">( Not a Friend )</span>
                                    :
                                    <span className="all-media-btn">all media</span>
                            }
                        </div>
                        <div className="opt-icons clearfix">
                            <span className="icon phn-icon"  id="aud_btn" onClick={this.props.doAudioCall}></span>
                            <span className="icon video-icon"  id="vid_btn" onClick={this.props.doVideoCall}></span>
                            <span className="icon minimize-icon"  id="min_btn" onClick={this.onMinimiseClick.bind(this)}></span>
                            <span className="icon close-icon"  id="cls_btn" onClick={this.onCloseClick.bind(this)}></span>
                        </div>
                    </div>
                    <MessageList
                        conv={conversations}
                        loggedUser = {userLoggedIn}
                        messages = {messages}
                        minimizeChat = {minimized}
                        setActiveBubbleId= {this.props.setActiveBubbleId}
                    />
                    <ComposeMessage
                        sendChat={this.props.sendChat}
                        conv={conversations}
                        minimizeChat = {minimized}
                        setActiveBubbleId= {this.props.setActiveBubbleId}
                    />
                </div>
        );

        /*return (
            {
                /!*<div className="header-wrapper">
                    <div className="chat-user-header clearfix">
                        <div className="chat-pro-img">
                            <img src={user.images.profile_image.http_url} alt={user.first_name + " " + user.last_name} onClick={this.props.onLoadProfile}/>
                        </div>
                        <h3 className="connection-name" onClick={this.props.onLoadProfile}>{user.first_name + " " + user.last_name}
                            {typeof conv.connection_status != 'undefined' && conv.connection_status == 'CONNECTION_UNFRIEND' ? <span className="form-validation-alert" style={unfriendStyles}>( Not a Friend )</span> : null}
                        </h3>
                    </div>
                    <div className="call-opts-wrapper clearfix">
                        <div className="chat-opts">
                            <span className="video-call icon"  onClick={this.props.doVideoCall}><i className="fa fa-video-camera" aria-hidden="true"></i></span>
                            <span className="phone-call icon"  onClick={this.props.doAudioCall}><i className="fa fa-phone" aria-hidden="true"></i></span>
                        </div>
                        <p className="all-media">All Media</p>
                    </div>
                    <div className="bubble-opts-holder">
                        {
                            (this.state.minimized)?
                                <i className="fa fa-caret-square-o-up opt-icon icon" aria-hidden="true" onClick={this.onMinimiseClick.bind(this)}></i>
                            :
                                <i className="fa fa-minus opt-icon icon" aria-hidden="true" onClick={this.onMinimiseClick.bind(this)}></i>
                        }
                        <i className="fa fa-times close icon" aria-hidden="true" onClick={this.onCloseClick.bind(this)}></i>
                    </div>
                </div>*!/
            }
        )*/
    }
}

export class MessageList extends React.Component{
    constructor(props){
        super(props)
        this.state ={minimizeChat : this.props.minimizeChat};
        this.loggedUser = this.props.loggedUser;
    }

    componentDidUpdate(){
        if(Object.keys(this.refs).length > 0){

            for(var key in this.refs){
                if(key == "msgScrollBar"){
                    const scrollbars = this.refs[key];
                    const scrollHeight = scrollbars.getScrollHeight();
                    scrollbars.scrollToBottom(scrollHeight);
                }
            }
        }
    }

    setAsActiveBubble() {
        let convId = "usr:" + this.props.conv.proglobeTitle;
        this.props.setActiveBubbleId(convId);
    }

    render() {
        let _this = this;
        //let cssClass = m.incoming() ? 'receiver chat-block' : 'sender chat-block';
        /*let convs = this.props.messages.map(function(conv,key){

            return (
                <div className={conv.cssClass == "receiver" ? "receiver chat-block" : "sender chat-block"} key={key}>
                    <div className="chat-msg-body"><p className="chat-msg">{conv.text}</p></div>
                </div>
            );
        });

        return (
            <div>
                {
                    (!this.props.minimizeChat)?
                        <div className="chat-view">
                            <Scrollbars ref="msgScrollBar" autoHide={true} autoHideTimeout={1000} autoHideDuration={200} >
                                <div id="msgListRow">
                                    <div id="msgList">
                                        {convs}
                                    </div>
                                </div>
                            </Scrollbars>
                        </div>
                    :
                        null
                }
            </div>
        )*/

        let _messages = this.props.messages.map(function(msg, key){
            let receiver_image = _this.props.conv.user.images.profile_image.http_url;
            //let sender_image = _this.props.loggedUser.profile_image;
            return (
                <div className={msg.cssClass == "receiver" ? "chat-msg received" : "chat-msg sent"} key={key}>
                    {
                        (msg.cssClass == "receiver")?
                        <div className="pro-img">
                            <img src={receiver_image} className="img-responsive" />
                        </div>
                        :
                        null
                    }
                    <p className="msg">{msg.text}</p>
                </div>
            );
        });

        return (

            <div className="conv-holder" onClick={this.setAsActiveBubble.bind(this)}>
                <Scrollbars ref="msgScrollBar" autoHide={true} autoHideTimeout={1000} autoHideDuration={200} >
                    {_messages}
                </Scrollbars>
            </div>
        );
    }
}


export class ComposeMessage extends React.Component{
    constructor(props) {
        super(props);
        this.loggedUser = this.props.loggedUser;
        this.state = {
            validateAlert: "",
            formData: {},
            msgText: ""
        };
        this.elementChangeHandler = this.elementChangeHandler.bind(this);
    }

    elementChangeHandler(event){
        this.setState({msgText : event.target.value});
    }

    sendMessage(e){
        e.preventDefault();
        let _this = this;
        if(this.state.msgText.match(/^\s*$/)) {
            this.setState({validateAlert: Alert.EMPTY_MESSAGE});
            return 0;
        } else{

            let msg = this.state.msgText;
            let messageBody = {
                message: msg,
                title: this.props.conv.title,
                uri: 'usr:proglobe'+this.props.conv.title
            }

            this.setState({msgText: "", validateAlert : ""});
            this.props.sendChat(messageBody);
        }
    }

    onEnter(e){
        if (e.keyCode == 13) {
            this.sendMessage(e);
        }
    }

    setAsActiveBubble() {
        let convId = "usr:" + this.props.conv.proglobeTitle;
        this.props.setActiveBubbleId(convId);
    }

    render(){
        /*return(
            <div>
                {
                    (!this.props.minimizeChat)?
                        <form onSubmit={this.sendMessage.bind(this)} id="chatMsg">
                            <div className="chat-msg-input-holder">
                                <div className="msg-input">
                                    <textarea className="form-control" placeholder="New Message..." name="msg" value={this.state.msgText}
                                        onChange={(event)=>{ this.elementChangeHandler(event)}}
                                        onKeyDown={(event)=>{this.onEnter(event)}}
                                        ></textarea>
                                </div>
                            </div>
                            <div className="chat-msg-options-holder">
                                <div className="send-msg">
                                    <button type="submit" className="btn btn-default send-btn">Send</button>
                                </div>
                            </div>
                            {this.state.validateAlert ? <p className="form-validation-alert" style={errorStyles} >{this.state.validateAlert}</p> : null}
                        </form>
                    :
                        null
                }
            </div>
        )*/

        return (
            (!this.props.minimizeChat) ?
                <form onSubmit={this.sendMessage.bind(this)} id="chatMsg">
                    <div className="compose-msg" onClick={this.setAsActiveBubble.bind(this)}>
                        <textarea className="form-control" placeholder="Type your message here" name="msg" value={this.state.msgText}
                                  onChange={(event)=>{ this.elementChangeHandler(event)}}
                                  onKeyDown={(event)=>{this.onEnter(event)}}
                        ></textarea>
                        <button className="submit-btn btn"></button>
                    </div>
                    {this.state.validateAlert ? <p className="form-validation-alert" style={errorStyles} >{this.state.validateAlert}</p> : null}
                    <div className = "footer-opt-bar">
                        <span className="opt-icon text-format"></span>
                        <span className="opt-icon video"></span>
                        <span className="opt-icon emotican"></span>
                        <span className="opt-icon image"></span>
                        <span className="opt-icon voice"></span>
                        <span className="opt-icon location"></span>
                        <span className="opt-icon search"></span>
                    </div>
                </form>
                :
                null
        );
    }
}
