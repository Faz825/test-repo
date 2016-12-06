/**
 * This is call center index component
 */

import React from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import Session from '../../middleware/Session';

export default class Index extends React.Component{
	constructor(props){
		super(props);

		this.state={
			loggedUser : Session.getSession('prg_lg')
		}

		this.userList=[
			{
				letter: "A",
				users: [
					{
						"name" : "Soham",
						"status" : "online",
						"type" : "user"
					},
					{
						"name" : "Khaitan",
						"status" : "offline",
						"type" : "group"
					},
					{
						"name" : "Prasad",
						"status" : "work-mode",
						"type" : "user"
					}
				]
			},
			{
				letter: "B",
				users: [
					{
						"name" : "Soham",
						"status" : "online",
						"type" : "user"
					},
					{
						"name" : "Khaitan",
						"status" : "offline",
						"type" : "user"
					},
					{
						"name" : "Prasad",
						"status" : "work-mode",
						"type" : "group"
					}
				]
			},
			{
				letter: "C",
				users: [
					{
						"name" : "Soham",
						"status" : "online",
						"type" : "group"
					},
					{
						"name" : "Khaitan",
						"status" : "offline",
						"type" : "group"
					}
				]
			}
		]

		this.missedCallList=[
			{
				letter: "A",
				users: [
					{
						"name" : "Soham",
						"status" : "online",
						"calls" : "1",
						"callType" : "phone",
						"time" : "6:45 PM"
					},
					{
						"name" : "Khaitan",
						"status" : "offline",
						"calls" : "2",
						"callType" : "video",
						"time" : "8:02 PM"
					},
					{
						"name" : "Prasad",
						"status" : "work-mode",
						"calls" : "5",
						"callType" : "phone",
						"time" : "2:50 PM"
					}
				]
			},
			{
				letter: "B",
				users: [
					{
						"name" : "Soham",
						"status" : "online",
						"calls" : "1",
						"callType" : "phone",
						"time" : "6:45 PM"
					},
					{
						"name" : "Khaitan",
						"status" : "offline",
						"calls" : "2",
						"callType" : "video",
						"time" : "8:02 PM"
					},
					{
						"name" : "Prasad",
						"status" : "work-mode",
						"calls" : "5",
						"callType" : "phone",
						"time" : "2:50 PM"
					}
				]
			}
		]

	}

	render() {
		return (
			<section className="call-center-container sub-container">
		        <div className="container">
		            <section className="call-center-header">
		                <div className="row">
		                    <div className="col-sm-4">
		                        <h2>Call Center</h2>
		                    </div>
		                    <div className="col-sm-8">
		                        <div className="search-call">
		                        <span className="inner-addon">
		                            <i className="fa fa-search"></i>
		                            <input type="text" className="form-control" placeholder="Search"/>
		                        </span>
		                        </div>
		                        <div className="crt-call">
		                            <button className="btn btn-crt-call">
		                                <i className="fa fa-plus"></i> New Call
		                            </button>
		                        </div>
		                    </div>
		                </div>
		            </section>
		            <section className="call-center-inner-holder">
		                <div className="inner-header">
		                    <div className="row">
		                        <div className="col-sm-6 user-status">
		                            <div className="image-wrapper">
		                                <img src={(this.state.loggedUser.profile_image == "")? "/images/default-profile-pic.png" : this.state.loggedUser.profile_image} />
		                                <span className="status offline"></span>
		                            </div>
		                            <div className="name-wrapper">
		                                <p className="name">{this.state.loggedUser.first_name + " " + this.state.loggedUser.last_name}</p>
		                                <p className="status">Online</p>
		                            </div>
		                        </div>
		                        <div className="col-sm-6">
		                            <div className="row rw-contact-menu">
		                                <div className="col-sm-4">Recent</div>
		                                <div className="col-sm-4 active">Contact</div>
		                                <div className="col-sm-4">Status</div>
		                            </div>
		                            <div className="row rw-contact-menu">
		                                <div className="col-sm-2-4 active">All <span className="selector"></span></div>
		                                <div className="col-sm-2-4">Missed <span className="selector"></span></div>
		                                <div className="col-sm-2-4">Individual <span className="selector"></span></div>
		                                <div className="col-sm-2-4">Groups <span className="selector"></span></div>
		                                <div className="col-sm-2-4">Multi <span className="selector"></span></div>
		                            </div>
		                        </div>
		                    </div>
		                </div>
		                <ContactList userList={this.userList}/>
		            </section>
		        </div>
		    </section>
		);
	}
}

export class ContactList extends React.Component{
	constructor(props){
		super(props);

		this.state={

		}
	}

	render() {
		console.log(this.props.userList);
		let usersList = this.props.userList.map(function(user,key){
			return(
				<div className="contact-group">
	                <p className="group-name">{user.letter}</p>
	                <div className="contact-wrapper">
	                	<User users={user.users} />
	                </div>
	            </div>			
            )
		})
		return (
			<div className="contacts-list">
				{usersList}
            </div>
		);
	}
}

export class User extends React.Component{
	constructor(props){
		super(props);

		this.state={

		}
	}

	render() {
		let users = this.props.users.map(function(user,key){
			return(
				<div className="row contact-item">
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
	                <div className={"col-sm-3 contact-type " + user.type}>
                        <span></span>
                    </div>
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