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
}

export default class Index extends React.Component{
    constructor(props) {
        super(props);

        this.state= {
            chatWith:this.getUrl(),
            userLogedIn : Session.getSession('prg_lg'),
            chatWithUserData:{}
        };

        this.convuser = {};

        this.b6 = Chat.b6;

        console.log("this.state.chatWith  =  "+this.state.chatWith)
        this.uri = 'usr:proglobe'+this.state.chatWith;
        this.b6.addEmptyConversation(this.uri);
        this.showMessages(this.uri);

    };


    showMessages(uri){
        console.log("showMessages - "+uri)
        this.conv = this.b6.getConversation(uri);console.log(this.conv)
        // Mark all messages as read
        if (this.b6.markConversationAsRead(this.conv) > 0) {
            // Some messages have been marked as read
            // update chat list
            console.log("marked read")
        }
        this.convuser.user_name = this.b6.getNameFromIdentity(this.conv.id);console.log("this.convuser.user_name = "+this.convuser.user_name)

        this.msgsDiv = $(this.msgDomIdForConversation(this.conv));
        // Show only message container for this conversation
        // Hide all the other message containers
        $("#msgListRow").append(this.msgsDiv);
        this.msgsDiv.show().siblings().hide();

        // Request focus for the compose message text field
        $('#msgText').focus();
    }

    // Get Messages Container jQuery selector for a Conversation
    msgDomIdForConversation(c) {
        console.log('#msgs__' + c.domId())
        return '#msgs__' + c.domId();
    }

    getUrl(){
        return  this.props.params.chatWith;
    }



    sendChat(e){

        let _this = this;

        var msg = $("#msgText").val();

        if(msg==""){
            _this.setState({validateAlert: Alert.EMPTY_MESSAGE});
            return 0;
        } else{
            this.b6.compose(this.uri).text(msg).send(function(err) {
                if (err) {
                    console.log('error', err);
                }
                else {
                    console.log('message sent');
                }
            });
        }

    }

    render() {
        return (
            <div className="pg-middle-chat-screen-area container-fluid">
                <div className="pg-middle-chat-content-header pg-chat-screen-header">
                    <div className="container">
                        <h2>Message and video calls</h2>
                    </div>
                </div>
                <div className="chat-window container">
                    <div className="header">
                        <div className="chat-inbox-options col-sm-4">
                            <div className="inbox">
                                <p>inbox<span className="total">50</span></p>
                            </div>
                            <div className="otherMsg">
                                <p>Other<span className="total">7</span></p>
                            </div>
                            <div className="more">
                                <p>more...</p>
                            </div>
                        </div>
                        <div className="col-sm-8 chat-person-options">
                            <div className="connection-name">
                                <p>Prasad Sampath</p>
                            </div>
                            <div className="media-options-holder">
                                <div className="media-options">
                                    <span className="opt chat-icon">
                                        <i className="fa"></i>
                                    </span>
                                    <span className="opt video-icon">
                                        <i className="fa fa-video-camera"></i>
                                    </span>
                                    <span className="opt call-icon">
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
                    </div>
                    <div className="chat-body">
                        <div className="conv-holder col-sm-4">
                            <Scrollbars style={{ height: 486 }} autoHide={true} autoHideTimeout={1000} autoHideDuration={200}>
                                <div className="msg-holder" id="chatList">

                                </div>
                            </Scrollbars>
                        </div>
                        <div className="chat-msg-holder col-sm-8">
                            <div className="chat-view">
                                <Scrollbars style={{ height: 220 }} autoHide={true} autoHideTimeout={1000} autoHideDuration={200}>
                                    <div id="msgListRow"></div>
                                </Scrollbars>
                            </div>
                            <div className="chat-msg-input-holder">
                                <img src="/images/pg-home-chats_06.png" alt=""/>
                                <div className="msg-input">
                                    <textarea className="form-control" placeholder="New Message..." id="msgText" name="msg" ></textarea>
                                </div>
                                {this.state.validateAlert ? <p className="form-validation-alert" style={errorStyles} >{this.state.validateAlert}</p> : null}
                            </div>
                            <div className="chat-msg-options-holder">
                                <div className="send-msg">
                                    <span className="send-msg-helper-text">Press enter to send</span>
                                    <span className="btn btn-default send-btn" onClick={()=>this.sendChat()}>Send</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
