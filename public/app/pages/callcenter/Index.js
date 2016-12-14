/**
 * This is call center index component
 */

import React from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import Session from '../../middleware/Session';
import User from "./User";
import CallHandler from './CallHandler';

export default class Index extends React.Component{
	constructor(props){
		super(props);

		this.state={
			loggedUser : Session.getSession('prg_lg'),
			userList : [],
			recentCalls : [],
			userStatus : [],
			activeMainCat: "",
			activeSubCat: ""
		}

		this.loadContactData("recent", "all");
	}

	loadContactData(cat, subCat){
        let userList=[
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
			},
			{
				letter: "D",
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
				letter: "E",
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
				letter: "F",
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
		];

		let userIndividualList=[
			{
				letter: "A",
				users: [
					{
						"name" : "Soham",
						"status" : "online",
						"type" : "user"
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
					}
				]
			},
			{
				letter: "D",
				users: [
					{
						"name" : "Soham",
						"status" : "online",
						"type" : "user"
					},
					{
						"name" : "Prasad",
						"status" : "work-mode",
						"type" : "user"
					}
				]
			},
			{
				letter: "E",
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
					}
				]
			}
		];

		let userGroupList=[
			{
				letter: "A",
				users: [
					{
						"name" : "Khaitan",
						"status" : "offline",
						"type" : "group"
					}
				]
			},
			{
				letter: "B",
				users: [
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
			},
			{
				letter: "D",
				users: [
					{
						"name" : "Khaitan",
						"status" : "offline",
						"type" : "group"
					}
				]
			},
			{
				letter: "E",
				users: [
					{
						"name" : "Prasad",
						"status" : "work-mode",
						"type" : "group"
					}
				]
			},
			{
				letter: "F",
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
		];

		let recentList=[
			{
				users: [
					{
						"name" : "Soham",
						"status" : "online",
						"calls" : "1",
						"callType" : "phone",
						"time" : "6:45 PM",
						"callStatue" : "",
						"type" : "user"
					},
					{
						"name" : "Khaitan",
						"status" : "offline",
						"calls" : "2",
						"callType" : "video",
						"time" : "8:02 PM",
						"callStatue" : "missed",
						"type" : "user"
					},
					{
						"name" : "Prasad",
						"status" : "work-mode",
						"calls" : "5",
						"callType" : "phone",
						"time" : "2:50 PM",
						"callStatue" : "missed",
						"type" : "group"
					},
					{
						"name" : "Soham",
						"status" : "online",
						"calls" : "1",
						"callType" : "phone",
						"time" : "6:45 PM",
						"callStatue" : "",
						"type" : "user"
					},
					{
						"name" : "Khaitan",
						"status" : "offline",
						"calls" : "2",
						"callType" : "video",
						"time" : "8:02 PM",
						"callStatue" : "missed",
						"type" : "group"
					},
					{
						"name" : "Prasad",
						"status" : "work-mode",
						"calls" : "5",
						"callType" : "phone",
						"time" : "2:50 PM",
						"callStatue" : "",
						"type" : "group"
					}
				]
			}
		]

		let recentMissedList=[
			{
				users: [
					{
						"name" : "Khaitan",
						"status" : "offline",
						"calls" : "2",
						"callType" : "video",
						"time" : "8:02 PM",
						"callStatue" : "missed",
						"type" : "user"
					},
					{
						"name" : "Prasad",
						"status" : "work-mode",
						"calls" : "5",
						"callType" : "phone",
						"time" : "2:50 PM",
						"callStatue" : "missed",
						"type" : "group"
					},
					{
						"name" : "Khaitan",
						"status" : "offline",
						"calls" : "2",
						"callType" : "video",
						"time" : "8:02 PM",
						"callStatue" : "missed",
						"type" : "group"
					}
				]
			}
		]

		let recentIndividualList=[
			{
				users: [
					{
						"name" : "Soham",
						"status" : "online",
						"calls" : "1",
						"callType" : "phone",
						"time" : "6:45 PM",
						"callStatue" : "",
						"type" : "user"
					},
					{
						"name" : "Khaitan",
						"status" : "offline",
						"calls" : "2",
						"callType" : "video",
						"time" : "8:02 PM",
						"callStatue" : "missed",
						"type" : "user"
					},
					{
						"name" : "Soham",
						"status" : "online",
						"calls" : "1",
						"callType" : "phone",
						"time" : "6:45 PM",
						"callStatue" : "",
						"type" : "user"
					}
				]
			}
		]

		let recentgroupsList=[
			{
				users: [
					{
						"name" : "Prasad",
						"status" : "work-mode",
						"calls" : "5",
						"callType" : "phone",
						"time" : "2:50 PM",
						"callStatue" : "missed",
						"type" : "group"
					},
					{
						"name" : "Khaitan",
						"status" : "offline",
						"calls" : "2",
						"callType" : "video",
						"time" : "8:02 PM",
						"callStatue" : "missed",
						"type" : "group"
					},
					{
						"name" : "Prasad",
						"status" : "work-mode",
						"calls" : "5",
						"callType" : "phone",
						"time" : "2:50 PM",
						"callStatue" : "",
						"type" : "group"
					}
				]
			}
		]

        $.ajax({
            url: '/folders/get-all',
            method: "GET",
            dataType: "JSON",
            headers: {'prg-auth-header': this.state.loggedUser.token}
        }).done( function (data, text){
            if(data.status.code == 200){
            	if (cat == "contact" && subCat == "all") {
               		this.setState({userList: userList});
            	}else if (cat == "contact" && subCat == "individual") {
               		this.setState({userList: userIndividualList});
            	}else if (cat == "contact" && subCat == "groups") {
               		this.setState({userList: userGroupList});
            	}else if (cat == "recent" && subCat == "all") {
               		this.setState({userList: recentList});
            	}else if (cat == "recent" && subCat == "missed") {
               		this.setState({userList: recentMissedList});
            	}else if (cat == "recent" && subCat == "individual") {
               		this.setState({userList: recentIndividualList});
            	}else if (cat == "recent" && subCat == "groups") {
               		this.setState({userList: recentgroupsList});
            	}else{
            		this.setState({userList: []});
            	}
        		this.setState({activeMainCat : cat, activeSubCat : subCat});
            }
        }.bind(this));

    }

    headerNavRecent(){
    	let mainCat = this.state.activeMainCat;
		let subCat = this.state.activeSubCat;

    	return(
			<div className="row rw-contact-menu">
                <div className={(subCat == "all")? "col-sm-2-4 active" : "col-sm-2-4" } onClick={(event)=>{this.loadContactData("recent", "all")}}>All <span className="selector"></span></div>
                <div className={(subCat == "missed")? "col-sm-2-4 active" : "col-sm-2-4" } onClick={(event)=>{this.loadContactData("recent", "missed")}}>Missed <span className="selector"></span></div>
                <div className={(subCat == "individual")? "col-sm-2-4 active" : "col-sm-2-4" } onClick={(event)=>{this.loadContactData("recent", "individual")}}>Individual <span className="selector"></span></div>
                <div className={(subCat == "groups")? "col-sm-2-4 active" : "col-sm-2-4" } onClick={(event)=>{this.loadContactData("recent", "groups")}}>Groups <span className="selector"></span></div>
                <div className={(subCat == "multi")? "col-sm-2-4 active" : "col-sm-2-4" } onClick={(event)=>{this.loadContactData("recent", "multi")}}>Multi <span className="selector"></span></div>
            </div>
    	)
    }

    headerNavContact(){
    	let mainCat = this.state.activeMainCat;
		let subCat = this.state.activeSubCat;

    	return(
			<div className="row rw-contact-menu">
                <div className={(subCat == "all")? "col-sm-4 active" : "col-sm-4" } onClick={(event)=>{this.loadContactData("contact", "all")}}>All <span className="selector"></span></div>
                <div className={(subCat == "individual")? "col-sm-4 active" : "col-sm-4" } onClick={(event)=>{this.loadContactData("contact", "individual")}}>Individual <span className="selector"></span></div>
                <div className={(subCat == "groups")? "col-sm-4 active" : "col-sm-4" } onClick={(event)=>{this.loadContactData("contact", "groups")}}>Groups <span className="selector"></span></div>
            </div>
    	)
    }

    headerNavStatus(){
    	let mainCat = this.state.activeMainCat;
		let subCat = this.state.activeSubCat;

    	return(
			<div className="row rw-contact-menu">
                <div className={(subCat == "online")? "col-sm-6 active" : "col-sm-6" } onClick={(event)=>{this.loadContactData("status", "online")}}>Online <span className="selector"></span></div>
                <div className={(subCat == "busy")? "col-sm-6 active" : "col-sm-6" } onClick={(event)=>{this.loadContactData("status", "busy")}}>Busy <span className="selector"></span></div>
            </div>
		)
    }

    headerNav(){
    	let mainCat = this.state.activeMainCat;
		let subCat = this.state.activeSubCat;

    	return(
			<div className="inner-header">
                <div className="row">
                    <div className="col-sm-6 user-status">
                        <div className="image-wrapper">
                            <img src={(this.state.loggedUser.profile_image == "")? "/images/default-profile-pic.png" : this.state.loggedUser.profile_image} />
                            <span className="status online"></span>
                        </div>
                        <div className="name-wrapper">
                            <p className="name">{this.state.loggedUser.first_name + " " + this.state.loggedUser.last_name}</p>
                            <p className="status">Online</p>
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="row rw-contact-menu">
                            <div className={(mainCat == "recent")? "col-sm-4 active" : "col-sm-4" } onClick={(event)=>{this.loadContactData("recent", "all")}}>Recent</div>
                            <div className={(mainCat == "contact")? "col-sm-4 active" : "col-sm-4" } onClick={(event)=>{this.loadContactData("contact", "all")}}>Contact</div>
                            <div className={(mainCat == "status")? "col-sm-4 active" : "col-sm-4" } onClick={(event)=>{this.loadContactData("status", "all")}}>Status</div>
                        </div>
                        {(mainCat == "recent")? this.headerNavRecent() : null}
		                {(mainCat == "contact")? this.headerNavContact() : null}
		                {(mainCat == "status")? this.headerNavStatus() : null}
                    </div>
                </div>
            </div>
    	)
    }

	render() {
		let mainCat = this.state.activeMainCat;
		let subCat = this.state.activeSubCat;

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
		                {this.headerNav()}
		                {
		                	(mainCat == "recent")?
		                	<RecentList userList={this.state.userList}/>
		                	:
		                	null		                	
		                }
		                {
		                	(mainCat == "contact")?
		                	<ContactList userList={this.state.userList}/>
		                	:
		                	null		                	
		                }
		            </section>
		        </div>
				<CallHandler/>
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
		let usersList = this.props.userList.map(function(user,key){
			return(
				<div className="contact-group">
	                <p className="group-name">{user.letter}</p>
	                <div className="contact-wrapper">
	                	<User users={user.users} type="contact" key={key} />
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

export class RecentList extends React.Component{
	constructor(props){
		super(props);

		this.state={

		}
	}

	render() {
		let recentList = this.props.userList.map(function(user,key){
			return(
				<User users={user.users} type="recent" key={key} />			
            )
		})
		return (
			<div className="recent-list">
                <div className="list-wrapper">
                	{recentList}
                </div>
            </div>
		);
	}
}



