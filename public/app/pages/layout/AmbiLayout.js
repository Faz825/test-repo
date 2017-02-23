import React from 'react';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import SigninHeader from '../../components/header/SigninHeader';
import FooterHolder from '../../components/footer/FooterHolder';
import Toast from '../../components/elements/Toast';
import Session  from '../../middleware/Session';
import AmbiDashboard  from '../dashboard/AmbiDashboard';
import CallHandler  from '../callcenter/CallHandler';
import QuickChatHandler from '../chat/QuickChatHandler';
import WorkMode from '../workmode/Index';
import WorkModePopup from '../workmode/WorkModePopup';
import NotificationPop from '../notifications/NotificationPop';
import PubSub from 'pubsub-js';
import Chat from '../../middleware/Chat';
import QuickChatDummy from '../chat/QuickChatDummy'
import VideoChatPopOver from '../chat/VideoChatPopOver'

export default class AmbiLayout extends React.Component {
    constructor(props) {
        super(props);

        //bit6 will work on https
        if (Session.getSession('prg_lg') == null) {
            window.location.href = "/";
        }
        if (window.location.protocol == 'http:') {
            var url_arr = window.location.href.split('http');
            window.location.href = 'https' + url_arr[1];
        }

        let _rightBottom = false;
        let _socialNotifications = false;

        this.checkWorkModeInterval = null;

        if (Session.getSession('prg_wm') != null) {
            let _currentTime = new Date().getTime();
            let _finishTime = Session.getSession('prg_wm').endTime;

            if (_currentTime > _finishTime) {
                Session.destroy("prg_wm");
            } else {
                let _this = this;
                _rightBottom = Session.getSession('prg_wm').rightBottom;
                _socialNotifications = Session.getSession('prg_wm').socialNotifications;
                if (_rightBottom == true || _socialNotifications == true) {
                    this.checkWorkModeInterval = setInterval(function () {
                        _this.checkWorkMode()
                    }, 1000);
                }
            }
        }

        this.state = {
            chatBubble: [],
            rightBottom: _rightBottom,
            socialNotifications: _socialNotifications,
            isShowingModal: false,
            isShowingWMP: false,
            notifiType: "",
            notificationCount: "",
            isNavHidden: false,
            toastMessage: {
                visible: false,
                message:'',
                type:''
            },
            dummyChatArray:[]
        };

        this.quickChatUsers = [];
        this.handleClick = this.handleClick.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.doVideoCall = this.doVideoCall.bind(this);
        this.doAudioCall = this.doAudioCall.bind(this);
        this.onToastClose = this.onToastClose.bind(this);
    }

    componentWillMount() {
        let _this = this;
        let FVM = "FRIEND_PROFILE_MESSAGING";
        let FPVC = "FRIEND_PROFILE_VIDEO_CALL";
        let VIDEO_CALL = "VIDEO";

        PubSub.subscribe(FVM, function (msg, data) {

            let chatExists = false;
            if (_this.quickChatUsers.length > 0) {
                for (let con in _this.quickChatUsers) {
                    if (_this.quickChatUsers[con].title == data.title) {
                        chatExists = true;
                    }
                }
            }

            if (!chatExists) {
                _this.quickChatUsers.push(data);
                _this.setState({chatBubble: _this.quickChatUsers});
            }
        });

        PubSub.subscribe(FPVC, function (msg, data) {

            if (data.type == VIDEO_CALL) {
                _this.doVideoCall(data);
            } else {
                _this.doAudioCall(data);
            }

        });


    }

    doVideoCall(callObj) {
        Chat.startOutgoingCall(callObj.uri, true);
    };

    doAudioCall(callObj) {
        Chat.startOutgoingCall(callObj.uri, false);
    };


    checkWorkMode() {
        if (Session.getSession('prg_wm') != null) {
            let _currentTime = new Date().getTime();
            let _finishTime = Session.getSession('prg_wm').endTime;

            if (_currentTime > _finishTime) {
                console.log("TIME UP from Default Layout")
                this.setState({rightBottom: false, socialNotifications: false})
                Session.destroy("prg_wm");
                clearInterval(this.checkWorkModeInterval);
                this.checkWorkModeInterval = null;
            }
        } else {
            this.setState({rightBottom: false, socialNotifications: false});
            clearInterval(this.checkWorkModeInterval);
            this.checkWorkModeInterval = null;
        }

    }

    loadQuickChat(conv) {

        if (typeof this.quickChatUsers.length != 'undefined' && this.quickChatUsers.length >= 3) {
            alert("Maximum quick chat window limit is reached.");
            return;
        }

        var chatExists = false;
        if (this.quickChatUsers.length > 0) {
            for (let con in this.quickChatUsers) {
                if (this.quickChatUsers[con].title == conv.title) {
                    chatExists = true;
                }
            }
        }

        if (!chatExists) {
            this.quickChatUsers.push(conv);
            this.setState({chatBubble: this.quickChatUsers});
        }
    }

    closeChatBubble(title) {

        let bbList = this.state.chatBubble;
        if (typeof bbList != 'undefined' && bbList.length > 0) {
            let index = this.getBubbleIndex(title);
            if (index > -1) {
                bbList.splice(index, 1);
            }
            this.quickChatUsers = [];
            this.quickChatUsers = bbList;
            this.setState({chatBubble: this.quickChatUsers});
        }
    }

    getBubbleIndex(title) {
        let bbList = this.state.chatBubble;
        for (let my_con in bbList) {
            if (title == bbList[my_con].title) {
                return my_con;
            }
        }
        return -1
    }

    handleClick() {
        // this.setState({isShowingModal: true});
        this.setState({isShowingWMP: true});
    }

    handleClose() {
        this.setState({isShowingModal: false, isShowingWMP: false});
    }

    onWorkmodeClick() {
        this.handleClick();
    }

    onNotifiTypeClick(type, count) {
        this.setState({notifiType: type, notificationCount: count});
    }

    onNotifiClose() {
        this.setState({notifiType: ""});
    }

    updateNotificationPopCount(c) {
        this.setState({notificationCount: c});
    }

    onNavCollapse() {
        console.log("called");
        let isVissible = this.state.isNavHidden;
        this.setState({isNavHidden: !isVissible});
    }

    onToastClose(){
        let _toastMessage = {
            visible: false,
            message:'',
            type:''
        };

        this.setState({toastMessage : _toastMessage});
    }

    onToastOpen(_toast){
        this.setState({toastMessage : _toast});
    }

    loadDummyQuickChat(_id) {
        console.log("came to load dummy chat >>", _id );
        let _chat = this.state.dummyChatArray;
        if(_chat.indexOf(_id) == -1) {
            _chat.push(_id);
            this.setState({dummyChatArray: _chat});
        }
    }

    closeDummyQuickChat(_id) {
        console.log("came to load dummy chat >>", _id );
        let _chat = this.state.dummyChatArray;
        let _index = _chat.indexOf(_id)
        if(_chat.indexOf(_id) != -1) {
            _chat.splice(_index, 1);
            this.setState({dummyChatArray: _chat});
        }
    }

    render() {
        let currPage = "";
        if(this.props.children){
            currPage = this.props.children.props.route.name;
        }
        let dashbrdClass = (this.props.children) ? "sub-page" : "";
        return (
            <div className="app-holder">
                <SigninHeader quickChat={this.loadQuickChat.bind(this)} dummyQuickChat={this.loadDummyQuickChat.bind(this)}/>
                <section
                    className={(!this.state.isNavHidden) ? "body-container " + dashbrdClass : "body-container nav-hidden"}>
                    {this.props.children || <AmbiDashboard />}
                </section>
                <CallHandler/>
                {
                    this.state.isShowingModal &&
                    <ModalContainer zIndex={9999}>
                        <ModalDialog width="65%" className="workmode-popup-holder">
                            <div className="workmode-popup-wrapper">
                                <WorkMode />
                                <i className="fa fa-times close-icon" aria-hidden="true"
                                   onClick={this.handleClose.bind(this)}></i>
                            </div>
                        </ModalDialog>
                    </ModalContainer>
                }
                {
                    this.state.isShowingWMP &&
                    <ModalContainer zIndex={9999}>
                        <ModalDialog className="workmode-popup-holder">
                            <div className="workmode-popup-wrapper">
                                <WorkModePopup closePopUp={this.handleClose.bind(this)} showMessage={this.onToastOpen.bind(this)}/>
                                <i className="fa fa-times close-icon" aria-hidden="true"
                                   onClick={this.handleClose.bind(this)}></i>
                            </div>
                        </ModalDialog>
                    </ModalContainer>
                }
                {
                    (this.state.notifiType) ?
                        <NotificationPop notifiType={this.state.notifiType} notifyCount={this.state.notificationCount}
                                         onNotifiClose={this.onNotifiClose.bind(this)}/>
                        :
                        null
                }
                <QuickChatHandler chatList={this.state.chatBubble} bubClose={this.closeChatBubble.bind(this)}/>
                <QuickChatDummy dummyChatList={this.state.dummyChatArray} closeQuickChat={this.closeDummyQuickChat.bind(this)} isNavHidden={this.state.isNavHidden}/>
                <VideoChatPopOver />
                <FooterHolder blockBottom={this.state.rightBottom}
                              blockSocialNotification={this.state.socialNotifications}
                              onWorkmodeClick={this.onWorkmodeClick.bind(this)}
                              onNotifiTypeClick={this.onNotifiTypeClick.bind(this)}
                              onUpdateNotifiPopupCount={this.updateNotificationPopCount.bind(this)}
                              currPage={currPage}
                              onNavCollapse={this.onNavCollapse.bind(this)}/>
                <span className={(!this.state.isNavHidden) ? "settings-icon" : "settings-icon slideUp"}></span>
                {
                    (this.state.toastMessage.visible)?
                        <Toast msg={this.state.toastMessage.message} type={this.state.toastMessage.type} onToastClose={this.onToastClose.bind(this)} />//types: success, warning
                    :
                        null
                }
            </div>
        );
    }
}
