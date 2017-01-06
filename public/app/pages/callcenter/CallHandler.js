/**
 * Created by gihan on 12/8/16.
 */

import React from 'react';
import Session from '../../middleware/Session';
import CallCenter from '../../middleware/CallCenter';
import CallModel from './CallModel';

export default class CallHandler extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            contacts: [],
            incoming_call: false,
            ongoing_call: false
        };

        this.loggedUser = Session.getSession('prg_lg');

        this.unreadCount = 0;
        this.conv_ids = [];
        this.convUsers = [];
        this.quickChatUsers = [];
        this.callerProfile = [];

        this.loadMyConnections();

        if (Session.isSessionSet('prg_lg')) {
            this.b6 = CallCenter.b6;
            console.log(this.b6 );
            this.initCall(this.b6);
        }
    }

    componentDidMount() {
        console.log("CallHandler Rendering done");
    }

    initCall(b6) {
        let _this = this;

        // Incoming call from another user
        b6.on('incomingCall', function (c) {
            _this.onIncomingCall(c, b6);
        });

        b6.on('video', function (v, c, op) {
            _this.onVideoCall(v, c, op);
        });
    }

    onMinimizePopup() {
        this.setState({inCall: false, minimizeBar: true});
    }

    onPopupClose() {
        this.setState({inCall: false, minimizeBar: false});
    }

    // Let's say you want to display the video elements in DOM element '#container'
    // Get notified about video elements to be added or removed
    // v - video element to add or remove
    // d - Dialog - call controller. null for a local video feed
    // op - operation. 1 - add, 0 - update, -1 - remove
    onVideoCall(v, d, op) {
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
        // var n = vc[0].children.length;
        // Display the container if we have any video elements
        /*  if (op != 0) {
         vc.toggle(n > 0);
         }*/
    }

    onIncomingCall(c, b6) {
        console.log("======incomingCall======");

        this.setState({incoming_call: true});

        console.log(this.state.incoming_call);

        /*  var _blockCall = checkWorkMode();
         console.log("_blockCall ==> " + _blockCall);

         if (!_blockCall) {

         var cf = b6.getNameFromIdentity(c.other);

         var title_array = cf.split('proglobe');
         var title = title_array[1];

         this.loadCallerProfile(title);

         this.loadAnswerCallPopUp(c);

         } else {

         console.log("Call blocked in work mode. Informing caller via messaging");
         this.hangupCall();
         this.sendCallBlockedMessage(c, b6);

         }*/
    }

    callPopup(oTargetUser) {
        return (
            <div>
                {this.state.ongoing_call &&
                <ModalContainer zIndex={9999}>
                    <ModalDialog className="modalPopup">
                        <CallModel closePopup={this.onPopupClose.bind(this)}  loggedUser={this.state.loggedUser} tagetUser={oTargetUser}
                                   minimizePopup={this.onMinimizePopup.bind(this)}/>
                    </ModalDialog>
                </ModalContainer>
                }
            </div>
        );
    }

    sendCallBlockedMessage(c, b6) {
        let _uri = c.other;
        console.log(_uri);
        let _msg = "On work mode";

        b6.compose(_uri).text(_msg).send(function (err) {
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
            url: '/get-profile/' + title,
            method: "GET",
            dataType: "JSON",
            headers: {'prg-auth-header': this.loggedUser.token}
        }).done(function (data) {
            if (data.status.code == 200 && data.profile_data != null) {
                this.callerProfile = data.profile_data;
            }
        }.bind(this));
    }

    checkWorkMode() {
        let _messages = false;

        if (Session.getSession('prg_wm') != null) {
            let _currentTime = new Date().getTime();
            let _finishTime = Session.getSession('prg_wm').endTime;

            if (_currentTime > _finishTime) {
                Session.destroy("prg_wm");
            } else {
                _messages = Session.getSession('prg_wm').messages;
            }
        }

        return _messages;
    }

    startOutgoingCall(to, video) {
        const audioCall = true;
        const screenCall = false;

        // Outgoing call params
        const opts = {
            audio: audioCall,
            video: video,
            screen: screenCall
        };

        // Start the outgoing call
        var c = this.b6.startCall(to, opts);
        this.attachCallEvents(c);

        c.connect(opts);

        console.log("startOutgoingCall")
    };

    // Attach call state events to a RtcDialog
    attachCallEvents(c) {
        // Call progress
        c.on('progress', function () {
            // TODO show call progress details in popup
        });
        // Number of video feeds/elements changed
        c.on('videos', function () {
            // TODO show video call details in popup
        });
        // Call answered
        c.on('answer', function () {
            // TODO show timer , call buttons
        });
        // Error during the call
        c.on('error', function () {
            // TODO show call error in popup
        });
        // Call ended
        c.on('end', function () {
            // TODO show call end details in popup
        });
    }

    loadMyConnections() {
        $.ajax({
            url: '/connection/me',
            method: "GET",
            dataType: "JSON",
            headers: {'prg-auth-header': this.loggedUser.token}
        }).done(function (data) {
            if (data.status.code == 200) {
                this.my_connections = data.my_con;
                this.setState({my_connections: this.my_connections});
            }
        }.bind(this));
    }

    notificationDomIdForConversation(c) {
        return '#notification__' + c.domId();
    }

    // Call when Answer button click
    answerCall(c, opts) {
        c.connect(opts);
    };

    // Call when Reject button click
    rejectCall(c) {
        // Call controller
        if (c && c.dialog) {
            // Reject call
            c.dialog.hangup();
        }
    };

    // Call when Hangup button click
    hangupCall(b6) {
        console.log("hangup all active calls");
        // Hangup all active calls
        var x = b6.dialogs.slice();
        for (var i in x) {
            x[i].hangup();
        }
    };

    fakeCall() {
        if (this.loggedUser.user_name == 'darshana.peiris.79159') {
            console.log('this is : darshana.peiris.79159');
            this.startOutgoingCall('usr:proglobehasantha.nimesh.91199', false);
        }
    }

    render() {
        if (!this.state.incoming_call) {
            return null;
        } else if (this.state.incoming_call) {
            return (
                <div className="modal" id="incomingCallAlert" tabIndex="1" role="dialog"
                     aria-labelledby="myModalLabel"
                     data-keyboard="false">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-body">
                                <div className="alert fade in" id="incomingCall">
                                    <img src="/images/default-profile-pic.png"
                                         id="incoming_call_alert_other_profile_image"
                                         className="img-circle img-custom-medium bottom-margin-20"/>
                                    <h4 id="incomingCallFrom">User is calling...</h4>
                                    <p>
                                        <button type="button" className="btn btn-success income-call" id="answerVideo"
                                                onClick={()=>this.answerVideo()}>Video
                                        </button>
                                        <button type="button" className="btn btn-success income-call" id="answerAudio"
                                                onClick={()=>this.answerCall()}>Audio
                                        </button>
                                        <button type="button" className="btn btn-danger income-call" id="reject"
                                                onClick={()=>this.reject()}>Reject
                                        </button>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        } else if (this.state.ongoing_call) {
            return (<CallModel></CallModel>);

        }
    }
}
