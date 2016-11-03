/**
 * Week Component
 */
import React from 'react';
import moment from 'moment';

export default class Week extends React.Component {

    constructor(props) {
        super(props);
        this.state ={};
    }
    
    render() {
        var days = [],
            date = this.props.date,
            month = this.props.month,
            events = this.props.events;

        for (var i = 0; i < 7; i++) {

            var day = {
                name: date.format("dd").substring(0, 1),
                number: date.date(),
                isCurrentMonth: date.month() === month.month(),
                isToday: date.isSame(new Date(), "day"),
                date: date,
                daily_events:this.getEventsForTheDay(date)
            };

            console.log("what is the key >>" + day.date.toString());

            days.push(<span key={day.date.toString()}
                            className={"day" + (day.isToday ? " today" : "") + (day.isCurrentMonth ? "" : " different-month") + (day.date.isSame(this.props.selected) ? " selected" : "")}
                            onClick={this.props.select.bind(null, day)}>
                        {this.renderNormalDate(day)}
                        <DailyEvents daily_events={day.daily_events} />
                    </span>);
            date = date.clone();
            date.add(1, "d");

        }

        return <div className="week" key={days[0].toString()}>
            {days}
        </div>
    }

    renderNormalDate(day) {
        return(
                <div className="squre">{day.number}</div>
        );
    }

    getEventsForTheDay(date) {
        let _events = [];
        for(let c in this.props.events) {
            let e_date = moment(this.props.events[c].start_date_time).format('YYYY-MM-DD');
            let c_date = date.format('YYYY-MM-DD');

            if(c_date == e_date) {
                _events.push(this.props.events[c]);
            }
        }
        return _events;
    }
}

export class DailyEvents extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let countString = typeof this.props.daily_events != "undefined" ?
            this.props.daily_events.length > 3 ? this.props.daily_events.length - 3 : 0 : 0;
        return(
            <div className="items">
                {countString > 0 ? <span className="event-counts">+{countString} Events</span> : null }
                {this.renderSelectedDate()}
            </div>
        );
    }

    renderSelectedDate() {

        let _events = this.props.daily_events.map(function(event,key){
            let _text = event.description.blocks[0].text;
            return(
                <li className={event.type == 1 ? "color-1" : "color-3"} key={key}>{_text}</li>
            );
        });

        return(
            <div className="event-area">
                <ul>
                    {_events}
                </ul>
            </div>
        );
    }
}
