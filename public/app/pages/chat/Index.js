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
            userLogedIn : Session.getSession('prg_lg'),
            my_connections:[],
            chatWithUserName:""
        };
        this.b6 = Chat.b6;
        if(this.state.chatWith == 'new'){
            this.loadMyConnections();
        } else{
            this.loadChat(this.state.chatWith);
        }
        this.selectChange = this.selectChange.bind(this);
    };

    loadMyConnections(){
        console.log("going to call connections")
        $.ajax({
            url: '/connection/me',
            method: "GET",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.state.userLogedIn.token }
        }).done(function(data){
            if(data.status.code == 200){
                this.setState({my_connections:data.my_con})
            }
        }.bind(this));
    }

    loadChat(chatWith){
        console.log("loadChat");
        let _this = this;
        console.log("loadChat => ", chatWith)
        if(chatWith != 'undefined'){
            $.ajax({
                url: '/get-profile/' + chatWith,
                method: "GET",
                dataType: "JSON"
            }).done(function(data){
                if (data.status.code == 200 && data.profile_data != null) {
                    this.setState({chatWithUserName:data.profile_data.first_name+" "+data.profile_data.last_name});
                    this.uri = 'usr:proglobe'+chatWith;console.log(this.uri)
                    Chat.showMessages(this.uri);
                }
            }.bind(this));
        } else{
            Chat.loadFirstMessage();
        }
    }

    loadRoute(url){
        let _this = this;
        _this.setState({chatWith : url});
        console.log("loadRoute => ",this.state.chatWith);
        if(url == 'new'){
            this.loadMyConnections();
        }else{
            this.loadChat(url);
        }
        window.history.pushState('Chat','Chat','/chat/'+url);
    }

    selectChange(e){

        if(e.target.value.length != 0 ){
            //var url_arr = window.location.href.split('new');
            //window.location.href = url_arr[0]+e.target.value;
            this.loadRoute(e.target.value);
        }else{
            //status = "invalid";
            console.log("no user selected")
        }

    }

    getUrl(){
        return  this.props.params.chatWith;
    }

    sendChat(){

        let _this = this;

        var msg = $("#msgText").val(); console.log("sendChat => ", this.uri)

        if(typeof this.state.chatWith == 'undefined'){
            _this.setState({validateAlert: Alert.EMPTY_RECEIVER});
            return 0;
        } else if(msg==""){
            _this.setState({validateAlert: Alert.EMPTY_MESSAGE});
            return 0;
        } else{
            this.b6.compose(this.uri).text(msg).send(function(err) {
                $("#msgText").val("");
                if (err) {
                    console.log('error', err);
                }
                else {
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

        let opts = {};

        if (this.props.error_message) {
            opts['style'] = {"borderColor" : "#ed0909"};
        }

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
                                <p id="unread_inbox_p">inbox</p>
                            </div>
                            <div className="otherMsg">
                                <p>Other</p>
                            </div>
                            <div className="more">
                                <p>more...</p>
                            </div>
                        </div>
                        <div className="col-sm-8 chat-person-options">
                            <div className="connection-name">
                                <p id="chat_with">{this.state.chatWithUserName}</p>
                            </div>
                            {
                                (this.state.chatWith == 'new')?
                                    <div className="connection-list btn btn-default">
                                        <select id="connection_list"
                                                className="pgs-sign-select"
                                                onChange={this.selectChange.bind(this)} {...opts}>
                                            <option/>
                                            {this.state.my_connections.map(function(connection, i){
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
                                        (this.state.chatWith !== 'new')?
                                            <span className="opt new-message">
                                                <a href='#' onClick={()=>this.loadRoute('new')}>New Message</a>
                                            </span> : null
                                    }
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
                                        <div className="col-xs-12">
                                            <div id="msgList"></div>
                                        </div>
                                    </div>
                                </Scrollbars>
                            </div>
                            <div className="chat-msg-input-holder">
                                {
                                    (this.state.userLogedIn.profile_image != null ? <img src={this.state.userLogedIn.profile_image} alt="" width="40" height="40" id="my_profile_img"/>:<img src="/images/default-profile-pic.png" alt="" width="40" height="40" id="my_profile_img"/>)
                                }

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
