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
            userLogedIn : Session.getSession('prg_lg')
        };

        this.b6 = Chat.b6;

        this.uri = 'usr:proglobe'+this.state.chatWith;
        Chat.showMessages(this.uri);

    };

    getUrl(){
        return  this.props.params.chatWith;
    }

    sendChat(){

        let _this = this;

        var msg = $("#msgText").val();

        if(typeof this.state.chatWith == 'undefined'){
            _this.setState({validateAlert: Alert.EMPTY_RECEIVER});
            return 0;
        } else if(msg==""){
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

    doVideoCall(){

        let _this = this;

        if(typeof this.state.chatWith == 'undefined'){
            _this.setState({validateAlert: Alert.EMPTY_RECEIVER});
            return 0;
        } else{
            Chat.startOutgoingCall(this.uri, true);
        }

    }

    doAudioCall(){

        let _this = this;

        if(typeof this.state.chatWith == 'undefined'){
            _this.setState({validateAlert: Alert.EMPTY_RECEIVER});
            return 0;
        } else{
            Chat.startOutgoingCall(this.uri, false);
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
                                <p>inbox</p>
                                <div id="inbox_count"></div>
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
                                <p id="chat_with"></p>
                            </div>
                            <div className="media-options-holder">
                                <div className="media-options">
                                    <span className="opt chat-icon">
                                        <i className="fa"></i>
                                    </span>
                                    <span className="opt video-icon" onClick={()=>this.doVideoCall()}>
                                        <i className="fa fa-video-camera"></i>
                                    </span>
                                    <span className="opt call-icon" onClick={()=>this.doAudioCall()}>
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
                                <div id="chatList">
                                </div>
                            </Scrollbars>
                        </div>
                        <div className="chat-msg-holder col-sm-8">
                            <div className="chat-view">
                                <Scrollbars style={{ height: 335 }} autoHide={true} autoHideTimeout={1000} autoHideDuration={200}>
                                    <div id="msgListRow">
                                        <div class="col-xs-12">
                                            <div id="msgList"></div>
                                        </div>
                                    </div>
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


                <div class="modal fade" id="incomingCallAlert" tabindex="-1" role="dialog"
                     aria-labelledby="myModalLabel" data-backdrop="static" data-keyboard="false">
                    <div class="modal-dialog" role="document">
                        <div class="modal-content">
                            <div class="modal-body">
                                <div class="alert fade in" id="incomingCall" style="text-align:
                                                    center;">
                                    <img src="" id="incoming_call_alert_other_profile_image"
                                         class="img-circle
                                                                    img-custom-medium bottom-margin-20" />
                                    <h4 id="incomingCallFrom">User is calling...</h4>
                                    <p>
                                        <button type="button" class="btn btn-success" id="answer"
                                                style="border-radius:20px;"       >Answer</button>
                                        <button type="button" class="btn btn-danger" id="reject"
                                                style="border-radius:20px;">Reject</button>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-sm-9 fh top-padding-20" id="detailPane" style="border-left:1px solid
                                     #e6e9ec;">

                    <div class="row hidden" id="inCallPane">

                        <div class="col-sm-12 fh ">

                            <div class="row top-row" style="background-color:
                                                    #514c46; padding-top: 30px; padding-bottom: 110px; height: auto;
                                                    text-align:
                                                    center; margin-bottom: 20px;">

                                <div class="col-sm-offset-1 col-xs-offset-0 col-sm-10 col-xs-10">
                                    <div class="row text-center" id="videoContainer">

                                    </div>

                                    <div class="row">
                                        <div class="col-sm-12 top-margin-20" style="font-size:18px;">
                                            <img src="" id="call_other_profile_image"
                                                 class="img-responsive img-circle
                                                                    img-custom-large pull-left left-margin-30 hidden" />
                                            <span id="inCallOther" style="color:#c7bfb2;">Video Call</span> <span style="color:#fff;">On Call...</span>
                                        </div>

                                        <div class="col-sm-12 top-margin-5">
                                            <div id="clock" style="color:#c7bfb2;">
                                                <span id="hour">00</span>:<span id="min">00</span>:<span id="sec">00</span>
                                            </div>
                                        </div>
                                    </div>


                                </div>
                                <div class="col-xs-1">
                                    <button class="btn btn-danger" id="hangup" title="Stop Call">
                                        <span class="fa fa-square"></span>
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>


                    </div>

            </div>



        );
    }
}
