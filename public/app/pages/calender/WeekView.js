/**
 * Week view of the calender
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

export default class WeekView extends React.Component {
    constructor(props) {
        super(props);
        this.state={
            currentWeek:0,
            events:[],
            weekStartDate:'',
            weekEndDate:'',
        }
        this.loggedUser =  Session.getSession('prg_lg');
        this.currentWeek = 0;
    }

    componentDidMount() {
        let to_day = new Date();
        //var weekday = moment(to_day, "MM-DD-YYYY").week();
        //console.log(weekday);

        //var month = moment(to_day.getMonth(), 'YYYY-MM-DD');
        //
        //var first = month.day() == 0 ? 6 : month.day()-1;
        //var day = 7-first;
        //
        //var last = month.daysInMonth();
        //var count = (last-day)/7;
        //
        //var weeks = [];
        //weeks.push([1, day]);
        //for (var i=0; i < count; i++) {
        //    weeks.push([(day+1), (Math.min(day+=7, last))]);
        //
        //}
        //console.log(weeks);


        //var sundaysOfCurrentMonth = [];
        let weeksCount = 0;
        let sunday = moment().startOf('month').day("Sunday");
        //var month = sunday.month();
        //sundaysOfCurrentMonth.push(sunday.toString());
        while(moment() >= sunday){
            sunday = sunday.weekday(7);
            //sundaysOfCurrentMonth.push(sunday.toString());
            console.log(sunday.toString());
            weeksCount++;
        }
        console.log(weeksCount);

        this.currentWeek = weeksCount;

        let week_start = moment().startOf('week').day("Sunday").format('YYYY-MM-DD');
        let week_end = moment().startOf('week').day("Sunday").weekday(7).format('YYYY-MM-DD');

        let postData = {
            start_date:week_start,
            end_date:week_end
        };

        this.setState({currentWeek:this.currentWeek, weekStartDate:postData.start_date, weekEndDate:postData.end_date});

        this.processDataCall(postData);
    }

    nextWeek() {

        let week_start = moment(this.state.weekEndDate).format('YYYY-MM-DD');
        let week_end = moment(this.state.weekEndDate).weekday(7).format('YYYY-MM-DD');

        let postData = {
            start_date:week_start,
            end_date:week_end
        };
        //console.log(postData);

        this.currentWeek++;
        this.setState({currentWeek:this.currentWeek, weekStartDate:postData.start_date, weekEndDate:postData.end_date});

        this.processDataCall(postData);

    }

    prevWeek() {

        let week_start = moment(this.state.weekStartDate).weekday(-7).format('YYYY-MM-DD');
        let week_end = moment(this.state.weekStartDate).format('YYYY-MM-DD');

        let postData = {
            start_date:week_start,
            end_date:week_end
        };
        //console.log(postData);

        this.currentWeek--;
        this.setState({currentWeek:this.currentWeek, weekStartDate:postData.start_date, weekEndDate:postData.end_date});

        this.processDataCall(postData);

    }

    processDataCall(postData) {
        console.log(postData);
        $.ajax({
            url: '/calendar/events/date_range',
            method: "GET",
            dataType: "JSON",
            data: postData,
            headers: { 'prg-auth-header':this.loggedUser.token }
        }).done( function (data, text) {
            if(data.status.code == 200){
                this.setState({events: data.events});
            }
        }.bind(this));
    }

    render() {
        return (

            <section className="calender-body">
                <div className="row">
                    <div className="calender-week-view">
                        <div className="view-header">
                            <div className="col-sm-6 remove-padding">
                                <div className="date-wrapper">
                                    <div className="date-nav">
                                        <i className="fa fa-angle-left" aria-hidden="true" onClick={() => this.prevWeek()}></i>
                                    </div>
                                    <div className="date">
                                        <p>{this.state.currentWeek} {this.state.currentWeek == 1 ? 'st' : this.state.currentWeek == 2 ? 'nd' : this.state.currentWeek == 3 ? 'rd' : 'th'} week</p>
                                    </div>
                                    <div className="date-nav">
                                        <i className="fa fa-angle-right" aria-hidden="true" onClick={() => this.nextWeek()}></i>
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-6 calender-date  remove-padding">
                                <p>{moment().format('dddd D, YYYY')}</p>
                            </div>
                        </div>

                        <WeekDays week_startDt={this.state.weekStartDate} events={this.state.events} loadData={this.processDataCall.bind(this)} />

                    </div>
                </div>
            </section>
        );
    }
}

export class WeekDays extends React.Component {
    constructor(props) {
        super(props);
        let user = Session.getSession('prg_lg');
        this.state = {
        }
    }

    render() {

        let days = [];

        for (let i = 0; i <= 7; i++) {
            let dateObj = moment(this.props.week_startDt);
            if(i > 0) {
                dateObj = moment(this.props.week_startDt).add(i,"days");
            }
            days.push(<LoadDayList current_date={dateObj} weekly_events={this.props.events} loadData={this.props.loadData} week_startDt={this.props.week_startDt} key={i}/>);

        }

        return (
            <div className="view-tile-area">
                <div className="week-tiles">
                    {days}
                </div>
            </div>
        );
    }
}

export class LoadDayList extends React.Component {

    constructor(props) {
        super(props);
        let user = Session.getSession('prg_lg');
        this.state = {
            showDailyPopUp: false
        }
    }

    getEventsForTheDay() {
        let _events = [];
        let c_date = moment(this.props.current_date).format('YYYY-MM-DD');
        for(let c in this.props.weekly_events) {
            let e_date = moment(this.props.weekly_events[c].start_date_time).format('YYYY-MM-DD');
            if(c_date == e_date) {
                _events.push(this.props.weekly_events[c]);
            }
        }
        return _events;
    }

    handleClose() {
        this.setState({showDailyPopUp: false});
    }

    handleClick() {
        this.setState({showDailyPopUp: true});
    }


    render() {
        //console.log("loading current date");
        //console.log(this.props.current_date);
        let currDt = moment(this.props.current_date);
        return(
            <div className="day-tile" onClick={() => this.handleClick()}>
                <div className="day-tile-header">
                    <h5>{currDt.format('dddd')}</h5>
                    <h6>{currDt.format("MMMM")}</h6>
                    <h3>{currDt.format('DD')}</h3>
                </div>
                <div className="day-tile-body">
                    {<DailyEvents daily_events={this.getEventsForTheDay()}/>}
                </div>
                {this.state.showDailyPopUp ?
                    <WeekDayEventPopUp handleClose={this.handleClose.bind(this)} loadData={this.props.loadData} curr_date={currDt} week_startDt={this.props.week_startDt}/>
                    : null
                }
            </div>
        );
    }
}

export class DailyEvents extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    render() {

        let _events = this.props.daily_events.map(function(event, key){
            let _text = event.description.blocks[0].text;
            return(
                <li className={event.type == 1 ? "events" : "todo"} key={key}>{_text}</li>
            );
        });

        return(
            <ul className="list-items">
                {_events}
            </ul>
        );
    }
}

export class WeekDayEventPopUp extends React.Component {
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
            <ModalContainer onClose={this.props.handleClose} zIndex={9999}>
                <ModalDialog onClose={this.props.handleClose} className="modalPopup">
                    <div className="popup-holder week-view-editor-popup-holder">
                        <div className="calendar-week-popup-wrapper">
                            <div className="model-header">
                                <div className="model-title-wrapper">
                                    <div className="model-title-inner-wrapper">
                                        <h4 className="modal-title">{this.state.eventType}</h4>
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
                                                <OverlayTrigger trigger="click" placement="bottom" overlay={typoPopover}>
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
