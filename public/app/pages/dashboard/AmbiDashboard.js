import React from 'react';
import Moment from 'moment';
import Session  from '../../middleware/Session';

export default class AmbiDashboard extends React.Component {
	constructor(props) {
		super(props);
		
		this.day = Moment().format("dddd");
        this.month = Moment().format("MMMM");
        this.date = Moment().format("DD");

		this.state = {}
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

		console.log(this.day);
		console.log(this.month);
		console.log(this.date);
		return (
			<section className="dashboard-container">
	            <div className="container">
	                <div className="row">
	                    <section className="time-holder">
	                        <p className="date-text">{this.day}, {this.month} {this.date}</p>
	                        <p className="time-text">10:20</p>
	                    </section>
	                    <section className="greeting-holder">
	                        <p className="greeting-text">{greating}, {session.first_name + " " + session.last_name}!</p>
	                    </section>
	                    <section className="main-task-holder">
	                        <div className="inner-wrapper">
	                            <h3 className="section-title">What is your main focus for today?</h3>
	                            <input type="text" className="form-control task-field" />
	                        </div>
	                    </section>
	                    <section className="quote-holder">
	                        <p className="quote-text">“ The cure to boredom is curiosity. There is no cure for curiosity ”</p>
	                        <p className="quote-author">Dorothy Parker</p>
	                    </section>
	                </div>
	            </div>
	        </section>

		);
	}
}