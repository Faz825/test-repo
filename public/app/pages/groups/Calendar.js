/**
 * The Index view of the caleder section
 */
import React from 'react';
import Session  from '../../middleware/Session';

import DayView from './calendar/DayView';
import YearView from './calendar/YearView';
import MonthView from './calendar/MonthView';
import WeekView from './calendar/WeekView';
import CalenderView from './calendar/MonthView';

import moment from 'moment';

export default class Index extends React.Component {

    constructor(props) {

        let user = Session.getSession('prg_lg');
        if (user == null) {
            window.location.href = "/";
        }

        super(props);
        this.dayViewDate = moment().format('YYYY-MM-DD');
        this.state = {
            current: 'day',
            dayViewDate: moment().format('YYYY-MM-DD'),
            monthViewDate: moment().startOf("day"),
            user: user
        };
        this.relativeView = this.relativeView.bind(this);
        this.loadDayView = this.loadDayView.bind(this);
        this.loadMonthView = this.loadMonthView.bind(this);
    }

    componentDidMount() {
        if (this.props.params.name) {

            $.ajax({
                url: '/calendar/event/get',
                method: "POST",
                data: {eventId: this.props.params.name},
                dataType: "JSON",
                headers: {"prg-auth-header": this.state.user.token},
                success: function (data, text) {
                    if (data.status.code == 200) {
                        var event = data.event;
                        console.log(event.start_date_time);
                        console.log(moment(event.start_date_time).format('YYYY-MM-DD'));
                        this.dayViewDate = moment(event.start_date_time).format('YYYY-MM-DD');
                        this.setState({
                            dayViewDate: moment(event.start_date_time).format('YYYY-MM-DD'),
                            current: 'day'
                        });
                    }
                }.bind(this),
                error: function (request, status, error) {
                    console.log(error);
                }
            });

        }
    }

    relativeView() {

        switch (this.state.current) {
            case 'week':
                return (<WeekView/>);
            case 'day':
                return (<DayView dayDate={this.state.dayViewDate} selectedEvent={null}/>);
            case 'month':
                return (<MonthView ref="MonthViewComponent" selected={this.state.monthViewDate}
                                   setDayView={this.loadDayView}/>);
            case 'year':
                return (<YearView setMonthView={this.loadMonthView.bind(this)}/>);
            default:
                return (<DayView dayDate={this.state.dayViewDate} user={user}/>);
        }
    }

    loadMonthView(date) {
        this.setState({current: 'month', monthViewDate: date});
    }

    loadDayView(view, date) {
        this.setState({current: view, dayViewDate: moment(date).format('YYYY-MM-DD')});
    }

    setView(view) {
        this.setState({current: view});
    }

    render() {

        return (
            <section className="group-content">
                <div className="group-calendar-container">
                    <div className="container">
                        <section className="calender-header">
                            <div className="col-sm-3">
                                <h2>Calendar</h2>
                            </div>
                            <div className="col-sm-6 calender-tab-holder">
                                <div className="inner-wrapper clearfix">
                                    <div
                                        className={ this.state.current == 'day' ? 'calender-type active' : 'calender-type'}
                                        view="day" onClick={() => this.setView('day')}>
                                        <h4>Day</h4>
                                    </div>
                                    <div
                                        className={ this.state.current == 'week' ? 'calender-type active' : 'calender-type'}
                                        view="week" onClick={() => this.setView('week')}>
                                        <h4>Week</h4>
                                    </div>
                                    <div
                                        className={ this.state.current == 'month' ? 'calender-type active' : 'calender-type'}
                                        view="month" onClick={() => this.setView('month')}>
                                        <h4>Month</h4>
                                    </div>
                                    <div
                                        className={ this.state.current == 'year' ? 'calender-type active' : 'calender-type'}
                                        view="year" onClick={() => this.setView('year')}>
                                        <h4>Year</h4>
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-3">
                                <div className="search-folder">
                                    <span className="inner-addon">
                                        <i className="fa fa-search"></i>
                                        <input type="text" className="form-control" placeholder="Search"/>
                                    </span>
                                </div>
                            </div>
                        </section>
                        {this.relativeView()}
                    </div>
                </div>
            </section>
        );
    }
}
