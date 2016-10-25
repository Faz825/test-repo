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
import ViewButton from './ViewButton';

export default class Index extends React.Component{
    
    constructor(props) {

        super(props);
        this.state = { defaultView : 'day' }; // curently assuming the dafault view is DayView
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
    
    render() {

        // const {
        //     dafaultView,
        //     current
        //     }=this.state;

        return (
            <section className="calender-container">
                <div className="container">
                    <section className="calender-header">
                        <div className="row">
                            <div className="col-sm-2">
                                <h2>Calender</h2>
                            </div>
                            <div className="col-sm-5 col-sm-offset-1">
                                <ViewButton view="day" value="Day" />
                                <ViewButton view="week" value="Week" />
                                <ViewButton view="month" value="Month" />
                                <ViewButton view="year" value="Year" />
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
