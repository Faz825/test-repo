/**
 * Day Name Component 
 */
import React from 'react';

export default class DayNames extends React.Component {

    render() {
        return <div className="week names">
            <span className="day day-names">Sunday</span>
            <span className="day day-names">Monday</span>
            <span className="day day-names">Tuesday</span>
            <span className="day day-names">Wednesday</span>
            <span className="day day-names">Thursday</span>
            <span className="day day-names">Friday</span>
            <span className="day day-names">Saturday</span>
        </div>;
    }
}
