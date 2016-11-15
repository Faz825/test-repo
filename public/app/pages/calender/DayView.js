/**
 * Day view of the calender
 */
import React, { Component } from 'react';
import moment from 'moment-timezone';
import Session from '../../middleware/Session';
import MiniCalender from './MiniCalender';
import DayEventsList from './DayEventsList';
import DayTodosList from './DayTodosList';
import SharedUsers from './SharedUsers';
import EditorField from './EditorField';



import { Popover, OverlayTrigger } from 'react-bootstrap';
import {convertFromRaw, convertToRaw} from 'draft-js';
import { fromJS } from 'immutable';
import forEach from 'lodash.foreach';

import 'rc-time-picker/assets/index.css';
import TimePicker from 'rc-time-picker';

import DateTime from "react-bootstrap-datetime";

export default class DayView extends Component {

    constructor(props) {
        super(props);
        let user =  Session.getSession('prg_lg');
        this.state = {
            currentDay : this.props.dayDate,
            defaultType : 'event',
            defaultEventTime : moment().format('HH:mm'),
            events : [],
            user : user,
            showTimePanel : '',
            showUserPanel : '',
        };
        this.currentDay = this.state.currentDay;
        this.addEvent = this.addEvent.bind(this);
        this.nextDay = this.nextDay.bind(this);
        this.changeType = this.changeType.bind(this);
        this.handleTimeChange = this.handleTimeChange.bind(this);
    }

    _onHashClick() {
        let showUserPanel = this.state.showUserPanel;
        this.setState({showUserPanel : (showUserPanel == 'active' ? '' : 'active') });
    }

    _onAtClick() {
        let showTimePanel = this.state.showTimePanel;
        this.setState({showTimePanel : (showTimePanel == 'active' ? '' : 'active') });
    }

    componentDidMount() {
        this.loadEvents();
    }

    loadEvents() {

        $.ajax({
            url : '/calendar/day/all',
            method : "POST",
            data : { day : this.currentDay },
            dataType : "JSON",
            headers : { "prg-auth-header" : this.state.user.token },
            success : function (data, text) {
                if (data.status.code == 200) {
                    console.log(data.events);
                    this.setState({events: data.events});
                }
            }.bind(this),
            error: function (request, status, error) {
                console.log(error);
            }
        });

    }

    addEvent(event) {

        const Editor = this.refs.EditorFieldValues.state.editorState;
        const contentState = this.refs.EditorFieldValues.state.editorState.getCurrentContent();
        const editorContentRaw = convertToRaw(contentState);

        // get shared users from SharedUsers field
        const sharedUsers = this.refs.SharedUserField.sharedWithIds;
        const postData = {
            description : editorContentRaw,
            type : this.state.defaultType,
            apply_date : moment(this.state.currentDay).format('MM DD YYYY HH:mm'),
            event_time : this.state.defaultEventTime,
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
                console.log(this.refs.EditorFieldValues);
                this.refs.EditorFieldValues.setState({editorState : this.refs.EditorFieldValues.onEventAdd()});
                this.loadEvents();
            }
        }.bind(this));
    }

    markTodo(eventId, status) {
        console.log(eventId);
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

    nextDay() {
        let nextDay = moment(this.state.currentDay).add(1,'days').format('YYYY-MM-DD');
        this.currentDay = nextDay;
        this.setState({currentDay : nextDay});
        this.loadEvents();
    }

    previousDay() {
        let prevDay = moment(this.state.currentDay).add(-1, 'days').format('YYYY-MM-DD');
        this.currentDay = prevDay;
        this.setState({currentDay : prevDay});
        this.loadEvents();
    }

    changeType(eventType) {
        this.setState({defaultType : eventType});
    }

    calenderClick(day) {

        let clickedDay =  moment(day.date).format('YYYY-MM-DD');
        this.currentDay = clickedDay;
        this.setState({currentDay : clickedDay});
        this.loadEvents();
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

        var userObj = {
            user_id : arrEntries[3][1],
            first_name : arrEntries[0][1],
            last_name : ''
        };
        this.refs.SharedUserField.getSuggestionValue(userObj);
    }

    render() {

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
            <section className="calender-body">
                <div className="row">
                    <div className="col-sm-9">
                        <div className="calender-view">
                            <div className="view-header">
                                <div className="col-sm-6">
                                    <div className="date-wrapper">
                                        <div className="date-nav" onClick={() => this.previousDay()}>
                                            <i className="fa fa-angle-left" aria-hidden="true"></i>
                                        </div>
                                        <div className="date">
                                            <p>{moment(this.state.currentDay).format('ddd, D')}</p>
                                        </div>
                                        <div className="date-nav" onClick={() => this.nextDay()}>
                                            <i className="fa fa-angle-right" aria-hidden="true"></i>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-sm-6 calender-date">
                                    <p>{moment(this.state.currentDay).format('dddd, MMM D, YYYY')}</p>
                                </div>
                            </div>
                            <div className="form-holder">
                                <div className="row calender-input">
                                    <div className="col-sm-12">
                                        <div className="input" id="editor-holder" >
                                            <EditorField ref="EditorFieldValues" setSharedUsers={this.setSharedUsers.bind(this)} />

                                            <div className="shared-users-time-panel">
                                                <div className="col-sm-3">
                                                    <p>
                                                        <span className="user-label">Time : {this.state.defaultEventTime} </span>
                                                    </p>
                                                    <div className={this.state.showTimePanel + " panel time-panel"}>
                                                        <TimePicker
                                                            style={{ width: 100 }}
                                                            showSecond={showSecond}
                                                            defaultValue={moment()}
                                                            onChange={this.handleTimeChange}
                                                        />
                                                    </div>
                                                </div>
                                                <SharedUsers ref="SharedUserField" showPanel={this.state.showUserPanel}/>
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
                                            <div className="menu-ico">
                                                <p><i className="fa fa-smile-o" aria-hidden="true"></i></p>
                                            </div>

                                            <div className="menu-ico">
                                                <OverlayTrigger trigger="click" placement="bottom" overlay={typoPopover}>
                                                    <p>A</p>
                                                </OverlayTrigger>
                                            </div>
                                            <div className="menu-ico">
                                                <p onClick={this._onHashClick.bind(this)} >
                                                    <i className="fa fa-hashtag" aria-hidden="true"></i>
                                                </p>
                                            </div>
                                            <div className="menu-ico">
                                                 <p onClick={this._onAtClick.bind(this)} >
                                                    <i className="fa fa-at" aria-hidden="true"></i>
                                                </p>
                                            </div>

                                            <div className="toggle-wrapper">
                                                <div className={this.state.defaultType == 'event' ? 'btn-toggle active' : 'btn-toggle'} eventType="event" onClick={() => this.changeType('event')} >
                                                    <i className="fa fa-calendar" aria-hidden="true"></i> Event
                                                </div>
                                                <div className={this.state.defaultType == 'todo' ? 'btn-toggle active' : 'btn-toggle'} eventType="todo" onClick={() => this.changeType('todo')} >
                                                    <i className="fa fa-wpforms" aria-hidden="true"></i> To-do
                                                </div>
                                            </div>
                                            <div className="btn-enter" onClick={this.addEvent}>
                                                <i className="fa fa-paper-plane" aria-hidden="true"></i> Enter
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row events-list-area">
                                <div className="col-sm-12">
                                    <div className="events-list-area-content">
                                        <div className="events-list-area-content-title">
                                            <img src="/images/calender/icon-events.png" />
                                            <span>events</span>
                                        </div>
                                        <div className="events-list-area-content-title-hr"></div>
                                        <DayEventsList events={this.state.events} />
                                    </div>
                                </div>
                            </div>
                            <div className="row to-do-list-area">
                                <div className="col-sm-12">
                                    <div className="to-do-list-area-content">
                                        <div className="to-do-list-area-content-title">
                                            <img src="/images/calender/icon-to-do.png" /><span>To-Do's</span>
                                        </div>
                                        <div className="to-do-list-area-content-title-hr"></div>
                                        <DayTodosList events={this.state.events} onClickItem={this.markTodo.bind(this)} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-3">
                        <MiniCalender selected={moment(this.currentDay)} changeDay={this.calenderClick.bind(this)} />
                    </div>
                </div>
            </section>
        );
    }
}
