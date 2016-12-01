/**
 * Calender component
 */
import React from 'react';
import YearDayNames from './YearDayNames';
import YearWeek from './YearWeek';
import Session from '../../middleware/Session';
import moment from 'moment';
import WeekDayEventPopUp from './WeekDayEventPopUp';

export default class Month extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            month: this.props.selected.clone(),
            events: [],
            showDailyPopUp: false,
            currDate:moment().format('YYYY-MM-DD HH:mm')
        };
        this.loggedUser = Session.getSession('prg_lg');
        this.getAllEventsForMonth();
    }


    getAllEventsForMonth() {
        let _month = this.state.month.format("MM");
        let _year = this.state.month.format("YYYY");
        let postData = {
            month: _month,
            year: _year
        };

        $.ajax({
            url: '/calendar/month/all',
            method: "GET",
            dataType: "JSON",
            data: postData,
            headers: {'prg-auth-header': this.loggedUser.token}
        }).done(function (data, text) {
            if (data.status.code == 200) {
                this.setState({events: data.events});
            }
        }.bind(this));
    }

    select(day) {
        this.props.changeView(day.date);
        this.forceUpdate();
    }

    handleClick() {
        this.setState({showDailyPopUp: true});
    }

    handleClose() {
        this.setState({showDailyPopUp: false});
    }

    loadData() {
        this.getAllEventsForMonth();
    }

    render() {
        let currDt = moment(this.state.currDate);
        return (
        <div className="month-tile">
            <div className="mini-calendar">
                <div className="header">
                    <span>{this.state.month.format("MMMM")}</span>
                </div>
                <YearDayNames />
                {this.renderWeeks()}
            </div>
            {this.state.showDailyPopUp ?
                <WeekDayEventPopUp handleClose={this.handleClose.bind(this)} loadData={this.loadData.bind(this)} curr_date={currDt} week_startDt={currDt}/>
                : null
            }
        </div>
        );
    }

    renderWeeks() {
        var weeks = [],
            done = false,
            date = this.state.month.clone().startOf("month").add("w" - 1).day("Sunday"),
            monthIndex = date.month(),
            count = 0;

        while (!done) {
            weeks.push(<YearWeek key={date.toString()} date={date.clone()} month={this.state.month}
                             select={this.select.bind(this)} selected={this.props.selected}
                             events={this.state.events}/>);
            date.add(1, "w");
            done = count++ > 2 && monthIndex !== date.month();
            monthIndex = date.month();
        }

        return weeks;
    }
}