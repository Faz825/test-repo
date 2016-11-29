/**
 * Created by gihan on 11/28/16.
 */

import React from 'react';
import Session from '../../middleware/Session';
import moment from 'moment-timezone';
import { Popover, OverlayTrigger } from 'react-bootstrap';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import { EditorState, RichUtils, ContentState, convertFromRaw, convertToRaw} from 'draft-js';
import Socket  from '../../middleware/Socket';

import EditorField from './EditorField';
import SharedUsers from './SharedUsers';

import 'rc-time-picker/assets/index.css';
import TimePicker from 'rc-time-picker';

export default class WeekDayEventPopUp extends React.Component {
    constructor(props) {
        super(props);
        let user = Session.getSession('prg_lg');
        this.state = {
            user:user,
            eventType:'event',
            sharedWithIds:[],
            defaultEventTime:moment().format('HH:mm'),
            getEditor : false,
            showTimePanel : '',
            showTimePanelWindow : false,
            showUserPanel : '',
            showUserPanelWindow : false
        }

        this.loggedUser = user;
        this.sharedWithIds = [];
        this.addEvent = this.addEvent.bind(this);
    }

    componentDidMount() {
        this.setState({getEditor : true});
    }

    componentWillUnmount() {
        this.setState({getEditor : false});
    }

    changeEventType(type) {
        this.setState({eventType:type});
    }

    setSharedUsers(selected) {
        var arrEntries = selected._root.entries;
        if(this.sharedWithIds.indexOf(arrEntries[3][1])==-1){
            this.sharedWithIds.push(arrEntries[3][1]);
            this.setState({sharedWithIds: this.sharedWithIds, isAlreadySelected:false})
        } else{
            this.setState({isAlreadySelected:true});
            console.log("already selected" + this.state.isAlreadySelected)
        }
    }

    setTime(selected) {
        var arrEntries = selected._root.entries;
        var time = arrEntries[1][1];
        let year = this.props.curr_date.year();
        let month = this.props.curr_date.month();
        let date = this.props.curr_date.day();
        let timeWithDay = year+'/'+month+'/'+date+' '+time;

        this.setState({ defaultEventTime: moment(timeWithDay).format('HH:mm') });
    }

    _onHashClick() {
        let showUserPanel = this.state.showUserPanel;
        let showUserPanelWindow = this.state.showUserPanelWindow;
        this.setState({showUserPanel : (showUserPanel == 'active' ? '' : 'active'), showUserPanelWindow : (showUserPanelWindow == true ? false : true) });
    }

    _onAtClick() {
        let showTimePanel = this.state.showTimePanel;
        let showTimePanelWindow = this.state.showTimePanelWindow;
        this.setState({showTimePanel : (showTimePanel == 'active' ? '' : 'active'), showTimePanelWindow : (showTimePanelWindow == true ? false : true) });
    }

    handleTimeChange(time) {
        this.setState({ defaultEventTime: moment(time).format('HH:mm')});
    }

    addEvent(event) {


        const strDate = this.props.curr_date.format('YYYY-MM-DD');
        const strTime = this.state.defaultEventTime;
        const dateWithTime = moment(strDate + ' ' + strTime, "YYYY-MM-DD HH:mm").format('YYYY-MM-DD HH:mm');

        const Editor = this.editor.state.editorState;
        const contentState = this.editor.state.editorState.getCurrentContent();
        const editorContentRaw = convertToRaw(contentState);
        const plainText = contentState.getPlainText();

        if(!plainText) {
            return;
        }

        // get shared users from SharedUsers field
        const sharedUsers = this.state.sharedWithIds;
        // const sharedUsers = this.refs.SharedUserField.sharedWithIds;
        const postData = {
            description : editorContentRaw,
            plain_text : plainText,
            type : this.state.eventType,
            apply_date : dateWithTime,
            event_time : strTime,
            event_timezone : moment.tz.guess(),
            shared_users : sharedUsers,
        };

        $.ajax({
            url: '/calendar/event/add',
            method: "POST",
            dataType: "JSON",
            data: JSON.stringify(postData),
            headers : { "prg-auth-header" : this.state.user.token },
            contentType: "application/json; charset=utf-8",
        }).done(function (data, text) {
            if(data.status.code == 200){
                const editorState = EditorState.push(this.editor.state.editorState, ContentState.createFromText(''));
                this.editor.setState({editorState});
                this.props.handleClose();

                if(typeof sharedUsers != 'undefined' && sharedUsers.length > 0) {
                    let _notificationData = {
                        cal_event_id:data.events._id,
                        notification_type:"calendar_share_notification",
                        notification_sender:this.loggedUser,
                        notification_receiver:sharedUsers
                    };

                    Socket.sendCalendarShareNotification(_notificationData);
                }

                // load data
                let week_start = moment(this.props.week_startDt).format('YYYY-MM-DD');
                let week_end = moment(this.props.week_startDt).weekday(7).format('YYYY-MM-DD');

                let postData = {
                    start_date:week_start,
                    end_date:week_end
                };
                this.props.loadData(postData);
            }
        }.bind(this));
    }

    _onBoldClick() {
        this.refs.EditorFieldValues.onChange(RichUtils.toggleInlineStyle(this.refs.EditorFieldValues.state.editorState, 'BOLD'));
    }

    _onItalicClick() {
        this.refs.EditorFieldValues.onChange(RichUtils.toggleInlineStyle(this.refs.EditorFieldValues.state.editorState, 'ITALIC'));
    }

    _onUnderLineClick() {
        this.refs.EditorFieldValues.onChange(RichUtils.toggleInlineStyle(this.refs.EditorFieldValues.state.editorState, 'UNDERLINE'));
    }

    render() {

        const showSecond = false;

        const typoPopover = (
            <Popover id="calendar-popover-typo">
                <div className="menu-ico">
                    <p>
                        <span className="bold" onClick={this._onBoldClick.bind(this)}>B</span>
                    </p>
                </div>
                <div className="menu-ico">
                    <p>
                        <span className="italic" onClick={this._onItalicClick.bind(this)}>I</span>
                    </p>
                </div>
                <div className="menu-ico">
                    <p>
                        <span className="underline" onClick={this._onUnderLineClick.bind(this)}>U</span>
                    </p>
                </div>
            </Popover>
        );

        return(
            <ModalContainer zIndex={9999}>
                <ModalDialog className="modalPopup">
                    <div className="popup-holder week-view-editor-popup-holder">
                        <div className="calendar-week-popup-wrapper">
                            <div className="model-header">
                                <div className="model-title-wrapper">
                                    <div className="model-title-inner-wrapper week-popup">
                                        <h4 className="modal-title">{this.state.eventType}</h4>
                                        <span className="calender-popup-closeBtn" onClick={this.props.handleClose}></span>
                                    </div>
                                </div>
                            </div>
                            <div className="model-body">
                                <div className="calendar-date-wrapper">
                                    <h4>{this.props.curr_date.format('dddd')}</h4>
                                    <p>{this.props.curr_date.format('DD')}</p>
                                </div>
                                <div className="calendar-input-area">
                                    {this.state.getEditor ?
                                        <EditorField
                                            ref={(element) => { this.editor = element; }}
                                            setTime={this.setTime.bind(this)}
                                            setSharedUsers={this.setSharedUsers.bind(this)}
                                            />
                                        : null }
                                </div>
                                <div className="shared-users-time-panel">
                                    {this.state.showTimePanelWindow ?
                                        <div className="col-sm-3">
                                            <p>
                                                <span className="user-label">Time : {this.state.defaultEventTime} </span>
                                            </p>
                                            <div className={this.state.showTimePanel + " panel time-panel"}>
                                                <TimePicker
                                                    style={{ width: 100 }}
                                                    showSecond={showSecond}
                                                    defaultValue={moment()}
                                                    onChange={this.handleTimeChange.bind(this)}
                                                    />
                                            </div>
                                        </div>
                                        : null}
                                    {this.state.showUserPanelWindow ?
                                        <div className="col-sm-6">
                                            <SharedUsers  showPanel={this.state.showUserPanel}/>
                                        </div>
                                        : null }

                                </div>
                            </div>
                            <div className="model-footer">
                                <div className="input-items-outer-wrapper">
                                    <ul className="input-items-wrapper pull-right">
                                        <li>
                                            <button className="menu-ico">
                                                <i className="fa fa-smile-o" aria-hidden="true"></i>
                                            </button>
                                        </li>
                                        <li>
                                            <button className="menu-ico">
                                                <OverlayTrigger trigger="click" rootClose placement="bottom" overlay={typoPopover}>
                                                    <p>A</p>
                                                </OverlayTrigger>
                                            </button>
                                        </li>
                                        <li>
                                            <button onClick={this._onHashClick.bind(this)} className="menu-ico">
                                                <i className="fa fa-hashtag" aria-hidden="true"></i>
                                            </button>
                                        </li>

                                        <li>
                                            <button onClick={this._onAtClick.bind(this)} className="menu-ico">
                                                <i className="fa fa-at" aria-hidden="true"></i>
                                            </button>
                                        </li>
                                        <li>
                                            <div className="btn-group">
                                                <button type="button" className={"menu-ico-group btn " + (this.state.eventType == 'event' ? "active" : null)} onClick={() => this.changeEventType('event')}>
                                                    Event
                                                </button>
                                                <button type="button" className={"menu-ico-group btn " + (this.state.eventType == 'todo' ? "active" : null)} onClick={() => this.changeEventType('todo')}>
                                                    To-do
                                                </button>
                                            </div>

                                        </li>
                                        <li>
                                            <button className="menu-ico-txt btn" onClick={this.addEvent}>
                                                Enter
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </ModalDialog>
            </ModalContainer>
        );
    }
}