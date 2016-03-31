import React from 'react'
import SignupLayout from './layout/SignupLayout'
import DefaultLayout from './layout/DefaultLayout'
import Session  from '../middleware/Session';
import Chat  from '../middleware/Chat';
import Signup  from './signup/Signup';

class Main extends React.Component {

	constructor(props) {

        super(props);

        if (Session.isSessionSet('prg_lg')) {
            Chat.bit6Auth(false);
        }

    }

    answerVideo(){
        var opts = {audio: true, video: true};
        Chat.answerCall(opts);
    }

    answerAudio(){
        var opts = {audio: true, video: false};
        Chat.answerCall(opts);
    }

    reject(){
        Chat.rejectCall();
    }

    hangup(){
        Chat.hangupCall();
    }

    layoutSelector() {


        if (Session.isSessionSet('prg_lg')) {
            return (
                    <DefaultLayout>
                        <div className="col-sm-9 fh top-padding-20 hidden inCallPane-wrapper" id="detailPane">
                            <div className="row video-call-view col-sm-5" id="inCallPane">
                                <div className="fh">
                                    <div className="row top-row" id="inCallPane_inner_div">
                                        <div className="video-call-holder">
                                            <div className="row text-center" id="videoContainer">
                                            </div>
                                            <div className="row">
                                                <div className="col-sm-12 top-margin-20">
                                                    <img src="" id="call_other_profile_image" className="img-responsive img-circle img-custom-large pull-left left-margin-30 hidden" />
                                                    <span id="inCallOther">Video Call</span> <span id="onCall">on call...</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="hangup-outer">
                                            <button className="btn btn-danger" id="hangup" title="Stop Call" onClick={()=>this.hangup()}>
                                                <span className="fa fa-times"></span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal fade" id="incomingCallAlert" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" data-backdrop="static" data-keyboard="false">
                            <div className="modal-dialog" role="document">
                                <div className="modal-content">
                                    <div className="modal-body">
                                        <div className="alert fade in" id="incomingCall">
                                            <img src="/images/default-profile-pic.png" id="incoming_call_alert_other_profile_image" className="img-circle img-custom-medium bottom-margin-20" />
                                            <h4 id="incomingCallFrom">User is calling...</h4>
                                            <p>
                                                <button type="button" className="btn btn-success income-call" id="answerVideo" onClick={()=>this.answerVideo()}>Video</button>
                                                <button type="button" className="btn btn-success income-call" id="answerAudio" onClick={()=>this.answerAudio()}>Audio</button>
                                                <button type="button" className="btn btn-danger income-call" id="reject" onClick={()=>this.reject()}>Reject</button>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {this.props.children }
                    </DefaultLayout>
            )

        }else{
            return (
                    <SignupLayout>
                        {this.props.children ||<Signup />}
                    </SignupLayout>

            )
        }
    }

    render() {
        return this.layoutSelector();

    }
}


module.exports = Main;
