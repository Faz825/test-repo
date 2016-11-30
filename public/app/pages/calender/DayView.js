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
import SharedUsers from './SharedUsers';
import EditorField from './EditorField';
import Socket  from '../../middleware/Socket';

import { Popover, OverlayTrigger } from 'react-bootstrap';
import { EditorState, RichUtils, ContentState, convertFromRaw, convertToRaw} from 'draft-js';
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
        };

        this.sharedWithIds = [];
        this.sharedWithNames = [];
        this.currentDay = this.state.currentDay;
        this.loggedUser = user;
        this.addEvent = this.addEvent.bind(this);
        this.updateEvent = this.updateEvent.bind(this);
        this.nextDay = this.nextDay.bind(this);
        this.changeType = this.changeType.bind(this);
        this.handleTimeChange = this.handleTimeChange.bind(this);

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

        const strDate = moment(this.state.currentDay).format('YYYY-MM-DD');
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
        const sharedUsers = this.refs.SharedUserField.sharedWithIds;
        const postData = {
            description : editorContentRaw,
            plain_text : plainText,
            type : this.state.defaultType,
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
                console.log(this.editor);
                const editorState = EditorState.push(this.editor.state.editorState, ContentState.createFromText(''));
                this.editor.setState({editorState});
                this.refs.SharedUserField.setState({
                    sharedWithNames: [],
                    sharedWithIds: [],
                });

                if(typeof sharedUsers != 'undefined' && sharedUsers.length > 0) {
                    let _notificationData = {
                        cal_event_id:data.events._id,
                        notification_type:"calendar_share_notification",
                        notification_sender:this.loggedUser,
                        notification_receiver:sharedUsers
                    };

                    Socket.sendCalendarShareNotification(_notificationData);
                }


                this.loadEvents();
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

      const Editor = this.editor.state.editorState;
      const contentState = this.editor.state.editorState.getCurrentContent();
      const editorContentRaw = convertToRaw(contentState);
      const plainText = contentState.getPlainText();

        if(!plainText) {
            return;
        }

      // get shared users from SharedUsers field
      const sharedUsers = this.refs.SharedUserField.sharedWithIds;
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
              console.log(this.editor);
              const editorState = EditorState.push(this.editor.state.editorState, ContentState.createFromText(''));
              this.editor.setState({editorState});
              this.refs.SharedUserField.setState({
                  sharedWithNames: [],
                  sharedWithIds: [],
              });

              if(typeof sharedUsers != 'undefined' && sharedUsers.length > 0) {
                  let _notificationData = {
                      cal_event_id:postData.id,
                      notification_type:data.event_time.isTimeChanged == true ? "calendar_schedule_time_changed" : "calendar_schedule_updated",
                      notification_sender:this.loggedUser,
                      notification_receiver:sharedUsers
                  };

                  Socket.sendCalendarShareNotification(_notificationData);
              }
              this.loadEvents();
              this.setState({editOn : false, showUserPanel:'', showTimePanel:''});
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
                    const editorState = EditorState.push(this.editor.state.editorState, contentState);

                    this.editor.setState({ editorState });
                    this.refs.SharedUserField.setState({
                        sharedWithNames: data.event.sharedWithNames,
                        sharedWithIds: data.event.sharedWithIds,
                    });
                    this.setState({
                        editOn : true,
                        editEventId : eventId,
                        defaultType : (data.event.type == 1 ? 'event' : 'todo')
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
        const editorState = EditorState.push(this.editor.state.editorState, ContentState.createFromText(''));
        this.editor.setState({editorState});
        this.setState({editOn : false});
        this.refs.SharedUserField.setState({
            sharedWithNames: [],
            sharedWithIds: [],
        });
    }

    previousDay() {
        let prevDay = moment(this.state.currentDay).add(-1, 'days').format('YYYY-MM-DD');
        this.currentDay = prevDay;
        this.setState({currentDay : prevDay});
        this.loadEvents();

        // rest editor.
        const editorState = EditorState.push(this.editor.state.editorState, ContentState.createFromText(''));
        this.editor.setState({editorState});
        this.setState({editOn : false});
        this.refs.SharedUserField.setState({
            sharedWithNames: [],
            sharedWithIds: [],
        });
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
        const editorState = EditorState.push(this.editor.state.editorState, ContentState.createFromText(''));
        this.editor.setState({editorState});
        this.setState({editOn : false});
        this.refs.SharedUserField.setState({
            sharedWithNames: [],
            sharedWithIds: [],
        });
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
        return "";
    }

    removeUser(key){
        this.sharedWithIds.splice(key,1);
        this.sharedWithNames.splice(key,1);
        this.setState({sharedWithIds : this.sharedWithIds, sharedWithNames : this.sharedWithNames});
    }

    setTime(selected) {

        var arrEntries = selected._root.entries;
        var time = arrEntries[1][1];
        let year = moment(this.state.currentDay).year();
        let month = moment(this.state.currentDay).month();
        let date = moment(this.state.currentDay).day();
        let timeWithDay = year+'/'+month+'/'+date+' '+time;
        this.setState({ defaultEventTime: moment(timeWithDay).format('HH:mm') });
    }

    render() {
        let shared_with_list = [];
        if(this.state.sharedWithNames.length > 0){
            shared_with_list = this.state.sharedWithNames.map((name,key)=>{
                return <span key={key} className="user selected-users">{name}<i className="fa fa-times" aria-hidden="true" onClick={(event)=>{this.removeUser(key)}}></i></span>
            });
        } else {
            shared_with_list = <span className="user-label">Only me</span>
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
                                            <EditorField ref="EditorFieldValues" setTime={this.setTime.bind(this)} setSharedUsers={this.setSharedUsers.bind(this)} />

                                            <div className="shared-users-time-panel">
                                                <div className="col-sm-3">
                                                    <p>
                                                        <span className="user-label">Time : {this.state.defaultEventTime} </span>
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
                                                        <span className="user-label"> People in the event : </span>
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
                                        <div className="items-wrapper">
                                            <div className="menu-ico">
                                                <p><i className="fa fa-smile-o" aria-hidden="true"></i></p>
                                            </div>

                                            <div className="menu-ico">
                                                <OverlayTrigger trigger="click" rootClose placement="bottom" overlay={typoPopover}>
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
                                            { this.state.editOn == false ?
                                                <div className="btn-enter" onClick={this.addEvent}>
                                                    <i className="fa fa-paper-plane" aria-hidden="true"></i> Enter
                                                </div>
                                            :   <div className="btn-enter" onClick={this.updateEvent}>
                                                    <i className="fa fa-paper-plane" aria-hidden="true"></i> Update
                                                </div>
                                            }
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
                                        <DayEventsList
                                            events={this.state.events}
                                            clickEdit={this.clickEdit.bind(this)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="row to-do-list-area">
                                <div className="col-sm-12">
                                    <div className="to-do-list-area-content">
                                        <div className="to-do-list-area-content-title">
                                            <img src="/images/calender/icon-to-do.png" /><span>To-Do	&rsquo;s</span>
                                        </div>
                                        <div className="to-do-list-area-content-title-hr"></div>
                                        <DayTodosList
                                            events={this.state.events}
                                            onClickItem={this.markTodo.bind(this)}
                                            clickEdit={this.clickEdit.bind(this)}
                                        />
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
