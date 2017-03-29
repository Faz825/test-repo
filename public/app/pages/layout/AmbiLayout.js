import React from 'react';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import SigninHeader from '../../components/header/SigninHeader';
import FooterHolder from '../../components/footer/FooterHolder';
import Toast from '../../components/elements/Toast';
import Session  from '../../middleware/Session';
import AmbiDashboard  from '../dashboard/AmbiDashboard';
import CallHandler  from '../../components/call/CallHandler';
import QuickChatHandler from '../chat/QuickChatHandler';
import WorkMode from '../workmode/Index';
import WorkModePopup from '../workmode/WorkModePopup';
import NotificationPop from '../notifications/NotificationPop';
import PubSub from 'pubsub-js';
import Chat from '../../middleware/Chat';
import QuickChatDummy from '../chat/QuickChatDummy';
import VideoChatPopOver from '../chat/VideoChatPopOver';
import {CallChannel, CallType, CallStatus, UserMode, ContactType} from '../../config/CallcenterStats';
import {Config} from '../../config/Config';
import CallCenter from '../../middleware/CallCenter';
import CallModel from '../../components/call/CallModel';

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

        this.b6 = CallCenter.b6;

        this.initCall(this.b6);

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
            userLoggedIn: Session.getSession('prg_lg'),
            rightBottom: _rightBottom,
            socialNotifications: _socialNotifications,
            isShowingModal: false,
            isShowingWMP: false,
            showNotificationsPopup: false,
            notifiType: "",
            notificationCount: "",
            isNavHidden: false,
            toastMessage: {
                visible: false,
                message: '',
                type: ''
            },
            dummyChatArray: [],
            loadedChatBubbleId: 0,
            isNewChatLoaded: false,
            my_connections: [],

            // bit6Call States
            bit6Call: null,
            targetUser: null, // Individual User or Group
            callInProgress: false,
            inComingCall: false,
            callChannel: null
        };

        // Call Record
        this.callRecord = {
            targets: []
        };

        this.contacts = [];

        this.quickChatUsers = [];
        this.handleClick = this.handleClick.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.doVideoCall = this.doVideoCall.bind(this);
        this.doAudioCall = this.doAudioCall.bind(this);
        this.onToastClose = this.onToastClose.bind(this);

        let _this = this;

        CallCenter.getContacts().done(function (data) {
            if (data.status.code == 200) {
                _this.contacts = data.contacts;
            }
        });
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
            let convId = "usr:" + conv.proglobeTitle;
            this.setState({chatBubble: this.quickChatUsers, loadedChatBubbleId: convId});
        }
    }

    loadNewChat(conv) {

        if (!this.state.isNewChatLoaded && this.quickChatUsers.length < 3) {
            this.quickChatUsers.push(conv);
            let convId = "usr:" + conv.proglobeTitle;
            this.setState({isNewChatLoaded: true, chatBubble: this.quickChatUsers, loadedChatBubbleId: convId});
        }
    }

    closeChatBubble(title) {

        let bbList = this.state.chatBubble;
        if (typeof bbList != 'undefined' && bbList.length > 0) {
            let index = this.getBubbleIndex(title);
            let isNewChatLoaded = this.state.isNewChatLoaded;
            if (index > -1) {
                bbList.splice(index, 1);
            }
            this.quickChatUsers = [];
            this.quickChatUsers = bbList;
            if (title == "NEW_CHAT_MESSAGE") {
                isNewChatLoaded = !isNewChatLoaded;
            }
            this.setState({chatBubble: this.quickChatUsers, isNewChatLoaded: isNewChatLoaded});
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
        this.setState({showNotificationsPopup: true, notifiType: type, notificationCount: count});
    }

    onNotifiClose() {
        this.setState({showNotificationsPopup: false, notifiType: ""});
    }

    updateNotificationPopCount(c) {
        this.setState({notificationCount: c});
    }

    onNavCollapse() {
        console.log("called");
        let isVissible = this.state.isNavHidden;
        this.setState({isNavHidden: !isVissible});
    }

    onToastClose() {
        let _toastMessage = {
            visible: false,
            message: '',
            type: ''
        };

        this.setState({toastMessage: _toastMessage});
    }

    onToastOpen(_toast) {
        this.setState({toastMessage: _toast});
    }

    loadDummyQuickChat(_id) {
        console.log("came to load dummy chat >>", _id);
        let _chat = this.state.dummyChatArray;
        if (_chat.indexOf(_id) == -1) {
            _chat.push(_id);
            this.setState({dummyChatArray: _chat});
        }
    }

    closeDummyQuickChat(_id) {
        console.log("came to load dummy chat >>", _id);
        let _chat = this.state.dummyChatArray;
        let _index = _chat.indexOf(_id)
        if (_chat.indexOf(_id) != -1) {
            _chat.splice(_index, 1);
            this.setState({dummyChatArray: _chat});
        }
    }

    setNewChatToList(_conv, convObj) {
        this.closeChatBubble(_conv.title)
        this.quickChatUsers.push(convObj);
        let convId = "usr:" + convObj.proglobeTitle;
        this.setState({chatBubble: this.quickChatUsers, loadedChatBubbleId: convId});
    }

    loadMyConnections() {
        $.ajax({
            url: '/connection/me/unfriend',
            method: "GET",
            dataType: "JSON",
            headers: {'prg-auth-header': this.state.userLoggedIn.token}
        }).done(function (data) {
            if (data.status.code == 200) {
                this.setState({my_connections: data.my_con});
            }
        }.bind(this));
    }

    resetConnections() {
        this.loadMyConnections();
    }

    sendCallBlockedMessage(c, b6) {
        let _uri = c.other;
        console.log(_uri);
        let _msg = "On work mode";
        let user = Session.getSession('prg_lg');
        b6.session.displayName = user.first_name + " " + user.last_name;
        b6.compose(_uri).text(_msg).send(function (err) {
            if (err) {
                console.log('error', err);
            }
            else {
                console.log("msg sent");
            }
        });
    }

    /*
     This is the common function for all child components (folder, calendar etc.. )
     from any index.js file call 'this.props.parentCommonFunction'
     */
    commonForAllChildrenComponents() {
        console.log("commonForAllChildrenComponents called ** ");
    }

    /* CallCenter Methods */

    initCall(b6) {
        let _this = this;

        b6.on('incomingCall', function (c) {
            _this.onIncomingCall(c, b6);
        });

        b6.on('video', function (v, d, op) {
            _this.onVideoCall(v, d, op);
        });
    }

    startCall(TargetUser, Channel) {
        console.log('start call', TargetUser, Channel);
        let opts = {
            audio: true,
            video: false,
            screen: false
        };

        if (Channel == CallChannel.VIDEO) opts.video = true;

        console.log('call channel', Channel);

        // Start the outgoing call
        let to = CallCenter.getBit6Identity(TargetUser);
        var c = this.b6.startCall(to, opts);

        this.attachCallEvents(c);

        this.callRecord.contact = TargetUser;
        this.callRecord.callChannel = this.state.callMode;
        this.callRecord.targets.push({user_id: TargetUser.user_id});
        this.callRecord.dialedAt = new Date().toISOString();

        /*
         CallCenter.addCallRecord(this.callRecord).done(function (oData) {
         // console.log(oData);
         });
         */

        c.connect(opts);

        this.setState({callInProgress: true, callChannel: Channel, targetUser: TargetUser, bit6Call: c});
    }

    startGroupCall(Group, Channel) {

    }

    createGroupCall() {
        let _this = this;

        CallCenter.getGroupMembers(oTargetUser._id).done(function (Group) {
            Group.type = ContactType.GROUP;

            var bit6Call = {
                options: {video: false, audio: false},
                remoteOptions: {video: false}
            };

            var GroupMembers = Group.members.reduce(function (members, member) {
                if (member.user_id != _this.state.userLoggedIn.id) {
                    members.push(member);
                }

                return members;
            }, []);

            Group.members = GroupMembers;

            _this.setState({callInProgress: true, targetUser: Group, bit6Call: bit6Call});
        });
    }

    answerCall(IncomingCallChannel) {
        let Call = this.state.bit6Call;

        if (IncomingCallChannel == CallChannel.AUDIO) {
            Call.connect({audio: true, video: false});
        } else {
            Call.connect({audio: true, video: true});
        }

        this.attachCallEvents(Call);

        this.setState({inComingCall: false, callInProgress: true, callChannel: IncomingCallChannel, bit6Call: Call});
    }

    hangUpCall() {
        this.state.bit6Call.hangup();
    }

    hangUpIncomingCall() {
        let Call = this.state.bit6Call;
        Call.hangup();

        this.setState({inComingCall: false, bit6Call: null, callChannel: null, targetUser: null});
    }

    // Attach call state events to a RtcDialog
    attachCallEvents(c) {
        var _this = this;

        c.on('progress', function () {
            console.log('progress', c);
            _this.setState({bit6Call: c});
        });

        c.on('videos', function () {
            console.log('videos', c);
            _this.setState({bit6Call: c});
            // TODO show video call details in popup
        });

        c.on('answer', function () {
            console.log('answer', c);
            _this.setState({bit6Call: c, callChannel: (c.remoteOptions.video) ? CallChannel.VIDEO : CallChannel.AUDIO});
            // TODO show timer , call buttons
        });

        c.on('error', function () {
            console.log('error', c);
            _this.setState({bit6Call: c});
            // TODO show call error in popup
        });

        c.on('end', function () {
            console.log('end', c);
            _this.setState({callInProgress: false, targetUser: null, callMode: CallChannel.AUDIO});
            // TODO show call end details in popup
        });
    }

    onVideoCall(v, d, op) {
        console.log("====== video call ======");

        var vc = $('#webcamStage');

        if (op < 0) {
            if ($(v).hasClass('remote')) {
                this.setState({callChannel: CallChannel.AUDIO});
            }

            vc[0].removeChild(v);
        }

        else if (op > 0) {
            v.setAttribute('class', d ? 'remote' : 'local');
            vc.append(v);

            if ($(v).hasClass('remote')) {
                this.setState({callChannel: CallChannel.VIDEO});
            }
        }
        // Total number of video elements (local and remote)
        var n = vc[0].children.length;
        // Display the container if we have any video elements
        if (op != 0) {
            vc.toggle(n > 0);
        }

        //  this.setState({bit6Call: d});
    }

    onIncomingCall(c, b6) {
        console.log('incoming call', c);
        let _blockCall = this.checkWorkMode();

        if (!_blockCall) {
            console.log("Incoming call");
            let CallChannel = CallCenter.getCallType(c);
            let targetUser = this.getContactBySlug(c.other);

            this.setState({inComingCall: true, callChannel: CallChannel, targetUser: targetUser, bit6Call: c});
        } else {
            console.log("Call blocked in work mode. Informing caller via messaging");
            this.hangupCall();
            this.sendCallBlockedMessage(c, b6);
        }
    }

    getContactBySlug(slug) {
        let _this = this;
        let username = slug.split(Config.BIT6_IDENTITY_USER_SLUG);

        for (let i = 0; i < _this.contacts.length; i++) {
            var letter = _this.contacts[i];

            for (let x = 0; x < letter.users.length; x++) {
                if (letter.users[x].user_name == username[1]) {
                    return letter.users[x];
                }
            }
        }
    }

    toggleMic(bMic) {
        var oCall = this.state.bit6Call;
        oCall.connect({audio: bMic});
        this.setState({callMode: (bMic) ? CallChannel.VIDEO : CallChannel.AUDIO, bit6Call: oCall});
    }

    toggleVideo(bVideo) {
        var oCall = this.state.bit6Call;
        oCall.connect({video: bVideo});
        this.setState({callMode: (bVideo) ? CallChannel.VIDEO : CallChannel.AUDIO, bit6Call: oCall});
    }

    onMinimizeCallModal() {
        this.setState({callInProgress: false, minimizeBar: true});
    }

    onCloseCallModal() {
        this.state.bit6Call.hangup();
        this.setState({callInProgress: false, minimizeBar: false, bit6Call: null});
    }

    render() {
        let currPage = "";
        if (this.props.children) {
            currPage = this.props.children.props.route.name;
        }
        let dashbrdClass = (this.props.children) ? "sub-page" : "";

        let _this = this;

        var childrenWithProps = React.Children.map(this.props.children, function (child) {
            return React.cloneElement(child, {
                parentCommonFunction: _this.commonForAllChildrenComponents.bind(_this),
                startCall: _this.startCall.bind(_this),
                createCall: _this.createGroupCall.bind(_this)
            });
        });

        return (
            <div className="app-holder">
                <SigninHeader quickChat={this.loadQuickChat.bind(this)}
                              dummyQuickChat={this.loadDummyQuickChat.bind(this)}
                              loadNewChat={this.loadNewChat.bind(this)}
                              resetConnections={this.resetConnections.bind(this)}
                              my_connections={this.state.my_connections}
                />
                <section
                    className={(!this.state.isNavHidden) ? "body-container " + dashbrdClass : "body-container nav-hidden"}>
                    {childrenWithProps || <AmbiDashboard />}
                </section>
                {
                    (this.state.inComingCall) ?
                        <CallHandler
                            callChannel={this.state.callChannel}
                            answerCall={this.answerCall.bind(this)}
                            hangUpIncomingCall={this.hangUpIncomingCall.bind(this)}/>
                        :
                        null
                }
                {
                    (this.state.callInProgress) ?
                        <div>
                            <ModalContainer zIndex={9999}>
                                <ModalDialog className="modalPopup">
                                    <CallModel
                                        remoteChannel={this.state.callChannel}
                                        bit6Call={this.state.bit6Call}
                                        loggedUser={this.state.userLoggedIn}
                                        targetUser={this.state.targetUser}
                                        toggleMic={this.toggleMic.bind(this)}
                                        toggleVideo={this.toggleVideo.bind(this)}
                                        closePopup={this.onCloseCallModal.bind(this)}
                                        minimizePopup={this.onMinimizeCallModal.bind(this)}/>
                                </ModalDialog>
                            </ModalContainer>
                        </div>
                        :
                        null
                }
                {
                    /*this.state.isShowingModal &&
                     <ModalContainer zIndex={9999}>
                     <ModalDialog width="65%" className="workmode-popup-holder">
                     <div className="workmode-popup-wrapper">
                     <WorkMode />
                     <i className="fa fa-times close-icon" aria-hidden="true"
                     onClick={this.handleClose.bind(this)}></i>
                     </div>
                     </ModalDialog>
                     </ModalContainer>*/
                }
                {
                    this.state.isShowingWMP &&
                    <ModalContainer zIndex={9999}>
                        <ModalDialog className="workmode-popup-holder">
                            <div className="workmode-popup-wrapper">
                                <WorkModePopup closePopUp={this.handleClose.bind(this)}
                                               showMessage={this.onToastOpen.bind(this)}/>
                                <i className="fa fa-times close-icon" aria-hidden="true"
                                   onClick={this.handleClose.bind(this)}></i>
                            </div>
                        </ModalDialog>
                    </ModalContainer>
                }
                {
                    (this.state.showNotificationsPopup) ?
                        <NotificationPop notifiType={this.state.notifiType} notifyCount={this.state.notificationCount}
                                         onNotifiClose={this.onNotifiClose.bind(this)}/>
                        :
                        null
                }
                <QuickChatHandler chatList={this.state.chatBubble}
                                  bubClose={this.closeChatBubble.bind(this)}
                                  isNavHidden={this.state.isNavHidden}
                                  loadedChatBubbleId={this.state.loadedChatBubbleId}
                                  my_connections={this.state.my_connections}
                                  setNewChatToList={this.setNewChatToList.bind(this)}
                />
                {/*<QuickChatDummy dummyChatList={this.state.dummyChatArray} closeQuickChat={this.closeDummyQuickChat.bind(this)} isNavHidden={this.state.isNavHidden}/>*/}
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
                    (this.state.toastMessage.visible) ?
                        <Toast msg={this.state.toastMessage.message} type={this.state.toastMessage.type}
                               onToastClose={this.onToastClose.bind(this)}/>//types: success, warning
                        :
                        null
                }
            </div>
        );
    }
}
