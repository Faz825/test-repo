/**
 * Calender component
 */
import React from 'react';
import DayNames from './DayNames';
import Week from './Week';
import Session from '../../middleware/Session';
import moment from 'moment';
import WeekDayEventPopUp from './WeekDayEventPopUp';

export default class Calender extends React.Component {

    constructor(props) {
        super(props);
        this.state ={
            month:this.props.selected.clone(),
            events:[],
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
            month : _month,
            year : _year
        };


        $.ajax({
            url: '/calendar/month/all',
            method: "GET",
            dataType: "JSON",
            data: postData,
            headers: { 'prg-auth-header':this.loggedUser.token }
        }).done( function (data, text) {
            if(data.status.code == 200){
                this.setState({events: data.events});
            }
        }.bind(this));
    }

    previous() {
        var month = this.state.month;
        month.add(-1, "M");
        this.setState({ month: month });
        this.getAllEventsForMonth();
    }

    next() {
        var month = this.state.month;
        month.add(1, "M");
        this.setState({ month: month });
        this.getAllEventsForMonth();
    }

    select(day) {
        console.log(day.date);
        //alert("selected : " + day.date._d);
        //this.props.changeView('day', day.date);
        //this.forceUpdate();
        this.setState({showDailyPopUp: true, currDate: moment(day.date)});
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

        return(
            <div className="calender-body">
                <div className="row calendar-main-row">
                    <div className="calender-month-view">

                        <div className="view-header">
                            <div className="col-sm-6 remove-padding">
                                <div className="date-wrapper">
                                    <div className="date-nav">
                                        <i className="fa fa-angle-left" aria-hidden="true" onClick={this.previous.bind(this)}></i>
                                    </div>
                                    <div className="date">
                                        {this.renderMonthNameLabel()}
                                    </div>
                                    <div className="date-nav">
                                        <i className="fa fa-angle-right" aria-hidden="true" onClick={this.next.bind(this)}></i>
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-6 calender-date  remove-padding">
                                {this.renderMonthLabel()}
                            </div>
                        </div>


                        <div className="view-tile-area">
                            <div className="calender-box">
                                <DayNames />
                                {this.renderWeeks()}
                            </div>
                            {this.state.showDailyPopUp ?
                                <WeekDayEventPopUp handleClose={this.handleClose.bind(this)} loadData={this.loadData.bind(this)} curr_date={currDt} week_startDt={currDt}/>
                                : null
                            }
                        </div>

                    </div>
                </div>
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
            weeks.push(<Week key={date.toString()} date={date.clone()} month={this.state.month} select={this.select.bind(this)} selected={this.props.selected} events={this.state.events}/>);
            date.add(1, "w");
            done = count++ > 2 && monthIndex !== date.month();
            monthIndex = date.month();
        }

        return weeks;
    }

    renderMonthLabel() {
        return(
            <p>{this.state.month.format("MMMM, YYYY")}</p>
        );
    }

    renderMonthNameLabel() {
        return(
            <p>{this.state.month.format("MMMM")}</p>
        );
    }
}
