/**
 * Week view of the calender
 */
import React from 'react';
import Session from '../../middleware/Session';
import moment from 'moment-timezone';
import Socket  from '../../middleware/Socket';
import WeekDayEventPopUp from './WeekDayEventPopUp';

import {convertFromRaw, convertToRaw} from 'draft-js';
import {stateToHTML} from 'draft-js-export-html';

import SharedUsers from './SharedUsers';
import GroupArray from 'group-array';

export default class WeekView extends React.Component {
    constructor(props) {
        super(props);
        this.state={
            currentWeek:0,
            events:[],
            weekStartDate:'',
            weekEndDate:'',
            groupCall:this.props.groupCall
        }
        this.loggedUser =  Session.getSession('prg_lg');
        this.currentWeek = 0;
    }

    componentWillReceiveProps(nextProps) {
        if(typeof nextProps.myGroup != 'undefined' && nextProps.myGroup) {
            this.setState({groupCall: nextProps.groupCall});
        }
    }

    componentDidMount() {
        //let to_day = new Date();
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

        let weeksCount = this.getChangedWeekCount(moment());

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

    getChangedWeekCount(_Date) {
        let weeks = 0;
        let sunday = moment(_Date).startOf('month').day("Sunday");
        let m_date = moment(_Date);

        while(m_date >= sunday) {
            sunday = sunday.weekday(7);
            weeks++;
        }

        if(m_date == sunday) {
            return weeks;
        }
        return weeks - 1;
    }

    nextWeek() {

        let week_start = moment(this.state.weekEndDate).format('YYYY-MM-DD');
        let week_end = moment(this.state.weekEndDate).weekday(7).format('YYYY-MM-DD');

        let curWeekOfMonth = this.getChangedWeekCount(week_start);

        let postData = {
            start_date:week_start,
            end_date:week_end
        };

        this.currentWeek = curWeekOfMonth;
        this.setState({currentWeek:this.currentWeek, weekStartDate:postData.start_date, weekEndDate:postData.end_date});

        this.processDataCall(postData);

    }

    prevWeek() {

        let week_start = moment(this.state.weekStartDate).weekday(-7).format('YYYY-MM-DD');
        let week_end = moment(this.state.weekStartDate).format('YYYY-MM-DD');

        let curWeekOfMonth = this.getChangedWeekCount(week_start);

        let postData = {
            start_date:week_start,
            end_date:week_end
        };

        this.currentWeek = curWeekOfMonth;
        this.setState({currentWeek:this.currentWeek, weekStartDate:postData.start_date, weekEndDate:postData.end_date});

        this.processDataCall(postData);

    }

    processDataCall(postData) {

        if(this.state.groupCall.isGroupCall){
            postData['isGroupCall'] = this.state.groupCall.isGroupCall;
            postData['groupId'] = this.state.groupCall.groupId;
            postData['calendarOrigin'] = this.props.calendarOrigin;
        }

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
                <div className="calendar-main-row">
                    <div className="calender-week-view">
                        <div className="view-header">
                            <div className="col-sm-6 remove-padding">
                                <div className="date-wrapper">
                                    <div className="date-nav">
                                        <i className="fa fa-angle-left" aria-hidden="true" onClick={() => this.prevWeek()}></i>
                                    </div>
                                    <div className="date">
                                        <p> week {this.state.currentWeek} </p>
                                    </div>
                                    <div className="date-nav">
                                        <i className="fa fa-angle-right" aria-hidden="true" onClick={() => this.nextWeek()}></i>
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-6 calender-date  remove-padding">
                                <p>{moment().format('MMM D, YYYY')}</p>
                            </div>
                        </div>

                        <WeekDays
                            week_startDt={this.state.weekStartDate}
                            events={this.state.events}
                            loadData={this.processDataCall.bind(this)}
                            isGroupCall={this.state.groupCall.isGroupCall}
                            calendarOrigin={this.props.calendarOrigin}
                            groupId={(this.props.calendarOrigin == 2) ? this.props.groupId : null} // Only group calendar have group id
                            />

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
            days.push(<LoadDayList
                current_date={dateObj}
                weekly_events={this.props.events}
                loadData={this.props.loadData}
                week_startDt={this.props.week_startDt}
                key={i} isGroupCall={this.props.isGroupCall}
                calendarOrigin={this.props.calendarOrigin}
                groupId={(this.props.calendarOrigin == 2) ? this.props.groupId : null} // Only group calendar have group id
                />);

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
            showDailyPopUp: false,
            cardSelected: false
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
        this.setState({showDailyPopUp: false, cardSelected: false});
    }

    handleClick() {
        this.setState({showDailyPopUp: true, cardSelected: true});
    }

    isWeekEnd() {
        let currDt = moment(this.props.current_date).format('dddd');
        return (currDt == 'Sunday' || currDt == 'Saturday') ? true : false;
    }


    render() {
        let currDt = moment(this.props.current_date);
        let isCurrentToday = moment().format('YYYY-MM-DD') == moment(this.props.current_date).format('YYYY-MM-DD');
        return(
            <div className={isCurrentToday ? "day-tile selected" : "day-tile"} onDoubleClick={() => this.handleClick()}>
                <div className="day-tile-header selected">
                    <h3 className="date">{Number(currDt.format('DD'))}</h3>
                    <h3 className="day">{currDt.format('dddd')}</h3>
                </div>
                <div className= {this.isWeekEnd() ? "day-tile-body weekend" : "day-tile-body"}>
                    {<DailyEvents daily_events={this.getEventsForTheDay()} isGroupCall={this.props.isGroupCall}/>}
                </div>
                {this.state.showDailyPopUp ?
                    <WeekDayEventPopUp
                        handleClose={this.handleClose.bind(this)}
                        loadData={this.props.loadData}
                        curr_date={currDt}
                        week_startDt={this.props.week_startDt}
                        isGroupCall={this.props.isGroupCall}
                        calendarOrigin={this.props.calendarOrigin}
                        groupId={(this.props.calendarOrigin == 2) ? this.props.groupId : null} // Only group calendar have group id
                    />
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

        this.loggedUser = Session.getSession('prg_lg');
        this.isPending = this.isPending.bind(this);
    }

    isPending(event) {
        if(event.user_id == this.loggedUser.id) {
            return false;
        }
        for(let _suser in event.shared_users) {
            if(event.shared_users[_suser].user_id == this.loggedUser.id && event.shared_users[_suser].shared_status == 1) {
                return true;
            }
        }
        return false;
    }

    createMarkup(htmlScript) {
        return (
        {__html: htmlScript}
        );
    }

    render() {

        let groupedEvents = GroupArray(this.props.daily_events, 'type');
        let _events = null,_todos = null,_tasks = null, _this = this;

        if(typeof groupedEvents['1'] != "undefined"){
            _events = groupedEvents['1'].map(function(event, key){

                let rawDescription = event.description;

                if(rawDescription.hasOwnProperty("entityMap") == false){
                    rawDescription.entityMap = [];
                }

                let contentState = convertFromRaw(event.description);
                let htmlC = stateToHTML(contentState);

                let _text = event.description.blocks[0].text;
                return(
                    <li className={_this.isPending(event) == false ? "events clearfix" : "events pending"} key={key}>
                        {_this.isPending(event) == false ?
                            <p className="item" dangerouslySetInnerHTML={_this.createMarkup(htmlC)}></p>
                            :
                            <p className="item pending" dangerouslySetInnerHTML={_this.createMarkup(htmlC)}></p>
                        }
                    </li>
                );
            });
        }
        if(typeof groupedEvents['2'] != "undefined"){
            _todos = groupedEvents['2'].map(function(event, key){

                let rawDescription = event.description;

                if(rawDescription.hasOwnProperty("entityMap") == false){
                    rawDescription.entityMap = [];
                }

                let contentState = convertFromRaw(event.description);
                let htmlC = stateToHTML(contentState);

                let _text = event.description.blocks[0].text;
                return(
                    <li className={_this.isPending(event) == false ? "events clearfix" : "events pending"} key={key}>
                        {_this.isPending(event) == false ? <p className="item" dangerouslySetInnerHTML={_this.createMarkup(htmlC)}></p> : <p className="item pending" dangerouslySetInnerHTML={_this.createMarkup(htmlC)}></p>}
                    </li>
                );
            });
        }
        if(typeof groupedEvents['3'] != "undefined"){
            _tasks = groupedEvents['3'].map(function(event, key){
                let _text = event.description.blocks[0].text;

                let rawDescription = event.description;

                if(rawDescription.hasOwnProperty("entityMap") == false){
                    rawDescription.entityMap = [];
                }

                let contentState = convertFromRaw(event.description);
                let htmlC = stateToHTML(contentState);

                return(
                    <li className={_this.isPending(event) == false ? "events clearfix" : "events pending"} key={key}>
                        {_this.isPending(event) == false ? <p className="item" dangerouslySetInnerHTML={_this.createMarkup(htmlC)}></p> : <p className="item pending" dangerouslySetInnerHTML={_this.createMarkup(htmlC)}></p>}
                    </li>
                );
            });
        }

        return(
            <div>
                <div className="content-wrapper events">
                    <div className="header-wrapper">
                        <img src="/images/calender/icon-events.png"/>
                            <p>Events</p>
                    </div>
                    <div className="body-wrapper">
                        <ul className="list-items">
                            {_events}
                        </ul>
                    </div>
                </div>
                {this.props.isGroupCall == false ?
                    <div className="content-wrapper todos">
                        <div className="header-wrapper">
                            <img src="/images/calender/icon-to-do.png"/>
                            <p>Todo	&rsquo;s</p>
                        </div>
                        <div className="body-wrapper">
                            <ul className="list-items">
                                {_todos}
                            </ul>
                        </div>
                    </div>
                    :
                    <div className="content-wrapper task">
                        <div className="header-wrapper">
                            <img src="/images/calender/icon-to-do.png"/>
                            <p>Tasks</p>
                        </div>
                        <div className="body-wrapper">
                            <ul className="list-items">
                                {_tasks}
                            </ul>
                        </div>
                    </div>
                }

            </div>
        );
    }
}
