/**
 * Day view of the calender
 */

'use strict';

import React, { Component } from 'react';
import moment from 'moment-timezone';
import Session from '../../middleware/Session';
import MiniCalender from './MiniCalender';
import DayEventsList from './DayEventsList';
import DayTodosList from './DayTodosList';
import DayTasksList from './DayTasksList';
import SharedUsers from './SharedUsers';
import EditorField from './EditorField';
import Socket  from '../../middleware/Socket';

import { Modal, Button } from 'react-bootstrap';

import { Popover, OverlayTrigger } from 'react-bootstrap';
import { EditorState, RichUtils, ContentState, convertFromRaw, convertToRaw, Modifier } from 'draft-js';
import Editor, { createEditorStateWithText } from 'draft-js-plugins-editor';

import { fromJS } from 'immutable';

import forEach from 'lodash.foreach';

import 'rc-time-picker/assets/index.css';
import TimePicker from 'rc-time-picker';

export default class DayView extends Component {

    constructor(props) {
        super(props);
        let user =  Session.getSession('prg_lg');

        this.state = {
            currentDay : this.props.dayDate,
            defaultType : 'event',
            defaultEventType : this.props.eventType,
            defaultEventTime : moment().format('HH:mm'),
            events : [],
            user : user,
            showTimePanel : '',
            showUserPanel : '',
            editOn : false,
            editEventId : '',
            showTimePanelWindow : false,
            showUserPanelWindow : false,
            sharedWithIds:[],
            sharedWithNames: [],
            msgOn : false,
            errorMsg : '',
            showModal : false,
            deleteEventId : '',
            isButtonDisabled : false,
            tagged: ''
        };

        this.sharedWithIds = [];
        this.sharedWithNames = [];
        this.selectedEvent = this.props.selectedEvent;
        this.currentDay = this.state.currentDay;
        this.loggedUser = user;
        this.addEvent = this.addEvent.bind(this);
        this.updateEvent = this.updateEvent.bind(this);
        this.nextDay = this.nextDay.bind(this);
        this.changeType = this.changeType.bind(this);
        this.handleTimeChange = this.handleTimeChange.bind(this);
        this.toggleMsg = this.toggleMsg.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.openModal = this.openModal.bind(this);
        this.delete = this.delete.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({currentDay : nextProps.dayDate});
        this.currentDay = nextProps.dayDate;
        this.loadEvents();
    }

    _onHashClick() {
        // this.SharedUserField.nameInput.focus();
        // let showUserPanel = this.state.showUserPanel;
        let showUserPanelWindow = this.state.showUserPanelWindow;
        this.setState({showUserPanelWindow : (showUserPanelWindow == true ? false : true) });
    }

    _onAtClick() {
        // let showTimePanel = this.state.showTimePanel;
        let showTimePanelWindow = this.state.showTimePanelWindow;
        this.setState({showTimePanelWindow : (showTimePanelWindow == true ? false : true) });
    }

    componentDidMount() {
        this.loadEvents();
    }

    loadEvents() {
        var data = {
            day : this.currentDay,
            calendar_origin : this.props.calendarOrigin, // PERSONAL_CALENDAR || GROUP_CALENDAR
        };
        if(this.props.calendarOrigin == 2) {
            data['group_id'] = this.props.groupId
        }

        $.ajax({
            url : '/calendar/day/all',
            method : "POST",
            data : data,
            dataType : "JSON",
            headers : { "prg-auth-header" : this.state.user.token },
            success : function (data, text) {
                if (data.status.code == 200) {
                    this.setState({events: data.events});
                }
            }.bind(this),
            error: function (request, status, error) {
                console.log(error);
            }
        });
    }

    resetEventForm() {
        if(this.state.showUserPanelWindow) {
            this.refs.SharedUserField.sharedWithNames = [];
            this.refs.SharedUserField.sharedWithIds = [];
        }

        this.setState({
            sharedWithNames: [],
            sharedWithIds: [],
            showUserPanel:'',
            showTimePanel:'',
            showUserPanelWindow: false,
            showTimePanelWindow: false,
            defaultEventTime: moment().format('HH:mm'),
            editOn : false,
            isButtonDisabled: false
        });
        this.sharedWithIds = [];
        this.sharedWithNames = [];

    }

    toggleMsg() {
        this.setState({ msgOn: !this.state.msgOn });
    }

    addEvent(event) {

        const strDate = moment(this.state.currentDay).format('YYYY-MM-DD');
        const strTime = this.state.defaultEventTime;
        const dateWithTime = moment(strDate + ' ' + strTime, "YYYY-MM-DD HH:mm").format('YYYY-MM-DD HH:mm');

        const Editor = this.refs.EditorFieldValues.state.editorState;
        const contentState = this.refs.EditorFieldValues.state.editorState.getCurrentContent();
        const editorContentRaw = convertToRaw(contentState);
        const plainText = contentState.getPlainText();

        // front-end alidations
        if(!plainText) {
            this.setState({errorMsg : 'Please add the event description'});
            this.toggleMsg();
            setTimeout(this.toggleMsg, 3000);
            return;
        }

        if(dateWithTime < moment().format('YYYY-MM-DD HH:mm')) {
            this.setState({errorMsg : 'Please add a future date and time'});
            this.toggleMsg();
            setTimeout(this.toggleMsg, 3000);
            return;
        }

        // get shared users from SharedUsers field
        const sharedUsers = this.sharedWithIds;
        const postData = {
            description : editorContentRaw,
            plain_text : plainText,
            type : this.state.defaultType,
            apply_date : dateWithTime,
            event_time : strTime,
            event_timezone : moment.tz.guess(),
            shared_users : sharedUsers,
            calendar_origin : this.props.calendarOrigin,
            group_id : (this.props.calendarOrigin == 2) ? this.props.groupId : null // Only group calendar have group id
        };

        // the button dissabled untill the response comes
        this.setState({ isButtonDisabled: true});

        $.ajax({
            url: '/calendar/event/add',
            method: "POST",
            dataType: "JSON",
            data: JSON.stringify(postData),
            headers : { "prg-auth-header" : this.state.user.token },
            contentType: "application/json; charset=utf-8",
        }).done(function (data, text) {
            if(data.status.code == 200){

                if(typeof sharedUsers != 'undefined' && sharedUsers.length > 0) {
                    let _notificationData = {
                        cal_event_id:data.events._id,
                        notification_type:"calendar_share_notification",
                        notification_sender:this.loggedUser,
                        notification_receivers:data.shared_users
                    };

                    Socket.sendCalendarShareNotification(_notificationData);
                }

                const editorState = EditorState.push(this.refs.EditorFieldValues.state.editorState, ContentState.createFromText(''));
                this.refs.EditorFieldValues.setState({editorState});
                this.resetEventForm();
                this.loadEvents();
                this.setTagged();
            }
        }.bind(this));
    }

    /*
     * update a given event or a todo.
    */
    updateEvent() {

        const strDate = moment(this.state.currentDay).format('YYYY-MM-DD');
        const strTime = this.state.defaultEventTime;
        const dateWithTime = moment(strDate + ' ' + strTime, "YYYY-MM-DD HH:mm").format('YYYY-MM-DD HH:mm');

        const Editor = this.refs.EditorFieldValues.state.editorState;
        const contentState = this.refs.EditorFieldValues.state.editorState.getCurrentContent();
        const editorContentRaw = convertToRaw(contentState);
        const plainText = contentState.getPlainText();

        // front-end alidations
        if(!plainText) {
            this.setState({errorMsg : 'Please add the event description'});
            this.toggleMsg();
            setTimeout(this.toggleMsg, 3000);
            return;
        }

        if(dateWithTime < moment().format('YYYY-MM-DD HH:mm')) {
            this.setState({errorMsg : 'Please add a future date and time'});
            this.toggleMsg();
            setTimeout(this.toggleMsg, 3000);
            return;
        }

        // get shared users from SharedUsers field
        const sharedUsers = this.sharedWithIds;
        const postData = {
            description : editorContentRaw,
            plain_text : plainText,
            type : this.state.defaultType,
            apply_date : dateWithTime,
            event_time : strTime,
            shared_users : sharedUsers,
            id : this.state.editEventId
        };

        $.ajax({
            url: '/calendar/update',
            method: "POST",
            dataType: "JSON",
            data: JSON.stringify(postData),
            headers : { "prg-auth-header" : this.state.user.token },
            contentType: "application/json; charset=utf-8",
        }).done(function (data, text) {
            if(data.status.code == 200){

                const editorState = EditorState.push(this.refs.EditorFieldValues.state.editorState, ContentState.createFromText(''));
                this.refs.EditorFieldValues.setState({editorState});

                if(typeof sharedUsers != 'undefined' && sharedUsers.length > 0) {
                    let _notificationData = {
                        cal_event_id:postData.id,
                        notification_type:data.event_time.isTimeChanged == true ? "calendar_schedule_time_changed" : "calendar_schedule_updated",
                        notification_sender:this.loggedUser,
                        notification_receivers:data.shared_users
                    };

                    Socket.sendCalendarShareNotification(_notificationData);
                }

                this.resetEventForm();
                this.loadEvents();
                this.setTagged();
            }
        }.bind(this));
    }

    /*
     * delete a given event or a todo.
    */
    delete() {

        $.ajax({
            url : '/calendar/delete',
            method : "POST",
            data : { event_id : this.state.deleteEventId },
            dataType : "JSON",
            headers : { "prg-auth-header" : this.state.user.token},
            success : function (data, text) {
                if (data.status.code == 200) {
                    this.setState({deleteEventId: ''});
                    this.closeModal();
                    this.loadEvents();
                }
            }.bind(this),
            error: function (request, status, error) {
                console.log(error);
            }
        });
    }

    markTodo(eventId, status) {

        let user =  Session.getSession('prg_lg');
        var postData = {
            id : eventId,
            status : (status == 1 ? 2 : 1 )
        }

        $.ajax({
            url: '/calendar/event/completion',
            method: "POST",
            dataType: "JSON",
            data: postData,
            headers : { "prg-auth-header" : user.token },
        }).done(function (data, text) {
            if(data.status.code == 200){
                this.loadEvents();
            }
        }.bind(this));
    }

    clickEdit(eventId) {
        $.ajax({
            url : '/calendar/event/get',
            method : "POST",
            data : { eventId : eventId },
            dataType : "JSON",
            headers : { "prg-auth-header" : this.state.user.token },
            success : function (data, text) {
                if (data.status.code == 200) {

                    var rawContent = data.event.description;
                    if(typeof(rawContent.entityMap) === 'undefined' || rawContent.entityMap === null ) {
                        rawContent.entityMap = {};
                    }
                    forEach(rawContent.entityMap, function(value, key) {
                        value.data.mention = fromJS(value.data.mention)
                    });

                    const contentState = convertFromRaw(rawContent);
                    const toUpdateEditorState = EditorState.createWithContent(contentState);
                    const editorState = EditorState.push(this.refs.EditorFieldValues.state.editorState, contentState);

                    this.refs.EditorFieldValues.setState({ editorState });
                    this.sharedWithIds = data.event.sharedWithIds;
                    this.sharedWithNames = data.event.sharedWithNames;
                    this.setState({
                        sharedWithNames: data.event.sharedWithNames,
                        sharedWithIds: data.event.sharedWithIds,
                    });
                    var eventType = 'event';
                    switch(data.event.type) {
                        case 2:
                            eventType = 'todo';
                            break;
                        case 3:
                            eventType = 'task';
                            break;
                        default:
                            eventType = 'event';
                    }
                    this.setState({
                        editOn : true,
                        editEventId : eventId,
                        defaultType : eventType
                    });
                    this.handleTimeChange(data.event.start_date_time);
                }
            }.bind(this),
            error: function (request, status, error) {
                console.log(error);
            }
        });
    }

    nextDay() {
        let nextDay = moment(this.state.currentDay).add(1,'days').format('YYYY-MM-DD');
        this.currentDay = nextDay;
        this.setState({currentDay : nextDay});
        this.loadEvents();

        // rest editor.
        const editorState = EditorState.push(this.refs.EditorFieldValues.state.editorState, ContentState.createFromText(''));
        this.refs.EditorFieldValues.setState({editorState});
        this.setState({editOn : false});
        this.resetEventForm();
    }

    previousDay() {
        let prevDay = moment(this.state.currentDay).add(-1, 'days').format('YYYY-MM-DD');
        this.currentDay = prevDay;
        this.setState({currentDay : prevDay});
        this.loadEvents();

        // rest editor.
        const editorState = EditorState.push(this.refs.EditorFieldValues.state.editorState, ContentState.createFromText(''));
        this.refs.EditorFieldValues.setState({editorState});
        this.setState({editOn : false});
        this.resetEventForm();
    }

    changeType(eventType) {
        this.setState({defaultType : eventType});
    }

    calenderClick(day) {

        let clickedDay =  moment(day.date).format('YYYY-MM-DD');
        this.currentDay = clickedDay;
        this.setState({currentDay : clickedDay});
        this.loadEvents();

        // rest editor.
        const editorState = EditorState.push(this.refs.EditorFieldValues.state.editorState, ContentState.createFromText(''));
        this.refs.EditorFieldValues.setState({editorState});
        this.setState({editOn : false});
        this.resetEventForm();
    }

    handleTimeChange(time) {
        this.setState({ defaultEventTime: moment(time).format('HH:mm') });
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

    setSharedUsers(selected) {
        var arrEntries = selected._root.entries;
        if(this.sharedWithIds.indexOf(arrEntries[3][1])==-1){
            this.sharedWithIds.push(arrEntries[3][1]);
            this.sharedWithNames.push(arrEntries[0][1]);
            this.setState({sharedWithIds:this.sharedWithIds, sharedWithNames:this.sharedWithNames, isAlreadySelected:false})
        } else{
            this.setState({isAlreadySelected:true});
            console.log("already selected" + this.state.isAlreadySelected)
        }
    }

    setSharedUsersFromDropDown(selected) {

        if(this.sharedWithIds.indexOf(selected.user_id)==-1){
            this.sharedWithIds.push(selected.user_id);
            this.sharedWithNames.push(selected.first_name+" "+selected.last_name);
            this.setState({sharedWithIds:this.sharedWithIds, sharedWithNames:this.sharedWithNames, isAlreadySelected:false});

        } else{
            this.setState({isAlreadySelected:true});
            console.log("already selected" + this.state.isAlreadySelected)
        }
        this.setTagged();
        return "";
    }

    removeUser(key, name){

        // removing the mention text
        const contentState = this.refs.EditorFieldValues.state.editorState.getCurrentContent();
        const rawContent = convertToRaw(contentState);
        const plainText = contentState.getPlainText();

        const startingAt = plainText.indexOf(name);
        const endingAt = startingAt+name.length;
        const newSelection = this.refs.EditorFieldValues.state.editorState.getSelection().merge({
            anchorOffset: startingAt,
            focusOffset: endingAt
        });
        const newContent = Modifier.removeRange(contentState, newSelection, 'backward');

        const editorState = EditorState.push(this.refs.EditorFieldValues.state.editorState, newContent);
        this.refs.EditorFieldValues.setState({editorState});

        // removing name and the id from the list.
        this.sharedWithIds.splice(key,1);
        this.sharedWithNames.splice(key,1);
        this.setState({sharedWithIds : this.sharedWithIds, sharedWithNames : this.sharedWithNames});
        this.setTagged();
    }

    setTagged() {
        if(this.sharedWithIds.length > 0) {
            this.setState({'tagged' : 'tagged'});
        } else {
            this.setState({'tagged' : ''});
        }
    }

    removeUsersByName(arrUsers) {

        var arrKeysToBeRemoved = [];
        for (var i = 0; i < arrUsers.length; i++) {
            arrKeysToBeRemoved.push(this.sharedWithNames.indexOf(arrUsers[i]));

            // indexOf returnes the key of the matching value
            // splice removes the given key form the array.
            this.sharedWithIds.splice(this.sharedWithIds.indexOf(arrUsers[i]),1);
            this.sharedWithNames.splice(this.sharedWithNames.indexOf(arrUsers[i]),1);

            if(i == (arrUsers.length - 1)) {
                this.setState({sharedWithIds : this.sharedWithIds, sharedWithNames : this.sharedWithNames});
            }
        }

    }

    setTime(selected) {

        var arrEntries = selected._root.entries;
        var time = arrEntries[1][1];
        // let year = moment(this.state.currentDay).year();
        // let month = moment(this.state.currentDay).month();
        // let date = moment(this.state.currentDay).day();
        // let timeWithDay = year+'/'+month+'/'+date+' '+time;
        this.setState({ defaultEventTime: time });
    }

    closeModal() {
        this.setState({showModal: false });
    }

    openModal(eventId) {
        this.setState({showModal: true , deleteEventId: eventId});
    }

    render() {

        let shared_with_list = [];
        let _class = (this.props.calendarOrigin == 2) ? "task" : "to-do";
        if(this.state.sharedWithNames.length > 0){
            shared_with_list = this.state.sharedWithNames.map((name,key)=>{
                // return <span key={key} className="user selected-users">{name}<i className="fa fa-times" aria-hidden="true" onClick={(event)=>{this.removeUser(key, name)}}></i></span>
                return <span key={key} className="person">{name}<i className="fa fa-times close-btn" aria-hidden="true" onClick={(event)=>{this.removeUser(key, name)}}></i></span>
            });
        // } else {
        //     // shared_with_list = <span className="user-label">Only me</span>
        //     shared_with_list = <span className="person">Only me</span>
        }
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
        const showSecond = false;
        return (
            <section className="calender-body day-view">
                <div className="row">
                    <div className="col-sm-9">
                        <div className="calender-view">
                            <div className="view-header">
                                <div className="col-sm-3">
                                    <div className="date-wrapper">
                                        <div className="date-nav" onClick={() => this.previousDay()}>
                                            <i className="fa fa-angle-left" aria-hidden="true"></i>
                                        </div>
                                        <div className="date">
                                            <p>{moment(this.state.currentDay).format('Do')}</p>
                                        </div>
                                        <div className="date-nav" onClick={() => this.nextDay()}>
                                            <i className="fa fa-angle-right" aria-hidden="true"></i>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-sm-9 calender-date">
                                    <p>{moment(this.state.currentDay).format('dddd')}</p>
                                </div>
                            </div>
                            <div className="row calender-input">
                                <div className="col-sm-12">
                                    <div className="input">
                                        <EditorField
                                            ref="EditorFieldValues"
                                            setTime={this.setTime.bind(this)}
                                            setSharedUsers={this.setSharedUsers.bind(this)}
                                            removeUsersByName={this.removeUsersByName.bind(this)}
                                        />
                                    </div>

                                    <div className="tag-wrapper clearfix">
                                        <div className={this.state.tagged + " people-wrapper"}  >
                                            <p className="title" onClick={this._onHashClick.bind(this)}>People in the event&#58;</p>
                                            <div className="people-container">
                                                {shared_with_list}
                                                {this.state.showUserPanelWindow ?
                                                    <SharedUsers
                                                        ref="SharedUserField"
                                                        setSharedUsersFromDropDown={this.setSharedUsersFromDropDown.bind(this)}
                                                        removeUser={this.removeUser}
                                                    />
                                                :
                                                    null
                                                }
                                            </div>
                                        </div>
                                        <div className="time-wrapper" >
                                            <p className="title"  onClick={this._onAtClick.bind(this)}>Insert time &#58;</p>
                                            {this.state.showTimePanelWindow ?
                                                <TimePicker
                                                    style={{ width: 100 }}
                                                    showSecond={showSecond}
                                                    onChange={this.handleTimeChange}
                                                    placeholder="00:00"
                                                />
                                            :
                                                null
                                            }
                                        </div>
                                    </div>
                                    <div className="calender-input-type">
                                        <p>{this.state.defaultType}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="row input-menu">
                                <div className="col-sm-12">
                                    <div className="items-wrapper">
                                        <ul className="input-items-wrapper">
                                            <li>
                                                <OverlayTrigger trigger="click" rootClose placement="bottom" overlay={typoPopover}>
                                                    <span className="ico font_style">B</span>
                                                </OverlayTrigger>
                                            </li>
                                            <li  onClick={this._onHashClick.bind(this)}>
                                                <span className="ico tag">#</span>
                                            </li>

                                            <li onClick={this._onAtClick.bind(this)}>
                                                <span  >
                                                    <i className="fa fa-at  ico time" aria-hidden="true"></i>
                                                </span>
                                            </li>
                                            <li className="btn-group">
                                                <button
                                                    type="button"
                                                    className={"btn event "+(this.state.defaultType == 'event' ? "active" : null)}
                                                    eventType="event"
                                                    onClick={() => this.changeType('event')}
                                                    >
                                                    <i className="fa fa-calendar" aria-hidden="true"></i> Event
                                                </button>
                                                {(this.props.calendarOrigin == 1) ?
                                                    <button
                                                        type="button"
                                                        className={"btn todo "+(this.state.defaultType == 'todo' ? "active" : null)}
                                                        eventType="todo"
                                                        onClick={() => this.changeType('todo')}
                                                        >
                                                        <i className="fa fa-wpforms" aria-hidden="true"></i> To-do
                                                    </button>
                                                :
                                                    <button
                                                        type="button"
                                                        className={"btn task "+(this.state.defaultType == 'task' ? "active" : null)}
                                                        eventType="task"
                                                        onClick={() => this.changeType('task')}
                                                        >
                                                        <i className="fa fa-wpforms" aria-hidden="true"></i> Tasks
                                                    </button>
                                                }
                                            </li>
                                            <li className="post">
                                                { this.state.editOn == false ?
                                                    <button className="menu-ico-txt btn" disabled={this.state.isButtonDisabled} onClick={this.addEvent}>
                                                        <span className="fly-ico"></span> Enter
                                                    </button>
                                                    :
                                                    <div className="menu-ico-txt btn" onClick={this.updateEvent}>
                                                        <i className="fa fa-paper-plane" aria-hidden="true"></i> Update
                                                    </div>
                                                }
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="msg-holder pull-left">
                                {this.state.msgOn ?
                                    <p className="text-danger">{this.state.errorMsg}</p>
                                : null }
                            </div>
                            {/*<div className="form-holder">
                                <div className="row calender-input">
                                    <div className="col-sm-12">
                                        <div className="input" id="editor-holder" >
                                            <EditorField
                                                ref="EditorFieldValues"
                                                setTime={this.setTime.bind(this)}
                                                setSharedUsers={this.setSharedUsers.bind(this)}
                                                removeUsersByName={this.removeUsersByName.bind(this)}
                                            />

                                            <div className="shared-users-time-panel row">
                                                <div className="col-sm-3">
                                                    <p>
                                                        <span onClick={this._onAtClick.bind(this)}  className="user-label">Time <span className="selected-time">{this.state.defaultEventTime}</span></span>
                                                    </p>
                                                    {this.state.showTimePanelWindow ?
                                                        <div className={this.state.showTimePanel + " panel time-panel"}>
                                                            <TimePicker
                                                                style={{ width: 100 }}
                                                                showSecond={showSecond}
                                                                defaultValue={moment()}
                                                                onChange={this.handleTimeChange}
                                                            />
                                                        </div>
                                                    : null }
                                                </div>

                                                <div className="col-sm-6 invite-people ">
                                                    <p>
                                                        <span onClick={this._onHashClick.bind(this)}  className="user-label"> People in the event : </span>
                                                        {shared_with_list}
                                                    </p>
                                                    {this.state.showUserPanelWindow ?
                                                        <SharedUsers
                                                            ref="SharedUserField"
                                                            setSharedUsersFromDropDown={this.setSharedUsersFromDropDown.bind(this)}
                                                            showPanel={this.state.showUserPanel}
                                                            removeUser={this.removeUser}
                                                        />
                                                    : null }
                                                </div>
                                            </div>
                                        </div>
                                        <div className="calender-input-type">
                                            <p>{this.state.defaultType}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="row input-menu">
                                    <div className="col-sm-12">
                                        <div className="msg-holder pull-left">
                                            {this.state.msgOn ?
                                                <p className="text-danger">{this.state.errorMsg}</p>
                                            : null }
                                        </div>
                                        <div className="items-wrapper">
                                            <ul className="input-items-wrapper pull-right">
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
                                                        <button type="button"
                                                            className={"menu-ico-group btn event " + (this.state.defaultType == 'event' ? "active" : null)}
                                                            eventType="event"
                                                            onClick={() => this.changeType('event')}
                                                            >
                                                            <i className="fa fa-calendar" aria-hidden="true"></i> Event
                                                        </button>
                                                        {(this.props.calendarOrigin == 2) ?
                                                            <button type="button"
                                                                    className={"menu-ico-group btn task " + (this.state.defaultType == 'task' ? "active" : null)}
                                                                    eventType="task"
                                                                    onClick={() => this.changeType('task')}>
                                                                <i className="fa fa-wpforms" aria-hidden="true"></i>
                                                                &nbsp;Task
                                                            </button>
                                                            :
                                                            <button type="button"
                                                                    className={"menu-ico-group btn todo " + (this.state.defaultType == 'todo' ? "active" : null)}
                                                                    eventType="todo"
                                                                    onClick={() => this.changeType('todo')}>
                                                                <i className="fa fa-wpforms" aria-hidden="true"></i>
                                                                &nbsp;To-do
                                                            </button>
                                                        }
                                                    </div>
                                                </li>
                                                <li>
                                                    { this.state.editOn == false ?
                                                        <button className="menu-ico-txt btn" disabled={this.state.isButtonDisabled} onClick={this.addEvent}>
                                                            <i className="fa fa-paper-plane" aria-hidden="true"></i> Enter
                                                        </button>
                                                        :
                                                        <div className="menu-ico-txt btn" onClick={this.updateEvent}>
                                                            <i className="fa fa-paper-plane" aria-hidden="true"></i> Update
                                                        </div>
                                                    }
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>*/}
                            <div className="row events-list-area">
                                <div className="col-sm-12">
                                    <div className="events-list-area-content">
                                        <div className="events-list-area-content-title">
                                            <img src="/images/calender/icon-events.png" />
                                            <span>events</span>
                                        </div>
                                        <div className="events-list-area-content-title-hr"></div>
                                        <DayEventsList
                                            events={this.state.events}
                                            clickEdit={this.clickEdit.bind(this)}
                                            selectedEvent={this.selectedEvent}
                                            delete={this.openModal.bind(this)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className={"row " + _class + "-list-area"}>
                                <div className="col-sm-12">
                                    <div className={_class + "-list-area-content"}>
                                        <div className={_class + "-list-area-content-title"}>
                                            <img src="/images/calender/icon-to-do.png" />
                                            {(this.props.calendarOrigin == 2) ?
                                                <span>Tasks</span>
                                            :
                                                <span>To-Do&rsquo;s</span>
                                            }
                                        </div>
                                        <div className={_class+ "-list-area-content-title-hr"}></div>
                                        {(this.props.calendarOrigin == 2) ?
                                            <DayTasksList
                                                events={this.state.events}
                                                onClickItem={this.markTodo.bind(this)}
                                                clickEdit={this.clickEdit.bind(this)}
                                                selectedEvent={this.selectedEvent}
                                                delete={this.openModal.bind(this)} />
                                        :
                                            <DayTodosList
                                                events={this.state.events}
                                                onClickItem={this.markTodo.bind(this)}
                                                clickEdit={this.clickEdit.bind(this)}
                                                selectedEvent={this.selectedEvent}
                                                delete={this.openModal.bind(this)} />
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-3">
                        <MiniCalender selected={moment(this.currentDay)} changeDay={this.calenderClick.bind(this)} />
                    </div>
                </div>
                <Modal show={this.state.showModal} onHide={this.closeModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Are you sure. You want to delete this event</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>This will delete all the associated data, like notifications, shared users.</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.closeModal}>Close</Button>
                        <Button bsStyle="primary" onClick={this.delete}>Delete</Button>
                    </Modal.Footer>
                </Modal>
            </section>
        );
    }
}
