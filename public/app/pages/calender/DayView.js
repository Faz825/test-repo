/**
 * Day view of the calender
 */
import React from 'react';
import Session from '../../middleware/Session';

export default class DayView extends React.Component {
    constructor(props) {
        super(props);
        let user =  Session.getSession('prg_lg');
        this.state={}
    }

    render() {
        return (
            <div id="pg-day-view-page" className="pg-page">
            </div>
        );
    }
}
