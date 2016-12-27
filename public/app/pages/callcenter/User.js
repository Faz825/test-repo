/*
* User component for call center
*/

import React from 'react';

export default class User extends React.Component{
	constructor(props){
		super(props);

		this.state={

		}

		this.handleClick = this.handleClick.bind(this);
	}

	handleClick(user,callType){
		this.props.onCalling(user,callType);
	}

	render() {
		let _this = this;
		let users = this.props.users.map(function(user,key){
			let mood,call_type;
			switch (user.mood) {
			    case 1:
			        mood = "online";
			        break;
			    case 2:
			        mood = "busy";
			        break;
			    default: 
        			mood = "offline";
			}

			switch (user.contact_type) {
			    case 2:
			        call_type = "group";
			        break;
			    default: 
        			call_type = "user";
			}
			return(
				<div className="row contact-item recent-item" key={key}>
	                <div className="col-sm-3">
	                    <div className="image-wrapper">
	                        <img src={user.images.profile_image.http_url}/>
	                        <span className={"status " + mood}></span>
	                    </div>
	                    <div className="name-wrapper">
	                        <p className="name">{user.first_name + " " + user.last_name}</p>
	                        <p className="status">{mood}</p>
	                    </div>
	                </div>
	                {
	                	(_this.props.type == "contact")?
		                <div className={"col-sm-3 contact-type " + call_type}>
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
	                        <button className="call-ico video" onClick={(event)=>{_this.handleClick(user, "video")}}>
	                            <img src="images/call-center/video-ico.png"/>
	                        </button>
	                        <button className="call-ico phone" onClick={(event)=>{_this.handleClick(user, "phone")}}>
	                            <img src="images/call-center/phone-ico.png"/>
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