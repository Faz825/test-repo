/**
 * WorkModePopup Component
 */
import React from 'react';
import Session from '../../middleware/Session';

export default class WorkModePopup extends React.Component {

    constructor(props) {
        super(props);
        this.state ={};
    }

    render() {
        return (
            <div className="popup-holder">
                <div className="work-mode-popup-wrapper">
                    <div className="header-wrapper">
                        <img src="images/work-mode/logo.png" alt="" className="logo"/>
                            <p className="header">work mode</p>
                    </div>
                    <div className="content-wrapper">
                        <p className="inner-header">what distractions can we rid you of?</p>

                        <div className="components-wrapper">

                            <div className="option-selector-wrapper">
                                <div className="option selected">
                                    <div className="inner-holder clearfix">
                                        <input type="checkbox" name="workmode_option" id="newsfeed" />
                                        <label for="newsfeed" className="selector-label selected">
                                            <div className="select-content clearfix">
                                                <img src="images/work-mode/newsfeed.png" className="type-icon" />
                                                <div className="type-content">
                                                    <p className="type-title">newsfeed</p>
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                <div className="option">
                                    <div className="inner-holder clearfix">
                                        <input type="checkbox" name="workmode_option" id="calls" />
                                        <label for="calls" className="selector-label">
                                            <div className="select-content clearfix">
                                                <img src="images/work-mode/calls.png" className="type-icon" />
                                                <div className="type-content">
                                                    <p className="type-title">calls</p>
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                <div className="option">
                                    <div className="inner-holder clearfix">
                                        <input type="checkbox" name="workmode_option" id="messages" />
                                        <label for="messages" className="selector-label">
                                            <div className="select-content clearfix">
                                                <img src="images/work-mode/messages.png" className="type-icon" />
                                                <div className="type-content">
                                                    <p className="type-title">messages</p>
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                <div className="option">
                                    <div className="inner-holder clearfix">
                                        <input type="checkbox" name="workmode_option" id="social" />
                                        <label for="social" className="selector-label">
                                            <div className="select-content clearfix">
                                                <img src="images/work-mode/social.png" className="type-icon" />
                                                <div className="type-content">
                                                    <p className="type-title">social notifications</p>
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                <div className="option">
                                    <div className="inner-holder clearfix">
                                        <input type="checkbox" name="workmode_option" id="notifications" />
                                        <label for="notifications" className="selector-label">
                                            <div className="select-content clearfix">
                                                <img src="images/work-mode/notifications.png" className="type-icon" />
                                                <div className="type-content">
                                                    <p className="type-title">all notifications</p>
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                <div className="option">
                                    <div className="inner-holder clearfix">
                                        <input type="checkbox" name="workmode_option" id="all" />
                                        <label for="all" className="selector-label">
                                            <div className="select-content clearfix">
                                                <img src="images/work-mode/all.png" className="type-icon" />
                                                <div className="type-content">
                                                    <p className="type-title">all</p>
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="time-selector-wrapper">
                                <div className="option">
                                    <div className="inner-holder clearfix">
                                        <input type="radio" name="workmode_option_time" id="mins" />
                                        <label for="mins" className="selector-label">
                                            <div className="type-content">
                                                <p className="type-title">30 min</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                <div className="option selected">
                                    <div className="inner-holder clearfix">
                                        <input type="radio" name="workmode_option_time" id="hours" />
                                        <label for="hours" className="selector-label selected">
                                            <div className="type-content">
                                                <p className="type-title">2 hours</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                <div className="option">
                                    <div className="inner-holder clearfix">
                                        <input type="radio" name="workmode_option_time" id="custom" />
                                        <label for="custom" className="selector-label">
                                            <div className="type-content">
                                                <p className="type-title">custom</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                <div className="option custom-time">
                                    <input type="text" className="t_input" placeholder="hh" />&colon;<input type="text" className="t_input" placeholder="mm" />
                                </div>
                            </div>

                        </div>
                        <div className="footer">
                            <button className="btn work-mode">active work mode</button>
                        </div>
                    </div>
                </div>
            </div>
        )

    }


}