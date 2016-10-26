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

export default class Index extends React.Component{
    
    constructor(props) {

        super(props);
        this.state = { defaultView : 'day', current : 'day' }; // curently assuming the dafault view is DayView
        this.relativeView = this.relativeView.bind(this);
    }

    relativeView() {

        switch(this.state.defaultView) {
            case 'week':
                return (<WeekView/>);
            case 'day':
                return  (<DayView/>);
            case 'month':
                return  (<MonthView/>);
            default:
                return (<DayView/>);
        }
    }

    setView(view) {
        this.setState({ defaultView: view, current : view});
    }
    
    render() {

        return (
            <section className="calender-container">
                <div className="container">
                    <section className="calender-header">
                        <div className="row">
                            <div className="col-sm-2">
                                <h2>Calender</h2>
                            </div>
                            <div className="col-sm-5 col-sm-offset-1">
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
                            <div className="col-sm-4">
                                <div className="search-folder">
                                    <span className="inner-addon">
                                        <i className="fa fa-search"></i>
                                        <input type="text" className="form-control" placeholder="Search"/>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>
                    {this.relativeView()}
                </div>
            </section>
        );
    }
}
