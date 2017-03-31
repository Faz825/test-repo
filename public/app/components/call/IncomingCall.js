import React from 'react';
import {CallChannel} from '../../config/CallcenterStats';

export default class IncomingCall extends React.Component {

    constructor(props) {
        super(props);
    }

    answerCall(AnswerChannel){
        this.props.answerCall(AnswerChannel);
    }

    hangUp() {
        this.props.hangUpCall();
    }

    render() {
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
                                <h4 id="incomingCallFrom">{this.props.callerName} is calling...</h4>
                                <p>
                                    {
                                        (this.props.callChannel == CallChannel.VIDEO) ?
                                            <button type="button" className="btn btn-success income-call"
                                                    id="answerVideo"
                                                    onClick={()=>this.answerCall(CallChannel.VIDEO)}>Video
                                            </button> : null
                                    }

                                    <button type="button" className="btn btn-success income-call" id="answerAudio"
                                            onClick={()=>this.answerCall(CallChannel.AUDIO)}>Audio
                                    </button>
                                    <button type="button" className="btn btn-danger income-call" id="reject"
                                            onClick={()=>this.hangUp()}>Reject
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}