import React from 'react';
import Session  from '../../middleware/Session';

class Dashboard extends React.Component {

	render(){
		let session = Session.getSession('prg_lg');

		return (
			<div className="pg-page" id="pg-dashboard-page">
                <div className="row row-clr" id="pg-dashboard-banner-area">
                    <img src="images/logo-large-middle.png" className="img-responsive center-block" id="pg-dashboard-banner-area-logo-img" />
                    <h2 id="pg-dashboard-banner-area-title-wish">Good Morning, {session.first_name + " " + session.last_name}</h2>
                    <h1 id="pg-dashboard-banner-area-title-what-to-do">What shall we do today?</h1>
                </div>
            </div>
		)
	}


}


export default Dashboard;
