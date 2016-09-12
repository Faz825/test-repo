import React from 'react';
import DatePicker from 'react-datepicker';
import Moment from 'moment';

require('react-datepicker/dist/react-datepicker.css');

export default class Index extends React.Component{
    constructor(props){
        super(props);

        this.tPeriod = Moment().format("A");
        this.cH = Moment().format("hh");
        this.cM = Moment().format("mm");

        this.state={
            startDate: Moment(),
            customHours: this.cH,
            customMins: this.cM,
            selectedTimeOpt: "",
            blockedMode: ""
        };

        this.handleChange = this.handleChange.bind(this);
        this.formatDate;

    }

    onTimeChange(e){
        let timeField = e.target.name;
        let timeFieldValue = e.target.value;

        if(timeField == "hours"){
            if(timeFieldValue <= 24){
                timeFieldValue = e.target.value.substring(0,2);
                this.setState({customHours: timeFieldValue});
            }
        }

        if(timeField == "mins"){
            if(timeFieldValue <= 60){
                timeFieldValue = e.target.value.substring(0,2);
                this.setState({customMins: timeFieldValue});
            }
        }

    }

    onTimeSelect(e){
        let checkbox = e.target.value;
        this.setState({selectedTimeOpt : checkbox});
    }

    onBlockedModeSelect(e){
        let checkbox = e.target.value;
        this.setState({blockedMode : checkbox});
    }

    handleChange(date) {
        this.setState({
          startDate: date
        });

        this.formatDate = date.format("MMM DD");
    }

    onWorkModeSet(){
        let data = {
            mode : this.state.blockedMode,
            time : this.state.selectedTimeOpt,
            date : {
                day : this.formatDate,
                hh : this.state.customHours,
                mm : this.state.customMins,
                period : this.refs.timePeriod.value
            }
        }

        console.log(data);
    }

    render(){
        return(
            <div id="pg-workmode-page" className="pg-page">
                <div className="container">
                    <div className="row">
                        <div className="work-mode-container col-sm-10 col-sm-offset-1">
                            <div className="inner-wrapper">
                                <div className="header-section">
                                    <h2 className="section-text">Work Mode</h2>
                                </div>
                                <div className="opt-wrapper">
                                    <div className="opt-block clearfix">
                                        <span className="icon bar-block"></span>
                                        <div className="field-holder">
                                            <input type="checkbox" value="bars" id="bar-block-check" onChange={(event)=>{ this.onBlockedModeSelect(event)}}
                                                checked={(this.state.blockedMode == "bars" || this.state.blockedMode == "all")? true : false } />
                                            <label htmlFor="bar-block-check">Block Right Bar + Bottom Bar</label>
                                        </div>
                                    </div>
                                    <div className="opt-block clearfix">
                                        <span className="icon newsfeed-block"></span>
                                        <div className="field-holder">
                                            <input type="checkbox" value="newsfeed" id="newsfeed-block-check" onChange={(event)=>{ this.onBlockedModeSelect(event)}}
                                                checked={(this.state.blockedMode == "newsfeed" || this.state.blockedMode == "all")? true : false }/>
                                            <label htmlFor="newsfeed-block-check">Block Newsfeed Temporarily</label>
                                        </div>
                                    </div>
                                    <div className="opt-block clearfix">
                                        <span className="icon voice-video-block"></span>
                                        <div className="field-holder">
                                            <input type="checkbox" value="calls" id="calls-block-check" onChange={(event)=>{ this.onBlockedModeSelect(event)}}
                                                checked={(this.state.blockedMode == "calls" || this.state.blockedMode == "all")? true : false }/>
                                            <label htmlFor="calls-block-check">Block Voice / Video Calls</label>
                                        </div>
                                    </div>
                                    <div className="opt-block clearfix">
                                        <span className="icon msg-block"></span>
                                        <div className="field-holder">
                                            <input type="checkbox" value="msg" id="msg-block-check" onChange={(event)=>{ this.onBlockedModeSelect(event)}}
                                                checked={(this.state.blockedMode == "msg" || this.state.blockedMode == "all")? true : false }/>
                                            <label htmlFor="msg-block-check">Block Messages</label>
                                        </div>
                                    </div>
                                    <div className="opt-block clearfix">
                                        <span className="icon notifications-block"></span>
                                        <div className="field-holder">
                                            <input type="checkbox" value="notifications" id="notifications-block-check" onChange={(event)=>{ this.onBlockedModeSelect(event)}}
                                                checked={(this.state.blockedMode == "notifications" || this.state.blockedMode == "all")? true : false }/>
                                            <label htmlFor="notifications-block-check">Block Social Notifications</label>
                                        </div>
                                    </div>
                                    <div className="opt-block clearfix">
                                        <span className="icon all-block"></span>
                                        <div className="field-holder">
                                            <input type="checkbox" value="all" id="all-block-check" onChange={(event)=>{ this.onBlockedModeSelect(event)}}
                                                checked={(this.state.blockedMode == "all")? true : false }/>
                                            <label htmlFor="all-block-check">Block All</label>
                                        </div>
                                    </div>
                                </div>
                                <div className="time-holder">
                                    <div className="inner-wrapper clearfix">
                                        <div className="time-wrapper col-sm-6">
                                            <h3 className="section-title">Set a fixed time for next,</h3>
                                            <div className="opt-holder">
                                                <div className="opt-block clearfix">
                                                    <input type="checkbox" value="30m" id="min-check" onChange={(event)=>{ this.onTimeSelect(event)}}
                                                        checked={(this.state.selectedTimeOpt == "30m")? true : false} />
                                                    <label htmlFor="min-check">30 Mins</label>
                                                </div>
                                                <div className="opt-block clearfix">
                                                    <input type="checkbox" value="1h" id="one-hour-check" onChange={(event)=>{ this.onTimeSelect(event)}}
                                                        checked={(this.state.selectedTimeOpt == "1h")? true : false}/>
                                                    <label htmlFor="one-hour-check">1 Hour</label>
                                                </div>
                                                <div className="opt-block clearfix">
                                                    <input type="checkbox" value="3h" id="three-hour-check" onChange={(event)=>{ this.onTimeSelect(event)}}
                                                        checked={(this.state.selectedTimeOpt == "3h")? true : false}/>
                                                    <label htmlFor="three-hour-check">3 Hour</label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="date-holder col-sm-6">
                                            <h3 className="section-title">Set time till</h3>
                                            <div className="date-field-holder clearfix">
                                                <div className="field-holder">
                                                    <span className="field-label">Day</span>
                                                    <DatePicker
                                                        selected={this.state.startDate}
                                                        onChange={this.handleChange}
                                                        dateFormat="MMM DD"
                                                        className="form-control" />
                                                    <i className="fa fa-calendar" aria-hidden="true"></i>
                                                </div>
                                                <div className="field-holder">
                                                    <span className="field-label">HR</span>
                                                    <input type="number" name="hours" min="1" max="24" className="form-control" value={this.state.customHours} placeholder="Hour" onChange={(event)=>{this.onTimeChange(event)}}/>
                                                </div>
                                                <div className="field-holder">
                                                    <span className="field-label">MIN</span>
                                                    <input type="number" name="mins" min="0" max="60" className="form-control" value={this.state.customMins} placeholder="Minute" onChange={(event)=>{this.onTimeChange(event)}}/>
                                                </div>
                                                <div className="field-holder day-period">
                                                    <span className="field-label">Period</span>
                                                    <select name="periods" className="form-control" ref="timePeriod">
                                                        <option value="am" selected={this.tPeriod == "AM"}>AM</option>
                                                        <option value="pm" selected={this.tPeriod == "PM"}>PM</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="btn-holder">
                                            <button className="btn btn-default set-btn">Set</button>
                                        </div>
                                    </div>
                                </div>
                                <div className="btn-holder">
                                    <button className="btn btn-default submit" onClick={this.onWorkModeSet.bind(this)}>GO!</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
