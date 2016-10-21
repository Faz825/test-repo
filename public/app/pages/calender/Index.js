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
        this.state = { view : 'month' };
        this.relativeView = this.relativeView.bind(this);
    }

    relativeView() {

        switch(this.state.view) {
            case 'week':
                return (<WeekView/>);
            case 'day':
                return  (<DayView/>);
            case 'calender':
                return  (<MonthView/>);
            default:
                return (<MonthView/>);
        }
    }
    
    render() {

        return (
            <div id="pg-profile-page" className="loggedUserView pg-page">
                <div className="row row-clr">
                    <div className="container-fluid">
                        <div className="profile-content-container" id="middle-content-wrapper">
                            <div className="col-xs-12">
                                <div>
                                    <h1>Calender</h1>
                                    {this.relativeView()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
