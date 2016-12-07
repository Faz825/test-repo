/*
* User component for call center
*/

import React from 'react';

export default class User extends React.Component{
	constructor(props){
		super(props);

		this.state={

		}
	}

	render() {
		let _this = this;
		let users = this.props.users.map(function(user,key){
			return(
				<div className="row contact-item recent-item" key={key}>
	                <div className="col-sm-3">
	                    <div className="image-wrapper">
	                        <img src="images/user_1.png"/>
	                        <span className={"status " + user.status}></span>
	                    </div>
	                    <div className="name-wrapper">
	                        <p className="name">{user.name}</p>
	                        <p className="status">{user.status}</p>
	                    </div>
	                </div>
	                {
	                	(_this.props.type == "contact")?
		                <div className={"col-sm-3 contact-type " + user.type}>
	                        <span></span>
	                    </div>
	                    :
	                    null	                	
	                }
	                {
	                	(_this.props.type == "recent")?
	                    <div className={"col-sm-3 contact-type " + user.callStatue}>
	                        <p className="call-count">{user.calls}</p>
	                        <span className={user.callType}></span>
	                        <p className="call-time">{user.time}</p>
	                    </div>
	                    :
	                    null	                	
	                }
	                <div className="col-sm-6">
	                    <div className="call-ico-wrapper">
	                        <button className="call-ico video">
	                            <img src="images/call-center/video-ico.png" />
	                        </button>
	                        <button className="call-ico phone">
	                            <img src="images/call-center/phone-ico.png" />
	                        </button>
	                    </div>
	                </div>
            	</div>		
            )
		});

		return (
			<div>
				{users}
			</div>
		);
	}
}