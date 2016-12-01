/**
 * The Index view of the caleder section
 */
import React from 'react';
import {Alert} from '../../config/Alert';
import Session  from '../../middleware/Session';

import MonthView from './MonthView';
import WeekView from './WeekView';
import DayView from './DayView';
import CalenderView from './MonthView';
import moment from 'moment';

export default class Index extends React.Component{

    constructor(props) {

        if(Session.getSession('prg_lg') == null){
            window.location.href = "/";
        }

        super(props);
        this.state = {
            current : 'day',
            dayViewDate:moment().format('YYYY-MM-DD')
        };
        this.relativeView = this.relativeView.bind(this);
        this.loadDayView = this.loadDayView.bind(this);
    }

    relativeView() {

        switch(this.state.current) {
            case 'week':
                return (<WeekView/>);
            case 'day':
                return  (<DayView dayDate={this.state.dayViewDate}/>);
            case 'month':
                return  (<MonthView setDayView={this.loadDayView}/>);
            default:
                return (<DayView dayDate={this.state.dayViewDate}/>);
        }
    }

    loadDayView(view, date) {
        this.setState({current : view, dayViewDate:moment(date).format('YYYY-MM-DD')});
    }

    setView(view) {
        this.setState({ current : view});
    }

    render() {

        return (
            <section className="calender-container">
                <div className="container">
                    <section className="calender-header">
                        <div className="row">
                            <div className="col-sm-3">
                                <h2>Calendar</h2>
                            </div>
                            <div className="col-sm-6 calendar-main-nav">
                                <div className={ this.state.current == 'day' ? 'calender-type active' : 'calender-type'} view="day" onClick={() => this.setView('day')} >
                                    <h4>Day</h4>
                                </div>
                                <div className={ this.state.current == 'week' ? 'calender-type active' : 'calender-type'} view="week" onClick={() => this.setView('week')} >
                                    <h4>Week</h4>
                                </div>
                                <div className={ this.state.current == 'month' ? 'calender-type active' : 'calender-type'} view="month" onClick={() => this.setView('month')} >
                                    <h4>Month</h4>
                                </div>
                            </div>
                            <div className="col-sm-3">
                            </div>
                        </div>
                    </section>
                    {this.relativeView()}
                </div>
            </section>
        );
    }
}
