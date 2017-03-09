import React from 'react';
import schedule from 'node-schedule';
import Moment from 'moment';
import Session  from '../../middleware/Session';

export default class AmbiDashboard extends React.Component {
	constructor(props) {
		super(props);

		this.day = Moment().format("dddd");
        this.month = Moment().format("MMMM");
        this.date = Moment().format("DD");

		this.state = {
			currentTime: Moment().format("h:mm"),
            a: Moment().format("a")
		}

		this.tick = this.tick.bind(this);
		this.tick();

	}

	tick() {
	    let _this = this;
		new schedule.scheduleJob('* * * * *', function () {
		    var now = Moment().format("h:mm"), a = Moment().format("a");
            _this.setState({
				currentTime: now,
                a: a
			});
		});
	}

	render() {
		let session = Session.getSession('prg_lg');

		let date = new Date();
	    let hrs = date.getHours();

	    let greating;

	    if (hrs < 12){
			greating = 'Good Morning';
		}else if (hrs >= 12 && hrs <= 17){
			greating = 'Good Afternoon';
		}else if (hrs >= 17 && hrs <= 24){
			greating = 'Good Evening';
		}

		let imgUrl = "images/bodyBg.jpg";
		const wallpaper = {
				backgroundImage: 'url(' + imgUrl + ')'
			};

		return (
			<section className="dashboard-container">
	            <div className="container">
	                <div className="row">
	                    <section className="time-holder">
	                        <p className="date-text">{this.day}, {this.month} {this.date}</p>
	                        <p className="time-text">
                                <span>{this.state.currentTime}</span>
                                <span className="timeA">{this.state.a}</span>
                            </p>
	                    </section>
	                    <section className="greeting-holder">
	                        <p className="greeting-text">{greating}, {session.first_name}!</p>
	                    </section>
	                    <section className="main-task-holder">
	                        <div className="inner-wrapper">
	                            <h3 className="section-title">what do you want to <span className="larger">get done</span> today?</h3>
	                            <input type="text" className="form-control task-field" />
	                        </div>
	                    </section>
	                    <section className="quote-holder">
	                        <p className="quote-text">“ the way to get started is to quit talking and begin doing ”</p>
                    		<p className="quote-author">Walt Disney</p>
	                    </section>
	                </div>
	            </div>
		        <section className="weather-holder">
		            <div className="weather-icon">
		                <img src="/images/weather-icons/weather-icon.png" alt="rainy" className="img-reponsive" />
		            </div>
		            <p className="weather-text">64°F</p>
		            <p className="weather-location">San francisco</p>
		        </section>
		        <span className="widget-icon"></span>
		        <div className="wallpaper-holder" style={wallpaper}>
					<span className="overlay"></span>
				</div>
				<span className="left-top-shadow"></span>
				<span className="left-btm-shadow"></span>
				<span className="right-top-shadow"></span>
				<span className="middle-shadow"></span>
	        </section>
		);
	}
}