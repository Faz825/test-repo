
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
            chatData: this.props.chatData
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
        this.setState({messages:this.messages, isNavHidden: nextProps.isNavHidden, chatData: nextProps.chatData});
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
        console.log('onChatMinimize >> ', state);
        console.log('onChatMinimize >> ', this.state.isMinimized);
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

        return (

            <section className={this.state.isNavHidden == true ? "chat-bubble-holder menu-hidden" : "chat-bubble-holder"}>
                <div className="container clearfix">
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


                    />
                </div>
            </section>

        );

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


export class ChatHeader extends React.Component{
    constructor(props){
        super(props)
        this.state ={
            minimized: this.props.minimizeChat,
            conversations: this.props.conv,
            userLoggedIn: Session.getSession('prg_lg'),
            messages: this.props.messages
        };

        this.onMinimiseClick = this.onMinimiseClick.bind(this);
        this.isMinimized = false;
    }

    componentWillReceiveProps(nextProps) {
        this.setState({minimized:nextProps.minimizeChat, conversations: nextProps.conv, messages: nextProps.messages});
    }

    onCloseClick(){
        this.props.bubbleClose(this.props.conv);
    }

    onMinimiseClick(){
        console.log("onMinimiseClick ..");
        this.isMinimized = !this.state.minimized;
        this.props.onMinimize(this.isMinimized);
    }

    render() {
        //let conv = this.props.conv;

        //let userLoggedIn = this.state.userLoggedIn;
        //let _messages = this.props.messages;

        const {
            conversations,
            minimized,
            userLoggedIn,
            messages
            } = this.state;

        let user = conversations.user;

        console.log("minimized >> ", minimized);

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
                            <span className="icon phn-icon" onClick={this.props.doAudioCall}></span>
                            <span className="icon video-icon" onClick={this.props.doVideoCall}></span>
                            <span className="icon close-icon" onClick={this.onCloseClick.bind(this)}></span>
                        </div>
                    </div>
                </div>
                :
                <div className="chat-bubble">
                    <div className="bubble-header clearfix">
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
                            <span className="icon phn-icon" onClick={this.props.doAudioCall}></span>
                            <span className="icon video-icon" onClick={this.props.doVideoCall}></span>
                            <span className="icon minimize-icon" onClick={this.onMinimiseClick.bind(this)}></span>
                            <span className="icon close-icon" onClick={this.onCloseClick.bind(this)}></span>
                        </div>
                    </div>
                    <MessageList
                        conv={conversations}
                        loggedUser = {userLoggedIn}
                        messages = {messages}
                        minimizeChat = {minimized}
                    />
                    <ComposeMessage
                        sendChat={this.props.sendChat}
                        conv={conversations}
                        minimizeChat = {minimized}
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

        let _convs = this.props.messages.map(function(conv,key){

            //let _profile_image = "images/default-profile-pic.png";
            let _profile_image = conv.user.images.profile_image.http_url;

            //try {
            //    _profile_image = conv.user.images.profile_image.http_url;
            //} catch(e) {}

            return (
                <div className={conv.cssClass == "receiver" ? "chat-msg received" : "chat-msg sent"} key={key}>
                    <div className="pro-img">
                        <img src={_profile_image} className="img-responsive" />
                    </div>
                    <p className="msg">{conv.text}</p>
                </div>
            );
        });

        return (

            <div className="conv-holder">
                <Scrollbars autoHide={true} autoHideTimeout={1000} autoHideDuration={200} >
                    {_convs}
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
                    <div className="compose-msg">
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
