/**
 * Week view of the calender
 */
import React from 'react';
import Session from '../../middleware/Session';
import moment from 'moment';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';

export default class WeekView extends React.Component {
    constructor(props) {
        super(props);
        this.state={
            currentWeek:0,
            events:[],
            weekStartDate:'',
            weekEndDate:''
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
        //console.log(postData);

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
        $.ajax({
            url: '/calendar/events/date_range',
            method: "GET",
            dataType: "JSON",
            data: postData,
            headers: { 'prg-auth-header':this.loggedUser.token }
        }).done( function (data, text) {
            if(data.status.code == 200){
                console.log("data loaded 2 ===");
                console.log(data.events);
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

                        <WeekDays week_startDt={this.state.weekStartDate} events={this.state.events}/>

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
            days.push(<LoadDayList current_date={dateObj} weekly_events={this.props.events} key={i}/>);

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
                    <WeekDayEventPopUp handleClose={this.handleClose.bind(this)} curr_date={currDt}/>
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
        this.state = {
            eventType:'EVENT'
        }
    }

    changeEventType(type) {
        this.setState({eventType:type});
    }

    render() {
        return(
            <ModalContainer onClose={this.props.handleClose} zIndex={9999}>
                <ModalDialog onClose={this.props.handleClose} className="modalPopup">
                    <div className="popup-holder">
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
                                    <div className="input" contentEditable="true" placeholder="Type in an Event or a To-do here use # to tag people, @ to set time of the event"></div>
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
                                                <p>A</p>
                                            </button>
                                        </li>
                                        <li>
                                            <button className="menu-ico">
                                                <i className="fa fa-hashtag" aria-hidden="true"></i>
                                            </button>
                                        </li>

                                        <li>
                                            <button className="menu-ico">
                                                <i className="fa fa-at" aria-hidden="true"></i>
                                            </button>
                                        </li>
                                        <li>
                                            <div className="btn-group">
                                                <button type="button" className={"menu-ico-group btn " + (this.state.eventType == 'EVENT' ? "active" : null)} onClick={() => this.changeEventType('EVENT')}>
                                                    Event
                                                </button>
                                                <button type="button" className={"menu-ico-group btn " + (this.state.eventType == 'TODO' ? "active" : null)} onClick={() => this.changeEventType('TODO')}>
                                                    To-do
                                                </button>
                                            </div>

                                        </li>
                                        <li>
                                            <button className="menu-ico-txt btn">
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

