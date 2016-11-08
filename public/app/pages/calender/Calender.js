/**
 * Calender component
 */
import React from 'react';
import DayNames from './DayNames';
import Week from './Week';
import Session from '../../middleware/Session';
import moment from 'moment';

export default class Calender extends React.Component {

    constructor(props) {
        super(props);
        this.state ={
            month:this.props.selected.clone(),
            events:[]
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
            url: '/calender/get-all-month',
            method: "GET",
            dataType: "JSON",
            data: postData,
            headers: { 'prg-auth-header':this.loggedUser.token }
        }).done( function (data, text) {
            if(data.status.code == 200){
                console.log("data loaded ===");
                console.log(data.events);
                this.setState({events: data.events});
            }
        }.bind(this));
    }

    previous() {
        var month = this.state.month;
        month.add(-1, "M");
        this.setState({ month: month });
        //this.getAllEventsForMonth();
    }

    next() {
        var month = this.state.month;
        month.add(1, "M");
        this.setState({ month: month });
        //this.getAllEventsForMonth();
    }

    select(day) {
        console.log(day.date);
        //alert("selected : " + day.date._d);
        this.props.changeView('day', day.date);
        this.forceUpdate();
    }

    render() {
        return(
            <div className="calender-body">
                <div className="row">
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