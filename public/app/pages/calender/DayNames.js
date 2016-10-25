/**
 * Day Name Component 
 */
import React from 'react';

export default class DayNames extends React.Component {

    constructor(props) {
        super(props);
        this.state ={
            mini : this.props.mini,
        }; 
    }

    render() {
        console.log(this.state.mini);

        return <div className="week names">
            <span className="day day-names">{ this.state.mini ? "Sun" : "Sunday" }</span>
            <span className="day day-names">{ this.state.mini ? "Mon" : "Monday" }</span>
            <span className="day day-names">{ this.state.mini ? "Tue" : "Tuesday" }</span>
            <span className="day day-names">{ this.state.mini ? "Wed" : "Wednesday" }</span>
            <span className="day day-names">{ this.state.mini ? "Thu" : "Thursday" }</span>
            <span className="day day-names">{ this.state.mini ? "Fri" : "Friday" }</span>
            <span className="day day-names">{ this.state.mini ? "Sat" : "Saturday" }</span>
        </div>;
    }
}
