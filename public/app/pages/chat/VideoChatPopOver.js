import React from 'react';
import moment from 'moment';

export default class VideoChatPopOver extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showPopup: false
        }

        this.togglePopOver = this.togglePopOver.bind(this);
    }

    togglePopOver() {
        let _state = this.state.showPopup;
        this.setState({showPopup: !_state});
    }

    render () {
             return (
                <section className="video-chat-wrapper">
                    <div className={this.state.showPopup ? "inner-container clearfix opened" : "inner-container clearfix"}>
                        <span className="open-chat-window" onClick={this.togglePopOver.bind(this)}></span>
                        { this.state.showPopup ?
                            <div className="active-chat-holder clearfix">
                            <div className="chat-header">
                                <span className="close-chat" onClick={this.togglePopOver.bind(this)}></span>
                                <span className="maximize-chat"></span>
                            </div>
                            <div className="participants-container">
                                <div className="participant active">
                                    <img src="images/call-center/participants-1.png" className="user-image" />
                                    <div className="action-bar">
                                        <span className="video-control"></span>
                                        <span className="voice-control"></span>
                                        <span className="call-control"></span>
                                    </div>
                                </div>
                                <div className="participant">
                                    <img src="images/call-center/participants-1.png" className="user-image" />
                                    <div className="action-bar">
                                        <span className="video-control"></span>
                                        <span className="voice-control"></span>
                                        <span className="call-control"></span>
                                    </div>
                                </div>
                                <div className="participant new">
                                    <img src="images/video-chat/user.png" className="user-image" />
                                    <p className="label">add someone</p>
                                </div>
                            </div>
                            <div className="chat-footer">
                                <div className="call-time">
                                    <p className="label">active call time</p>
                                    <p className="time">01.27</p>
                                </div>
                                <div className="action-bar">
                                    <span className="search"></span>
                                    <span className="add-new"></span>
                                </div>
                            </div>
                        </div> : null
                        }
                    </div>
                </section>
             )
    }
}