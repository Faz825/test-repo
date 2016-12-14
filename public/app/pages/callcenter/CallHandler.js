/**
 * Created by gihan on 12/8/16.
 */

import React from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import Session from '../../middleware/Session';
import User from "./User";
import Chat from '../../middleware/Chat';

export default class CallHandler extends React.Component{
    constructor(props){
        super(props);
        this.state ={
            conversations : [],
            my_connections: []
        };

        this.loggedUser = Session.getSession('prg_lg');
        this.b6 = Chat.b6;
        this.initChat(this.b6);
        this.unreadCount = 0;
        this.conv_ids = [];
        this.convUsers = [];
        this.quickChatUsers = [];
        this.notifiedUsers = [];
        this.my_connections = [];
        this.callerProfile = [];

        this.loadMyConnections();
    }

    componentDidMount(){
        console.log("CallHandler Rendering done");
    }

    initChat(b6){
        console.log("CallHandler chat init");
        const _this = this;

        this.bit6Auth(b6, false);

        // Incoming call from another user
        b6.on('incomingCall', function(c) {
            _this.onIncomingCall(c, b6);
        });

        // Let's say you want to display the video elements in DOM element '#container'
        // Get notified about video elements to be added or removed
        // v - video element to add or remove
        // d - Dialog - call controller. null for a local video feed
        // op - operation. 1 - add, 0 - update, -1 - remove
        b6.on('video', function(v, c, op) {
            _this.onVideoCall(v, c, op);
        });
    }

    bit6Auth(b6, isNewUser) {
        if(Session.getSession('prg_lg') != null){

            if (b6.session.authenticated) {
                console.log('bit6 user already logged in');
                return true;
            }

            // Convert username to an identity URI
            var ident = 'usr:proglobe_' + Session.getSession('prg_lg').user_name;
            var pass = 'proglobe_'+Session.getSession('prg_lg').id;

            // Call either login or signup function
            var fn = isNewUser ? 'signup' : 'login';
            b6.session[fn]({'identity': ident, 'password': pass}, function (err) {
                if (err) {
                    this.bit6Auth(true);
                }
            });

            return true;
        }
    }


    // Let's say you want to display the video elements in DOM element '#container'
    // Get notified about video elements to be added or removed
    // v - video element to add or remove
    // d - Dialog - call controller. null for a local video feed
    // op - operation. 1 - add, 0 - update, -1 - remove
    onVideoCall(v, c, op) {
        // TODO Please change the container name for popup container
        var vc = $('#container');
        if (op < 0) {
            vc[0].removeChild(v);
        }
        else if (op > 0) {
            v.setAttribute('class', d ? 'remote' : 'local');
            vc.append(v);
        }
        // Total number of video elements (local and remote)
        var n = vc[0].children.length;
        // Display the container if we have any video elements
        if (op != 0) {
            vc.toggle(n > 0);
        }

    }

    onIncomingCall(c, b6) {

        console.log("======incomingCall======");
        console.log(c);

        var _blockCall = checkWorkMode();
        console.log("_blockCall ==> "+_blockCall);

        if(!_blockCall){

            var cf = b6.getNameFromIdentity(c.other);

            var title_array = cf.split('proglobe');
            var title = title_array[1];

            this.loadCallerProfile(title);

            this.loadAnswerCallPopUp(c);

        } else{

            console.log("Call blocked in work mode. Informing caller via messaging");
            this.hangupCall();
            this.sendCallBlockedMessage(c, b6);

        }

    }

    sendCallBlockedMessage(c, b6) {

        let _uri = c.other;
        console.log(_uri);
        let _msg = "On work mode";

        b6.compose(_uri).text(_msg).send(function(err) {
            if (err) {
                console.log('error', err);
            }
            else {
                console.log("msg sent");
            }
        });
    }

    loadAnswerCallPopUp(c) {
        // TODO load call answer buttons in the popup



        // TODO below answerCall() should be called from popup answer call button click
        // TODO can get call type(audio / video) by using below line
        const isVideoCall = c.options.video;

        var opts = {
            audio: true,
            video: isVideoCall
        };
        this.answerCall(c, opts);
    }


    loadCallerProfile(title) {
        $.ajax({
            url: '/get-profile/'+title,
            method: "GET",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.loggedUser.token }
        }).done(function(data){
            if(data.status.code == 200 && data.profile_data != null){
                this.callerProfile = data.profile_data;
            }
        }.bind(this));
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

    startOutgoingCall(to, video){

        console.log("startOutgoingCall")

        const audioCall = true;
        const screenCall = false;

        // Outgoing call params
        const opts = {
            audio: audioCall,
            video: video,
            screen: screenCall,
            type:'call_center'
        };
        // Start the outgoing call
        const c = b6.startCall(to, opts);
        this.attachCallEvents(c);
        c.connect(opts);
    };

    // Attach call state events to a RtcDialog
    attachCallEvents(c) {

        // Call progress
        c.on('progress', function() {
            // TODO show call progress details in popup
        });
        // Number of video feeds/elements changed
        c.on('videos', function () {
            // TODO show video call details in popup
        });
        // Call answered
        c.on('answer', function() {
            // TODO show timer , call buttons
        });
        // Error during the call
        c.on('error', function() {
            // TODO show call error in popup
        });
        // Call ended
        c.on('end', function() {
            // TODO show call end details in popup
        });
    }

    loadMyConnections(){
        $.ajax({
            url: '/connection/me',
            method: "GET",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.loggedUser.token }
        }).done(function(data){
            if(data.status.code == 200){
                this.my_connections = data.my_con;
                this.setState({my_connections: this.my_connections});
            }
        }.bind(this));
    }

    notificationDomIdForConversation(c){
        return '#notification__' + c.domId();
    }


    // Call when Answer button click
    answerCall(c, opts){

        c.connect(opts);

    };

    // Call when Reject button click
    rejectCall(c){

        // Call controller
        if (c && c.dialog) {
            // Reject call
            c.dialog.hangup();
        }

    };

    // Call when Hangup button click
    hangupCall(b6){

        console.log("hangup all active calls");
        // Hangup all active calls
        var x = b6.dialogs.slice();
        for (var i in x) {
            x[i].hangup();
        }

    };


    render() {
        //TODO render the popup
        return (
            null
        )
    }
}