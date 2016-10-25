/**
 * Mini Calender component
 */
import React from 'react';
import DayNames from './DayNames';
import Week from './Week';
import Session  from '../../middleware/Session';
import moment from 'moment';

export default class MiniCalender extends React.Component {

    constructor(props) {
        super(props);
        let user =  Session.getSession('prg_lg');
        this.state ={
            month:this.props.selected.clone(),
        }; 
    }

    previous() {
        var month = this.state.month;
        month.add(-1, "M");
        this.setState({ month: month });
    }

    next() {
        var month = this.state.month;
        month.add(1, "M");
        this.setState({ month: month });
    }

    select(day) {
        this.props.selected = day.date;
        this.forceUpdate();
    }

    render() {
        return(
            <div className="calender-container mini-calender-container">
                <div className="header">
                    <i className="fa fa-angle-left" onClick={this.previous.bind(this)}></i>
                    {this.renderMonthLabel()}
                    <i className="fa fa-angle-right" onClick={this.next.bind(this)}></i>
                </div>
                <DayNames mini="true" />
                {this.renderWeeks()}
            </div>
        );
    }

    renderWeeks() {
        var weeks = [],
            done = false,
            date = this.state.month.clone().startOf("month").add("w" -1).day("Sunday"),
            monthIndex = date.month(),
            count = 0;

        while (!done) {
            weeks.push(<Week key={date.toString()} date={date.clone()} month={this.state.month} select={this.select.bind(this)} selected={this.props.selected} />);
            date.add(1, "w");
            done = count++ > 2 && monthIndex !== date.month();
            monthIndex = date.month();
        }

        return weeks;
    }

    renderMonthLabel() {
        return(
            <span>{this.state.month.format("MMMM, YYYY")}</span>
        );
    }
}