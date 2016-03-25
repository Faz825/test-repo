/*
* User chat window
*/
import React from 'react';
import { Scrollbars } from 'react-custom-scrollbars';

export default class Index extends React.Component{
    constructor(props){
        super(props);
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
                                <div className="msg-holder">
                                    <div className="chat-pro-img">
                                        <img src="images/pg-home-chats_06.png" alt=""/>
                                    </div>
                                    <div className="chat-body">
                                        <span className="connection-name">Sampath</span>
                                        <p className="msg">Lorem Ipsum</p>
                                        <span className="chat-date">Oct 23 2016</span>
                                    </div>
                                </div>
                                <div className="msg-holder">
                                    <div className="chat-pro-img">
                                        <img src="images/pg-home-chats_06.png" alt=""/>
                                    </div>
                                    <div className="chat-body">
                                        <span className="connection-name">Sampath</span>
                                        <p className="msg">Lorem Ipsum</p>
                                        <span className="chat-date">Oct 23 2016</span>
                                    </div>
                                </div>
                                <div className="msg-holder">
                                    <div className="chat-pro-img">
                                        <img src="images/pg-home-chats_06.png" alt=""/>
                                    </div>
                                    <div className="chat-body">
                                        <span className="connection-name">Sampath</span>
                                        <p className="msg">Lorem Ipsum</p>
                                        <span className="chat-date">Oct 23 2016</span>
                                    </div>
                                </div>
                                <div className="msg-holder">
                                    <div className="chat-pro-img">
                                        <img src="images/pg-home-chats_06.png" alt=""/>
                                    </div>
                                    <div className="chat-body">
                                        <span className="connection-name">Sampath</span>
                                        <p className="msg">Lorem Ipsum</p>
                                        <span className="chat-date">Oct 23 2016</span>
                                    </div>
                                </div>
                                <div className="msg-holder">
                                    <div className="chat-pro-img">
                                        <img src="images/pg-home-chats_06.png" alt=""/>
                                    </div>
                                    <div className="chat-body">
                                        <span className="connection-name">Sampath</span>
                                        <p className="msg">Lorem Ipsum</p>
                                        <span className="chat-date">Oct 23 2016</span>
                                    </div>
                                </div>
                                <div className="msg-holder">
                                    <div className="chat-pro-img">
                                        <img src="images/pg-home-chats_06.png" alt=""/>
                                    </div>
                                    <div className="chat-body">
                                        <span className="connection-name">Sampath</span>
                                        <p className="msg">Lorem Ipsum</p>
                                        <span className="chat-date">Oct 23 2016</span>
                                    </div>
                                </div>
                                <div className="msg-holder">
                                    <div className="chat-pro-img">
                                        <img src="images/pg-home-chats_06.png" alt=""/>
                                    </div>
                                    <div className="chat-body">
                                        <span className="connection-name">Sampath</span>
                                        <p className="msg">Lorem Ipsum</p>
                                        <span className="chat-date">Oct 23 2016</span>
                                    </div>
                                </div>
                                <div className="msg-holder">
                                    <div className="chat-pro-img">
                                        <img src="images/pg-home-chats_06.png" alt=""/>
                                    </div>
                                    <div className="chat-body">
                                        <span className="connection-name">Sampath</span>
                                        <p className="msg">Lorem Ipsum</p>
                                        <span className="chat-date">Oct 23 2016</span>
                                    </div>
                                </div>
                                <div className="msg-holder">
                                    <div className="chat-pro-img">
                                        <img src="images/pg-home-chats_06.png" alt=""/>
                                    </div>
                                    <div className="chat-body">
                                        <span className="connection-name">Sampath</span>
                                        <p className="msg">Lorem Ipsum</p>
                                        <span className="chat-date">Oct 23 2016</span>
                                    </div>
                                </div>
                            </Scrollbars>
                        </div>
                        <div className="chat-msg-holder col-sm-8">
                            <div className="chat-view">
                                <Scrollbars style={{ height: 335 }} autoHide={true} autoHideTimeout={1000} autoHideDuration={200}>
                                    <div className="chat-block receiver">
                                        <img src="images/pg-home-chats_06.png" alt=""/>
                                        <div className="chat-msg-body">
                                            <span className="user-name">Prasad</span>
                                            <p className="chat-msg">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Animi tempore rem eaque nemo fugiat autem optio sed est veniam sapiente dolore culpa, enim, eligendi. Sed atque culpa esse dolore itaque?</p>
                                            <span className="chat-msg-time">an hour ago..</span>
                                        </div>
                                    </div>
                                    <div className="chat-block sender">
                                        <img src="images/pg-home-chats_06.png" alt=""/>
                                        <div className="chat-msg-body">
                                            <span className="user-name">Prasad</span>
                                            <p className="chat-msg">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Animi tempore rem eaque nemo fugiat autem optio sed est veniam sapiente dolore culpa, enim, eligendi. Sed atque culpa esse dolore itaque?Lorem ipsum dolor sit amet, consectetur adipisicing elit. Animi tempore rem eaque nemo fugiat autem optio sed est veniam sapiente dolore culpa, enim, eligendi. Sed atque culpa esse dolore itaque?</p>
                                            <span className="chat-msg-time">an hour ago..</span>
                                        </div>
                                    </div>
                                    <div className="chat-block receiver">
                                        <img src="images/pg-home-chats_06.png" alt=""/>
                                        <div className="chat-msg-body">
                                            <span className="user-name">Prasad</span>
                                            <p className="chat-msg">Okay!!</p>
                                            <span className="chat-msg-time">an hour ago..</span>
                                        </div>
                                    </div>
                                </Scrollbars>
                            </div>
                            <div className="chat-msg-input-holder">
                                <img src="images/pg-home-chats_06.png" alt=""/>
                                <div className="msg-input">
                                    <textarea className="form-control" placeholder="New Message..."></textarea>
                                </div>
                            </div>
                            <div className="chat-msg-options-holder">
                                <div className="send-msg">
                                    <span className="send-msg-helper-text">Press enter to send</span>
                                    <span className="btn btn-default send-btn">Send</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
