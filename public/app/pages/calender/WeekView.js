/**
 * Week view of the calender
 */
import React from 'react';
import Session from '../../middleware/Session';
import moment from 'moment-timezone';
import Socket  from '../../middleware/Socket';
import WeekDayEventPopUp from './WeekDayEventPopUp';

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
            //console.log(sunday.toString());
            weeksCount++;
        }
        //console.log(weeksCount);

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
                <div className="row calendar-main-row">
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
            <div className="day-tile" onDoubleClick={() => this.handleClick()}>
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

        // console.log(this.props.daily_events);

        let groupedEvents = GroupArray(this.props.daily_events, 'type');

        let _events = null,_todos = null;

        if(typeof groupedEvents['1'] != "undefined"){
            _events = groupedEvents['1'].map(function(event, key){
                let _text = event.description.blocks[0].text;
                return(
                    <li className="events" key={key}>
                        <p className="item">{_text}</p>
                        {/*<p className="time">1pm</p>*/}
                    </li>
                );
            });
        }
        if(typeof groupedEvents['2'] != "undefined"){
            _todos = groupedEvents['2'].map(function(event, key){
                let _text = event.description.blocks[0].text;
                return(
                    <li className="events" key={key}>
                        <p className="item">{_text}</p>
                        {/*<p className="time">1pm</p>*/}
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
            </div>
        );
    }
}
