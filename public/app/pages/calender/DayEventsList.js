/**
 * Day Name Component
 */
import React from 'react';
import moment from 'moment';
import {convertFromRaw, convertToRaw} from 'draft-js';
import {stateToHTML} from 'draft-js-export-html';

import Session from '../../middleware/Session';

export default class DayEventsList extends React.Component {

		constructor(props) {
				let user =  Session.getSession('prg_lg');
        super(props);
        this.state = {
						user : user
				};
    }

    render() {
        let _this = this;
        let  items = this.props.events.map(function(event,key){

            if(event.type == 2) {
                return;
            }

            let rawDescription = event.description;
            if(rawDescription.hasOwnProperty("entityMap") == false){
                rawDescription.entityMap = [];
            }

            let contentState = convertFromRaw(event.description);
            let htmlC = stateToHTML(contentState);
						let usersString = [];
						if(event.shared_users.length > 0 ) {
								usersString = event.shared_users.map(function(user,userKey){
		                return <span className="selected-people" key={userKey}>{user.name}, </span>
		            });
						} else {
								usersString = <span className="people-list">Only me</span>
						}

            return (
                <li key={key}>
                    <i className="fa fa-circle" aria-hidden="true"></i>
                    <div>
                        <div dangerouslySetInnerHTML={{__html: htmlC}} ></div>
                        <div className="people-list-wrapper">
                            <span className="people-list">People on this event : </span>
                            {usersString}
                        </div>
                    </div>
                    <span className="event-time pull-right">{event.event_time}</span>
										{event.user_id == _this.state.user.id ?
												<i onClick={_this.props.clickEdit.bind(_this, event._id)} className="fa fa-pencil pull-right edit-icon" aria-hidden="true"></i>
												: ''
										}
                </li>
            );
        });

        return(
            <ul className="list-unstyled events-list-area-content-list">
                {items}
            </ul>
        )
    }
}
