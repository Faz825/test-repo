
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

export default class QuickChatBubble extends React.Component{
    constructor(props) {
        super(props);

        this.state ={
            chatWith:this.props.chatData.title,
            userLoggedIn : Session.getSession('prg_lg'),
            messages:[],
            uri:'usr:proglobe'+this.props.chatData.title
        };

        this.messages = [];

    };

    componentDidMount() {
        for (let m in this.props.messages) {
            if (this.props.chatData.title == this.props.messages[m].msg_title) {
                this.messages.push(this.props.messages[m].message[0]);
            }
        }
        this.setState({messages:this.messages});
    }

    componentWillReceiveProps() {
        this.messages = [];
        for (let m in this.props.messages) {
            if (this.props.chatData.title == this.props.messages[m].msg_title) {
                this.messages.push(this.props.messages[m].message[0]);
            }
        }
        this.setState({messages:{}});
        this.setState({messages:this.messages});
    }

    onbubbleClosed(data){
        this.props.bubbleClosed(data.title);
    }

    sendMsg(msg){
        let messageBody = {
            message: msg,
            title: this.props.chatData.title,
            uri: this.state.uri
        }
        this.props.sendMyMessage(messageBody);
    }

    doVideoCall(){

        let callBody = {
            title: this.props.chatData.title,
            uri: this.state.uri
        }
        this.props.doVideoCall(callBody);
    }

    doAudioCall(){
        let callBody = {
            title: this.props.chatData.title,
            uri: this.state.uri
        }
        this.props.doAudioCall(callBody);
    }


    render() {
    //console.log("before rendering messages----555");
    //console.log(this.props.messages);
        const {
            userLoggedIn,
            messages
            }=this.state;

        return (
            <div className="chat-popup col-sm-4">
                <div className="row inner-wrapper">
                    <ChatHeader
                        conv={this.props.chatData}
                        bubbleClose={this.onbubbleClosed.bind(this)}
                        doAudioCall = {this.doAudioCall.bind(this)}
                        doVideoCall = {this.doVideoCall.bind(this)}
                        />
                    <MessageList
                        loggedUser = {userLoggedIn}
                        messages = {messages}/>
                    <ComposeMessage sendChat={this.sendMsg.bind(this)}/>
                </div>
            </div>
        );

    }
}


export class ChatHeader extends React.Component{
    constructor(props){
        super(props)
        this.state ={};
    }

    onCloseClick(){
        this.props.bubbleClose(this.props.conv);
    }

    render() {
        let user = this.props.conv.user;
        return (
            <div className="header-wrapper">
                <div className="chat-user-header clearfix">
                    <div className="chat-pro-img">
                        <img src={user.images.profile_image.http_url} alt={user.first_name + " " + user.last_name} />
                    </div>
                    <h3 className="connection-name">{user.first_name + " " + user.last_name}</h3>
                </div>
                <div className="call-opts-wrapper clearfix">
                    <div className="chat-opts">
                        <span className="video-call icon"  onClick={this.props.doVideoCall}><i className="fa fa-video-camera" aria-hidden="true"></i></span>
                        <span className="phone-call icon"  onClick={this.props.doAudioCall}><i className="fa fa-phone" aria-hidden="true"></i></span>
                    </div>
                    <p className="all-media">All Media</p>
                </div>
                <div className="bubble-opts-holder">
                    <span className="close icon" onClick={this.onCloseClick.bind(this)}><i className="fa fa-times" aria-hidden="true"></i></span>
                </div>
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
        //console.log('going to show messages------- 1');
        //console.log(this.props.messages);
        if(Object.keys(this.refs).length > 0){

            for(var key in this.refs){
                if(key == "msgScrollBar"){
                    const scrollbars = this.refs[key];
                    const scrollHeight = scrollbars.getScrollHeight();
                    scrollbars.scrollTop(scrollHeight);
                }
            }
        }

        let _this = this;
        let convs = this.props.messages.map(function(conv,key){

            //let msgs = conv.messages.map(function(msg,key){
            //    let cssClass = 'chat-block '+msg.cssClass;
            //    return (
            //        <div className={cssClass} key={key}>
            //            <div className="chat-msg-body"><span className="user-name">{msg.display_name}</span><p className="chat-msg">{msg.text}</p></div>
            //        </div>
            //    );
            //});

            return (
                <div className={conv.cssClass} key={key}>
                    <div className="chat-msg-body"><p className="chat-msg">{conv.text}</p></div>
                </div>
            );
        });

        return (
            <div className="chat-view">
                <Scrollbars ref="msgScrollBar" autoHide={true} autoHideTimeout={1000} autoHideDuration={200} height={170}>
                    <div id="msgListRow">
                        <div id="msgList">
                            {convs}
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
        if(!this.state.formData['msg'] || this.state.formData['msg'] == "") {
            this.setState({validateAlert: Alert.EMPTY_MESSAGE});
            return 0;
        } else{
            let msg = this.state.formData.msg;
            this.setState({formData: {}});
            this.setState({validateAlert: ""});
            this.props.sendChat(msg);
        }
    }

    onEnter(e){
        if (e.keyCode == 13) {
            this.sendMessage(e);
        }
    }

    render(){
        return(
            <form onSubmit={this.sendMessage.bind(this)} id="chatMsg">
                <div className="chat-msg-input-holder">
                    <div className="msg-input">
                        <textarea className="form-control" placeholder="New Message..." name="msg"      value={(this.state.formData.msg)?this.state.formData.msg:''}
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
        )
    }
}
