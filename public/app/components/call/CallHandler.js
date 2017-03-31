import React from 'react';
import IncomingCall from './IncomingCall';

export default class CallHandler extends React.Component {
    constructor(props) {
        super(props);
    }

    notificationDomIdForConversation(c) {
        return '#notification__' + c.domId();
    }

    answerCall(AnswerChannel) {
        this.props.answerCall(AnswerChannel);
    }

    hangUpCall() {
        this.props.hangUpIncomingCall();
    }

    componentDidMount() {
        console.log("CallHandler Rendering done");
    }

    render() {
        return (
            <IncomingCall
                callerName={this.props.callerName}
                callChannel={this.props.callChannel}
                answerCall={this.answerCall.bind(this)}
                hangUpCall={this.hangUpCall.bind(this)}
            />
        )
    }
}
